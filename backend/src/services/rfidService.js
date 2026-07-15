import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import prisma from '../config/prisma.js';
import { calculateHistoryRoomCharge } from './billingService.js';

let serialPortInstance = null;

let currentPortName = 'COM3';
let reconnectTimeout = null;

export const startRfidListener = () => {
  initializePort();
};

const initializePort = () => {
  const baudRate = 9600;

  console.log(`[RFID Service] Initializing listener on port ${currentPortName}...`);

  try {
    serialPortInstance = new SerialPort({
      path: currentPortName,
      baudRate: baudRate,
      autoOpen: false
    });

    const parser = serialPortInstance.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    serialPortInstance.open((err) => {
      if (err) {
        console.warn(`[RFID Service] Failed to open port ${currentPortName}: ${err.message}. Retrying in 15 seconds...`);
        reconnectTimeout = setTimeout(initializePort, 15000);
        return;
      }

      console.log(`[RFID Service] Successfully connected to RFID Reader on ${currentPortName}!`);
    });

    serialPortInstance.on('close', () => {
      console.warn(`[RFID Service] Port ${currentPortName} closed. Retrying in 15 seconds...`);
      reconnectTimeout = setTimeout(initializePort, 15000);
    });

    serialPortInstance.on('error', (err) => {
      console.error(`[RFID Service] Error on port ${currentPortName}:`, err.message);
    });

    parser.on('data', async (data) => {
      const rawUid = data.toString().trim();
      if (!rawUid) return;

      // Clean UID: extract alphanumeric characters, remove space, dash, colon
      const uidClean = rawUid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (uidClean.length < 4) return; // skip noise

      console.log(`[RFID Tap] Card UID detected: ${uidClean} (raw: "${rawUid}")`);

      try {
        await handleRfidTap(uidClean);
      } catch (err) {
        console.error('[RFID Tap] Error processing tap:', err);
      }
    });

  } catch (err) {
    console.error(`[RFID Service] Exception during initialization: ${err.message}. Retrying in 15 seconds...`);
    reconnectTimeout = setTimeout(initializePort, 15000);
  }
};

export const handleRfidTap = async (nfcUid) => {
  // 1. Ensure Room 8 exists
  let room = await prisma.room.findFirst({
    where: {
      OR: [
        { id: 8 },
        { name: { contains: '8' } }
      ]
    }
  });

  if (!room) {
    room = await prisma.room.create({
      data: {
        id: 8,
        name: 'Maxsus Hammom #8 (RFID)',
        type: 'sauna',
        pricePerHour: 150000,
        status: 'free'
      }
    });
  }

  // 2. Ensure NFC Wristband exists for this card
  let wristband = await prisma.nFCWristband.findUnique({
    where: { nfcUid }
  });

  if (!wristband) {
    wristband = await prisma.nFCWristband.create({
      data: { nfcUid, status: 'free' }
    });
  }

  // 3. Process Toggle
  // Check if Room 8 has an active session
  const activeSession = await prisma.session.findFirst({
    where: {
      roomId: room.id,
      paymentStatus: 'pending'
    },
    include: {
      roomHistory: true
    }
  });

  if (activeSession) {
    // ROOM 8 IS BOOKED -> CHECKOUT / RELEASE ROOM
    console.log(`[RFID Toggle] Room 8 is currently active (Session ID: ${activeSession.id}). Initiating auto-checkout...`);

    // Calculate billing
    const billing = calculateHistoryRoomCharge(activeSession.roomHistory);
    let ordersTotal = 0;
    
    // Include orders if any
    const orders = await prisma.order.findMany({
      where: { sessionId: activeSession.id },
      include: { product: true }
    });
    
    orders.forEach(order => {
      ordersTotal += order.product.price * order.quantity;
    });

    const totalDue = billing.roomCharge + ordersTotal;

    await prisma.$transaction(async (tx) => {
      // Close active history
      const activeHistory = activeSession.roomHistory.find(h => h.endTime === null);
      if (activeHistory) {
        await tx.sessionRoomHistory.update({
          where: { id: activeHistory.id },
          data: { endTime: new Date() }
        });
      }

      // Close session and set total amount paid via cash
      await tx.session.update({
        where: { id: activeSession.id },
        data: {
          endTime: new Date(),
          totalAmount: totalDue,
          cashAmount: totalDue,
          cardAmount: 0,
          paymentStatus: 'paid'
        }
      });

      // Free the room (set status to free instead of cleaning so it's instantly bookable by tap again!)
      await tx.room.update({
        where: { id: room.id },
        data: { status: 'free' }
      });

      // Free the wristband
      await tx.nFCWristband.update({
        where: { id: activeSession.wristbandId },
        data: {
          status: 'free',
          currentSessionId: null
        }
      });
    });

    console.log(`[RFID Toggle] Auto-checkout completed. Room 8 is now FREE. Total Paid: ${totalDue} UZS.`);
  } else {
    // ROOM 8 IS FREE -> BOOK ROOM
    console.log(`[RFID Toggle] Room 8 is currently free. Initiating auto-checkin...`);

    // Ensure the wristband is not busy elsewhere
    if (wristband.status !== 'free') {
      console.warn(`[RFID Toggle] Wristband ${nfcUid} is active in another session. Freeing it first...`);
      await prisma.nFCWristband.update({
        where: { id: wristband.id },
        data: { status: 'free', currentSessionId: null }
      });
    }

    await prisma.$transaction(async (tx) => {
      // Create session for Room 8
      const newSession = await tx.session.create({
        data: {
          roomId: room.id,
          wristbandId: wristband.id,
          initialPayment: 0.0,
          customerName: 'RFID NFC Mehmon',
          paymentStatus: 'pending',
          startTime: new Date()
        }
      });

      // Create history entry
      await tx.sessionRoomHistory.create({
        data: {
          sessionId: newSession.id,
          roomId: room.id,
          pricePerHour: room.pricePerHour,
          startTime: new Date()
        }
      });

      // Set Room 8 to active
      await tx.room.update({
        where: { id: room.id },
        data: { status: 'active' }
      });

      // Set Wristband to active
      await tx.nFCWristband.update({
        where: { id: wristband.id },
        data: {
          status: 'active',
          currentSessionId: newSession.id
        }
      });
    });

    console.log(`[RFID Toggle] Auto-checkin completed. Room 8 is now ACTIVE.`);
  }
};

export const updateRfidPort = (newPort) => {
  if (!newPort || newPort === currentPortName) return;

  console.log(`[RFID Service] Switching active port from ${currentPortName} to ${newPort}...`);

  // Clear any pending reconnect timeouts
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Close active connection
  if (serialPortInstance) {
    // Remove listeners to prevent automatic retry on close event
    serialPortInstance.removeAllListeners('close');
    serialPortInstance.removeAllListeners('error');
    
    if (serialPortInstance.isOpen) {
      serialPortInstance.close((err) => {
        if (err) console.error('[RFID Service] Error closing port:', err.message);
        currentPortName = newPort;
        initializePort();
      });
    } else {
      currentPortName = newPort;
      initializePort();
    }
  } else {
    currentPortName = newPort;
    initializePort();
  }
};
