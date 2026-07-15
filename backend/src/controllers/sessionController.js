import prisma from '../config/prisma.js';
import { calculateRoomCharge, calculateHistoryRoomCharge, validateMixedPayment } from '../services/billingService.js';
import { logAudit } from '../utils/auditLogger.js';

// 1. Create a new check-in Session
export const createSession = async (req, res) => {
  const { roomId, wristbandId, initialPayment, bookedHours, customerName, phoneNumber } = req.body;

  if (!roomId || !wristbandId) {
    return res.status(400).json({ success: false, message: 'Xona va RFID bilaguzuk ko\'rsatilishi shart.' });
  }

  try {
    // Check if room is free
    const room = await prisma.room.findUnique({ where: { id: Number(roomId) } });
    if (!room || room.status !== 'free') {
      return res.status(400).json({ success: false, message: 'Xona band yoki tozalash jarayonida.' });
    }

    // Check if wristband is free
    const wristband = await prisma.nFCWristband.findUnique({ where: { id: Number(wristbandId) } });
    if (!wristband || wristband.status !== 'free') {
      return res.status(400).json({ success: false, message: 'RFID bilaguzuk band yoki yo\'qotilgan.' });
    }

    // Start database transaction
    const session = await prisma.$transaction(async (tx) => {
      // Create session
      const newSession = await tx.session.create({
        data: {
          roomId: Number(roomId),
          wristbandId: Number(wristbandId),
          initialPayment: Number(initialPayment || 0.0),
          customerName: customerName || null,
          phoneNumber: phoneNumber || null,
          paymentStatus: 'pending',
          startTime: new Date()
        }
      });

      // Create initial room history entry
      await tx.sessionRoomHistory.create({
        data: {
          sessionId: newSession.id,
          roomId: Number(roomId),
          pricePerHour: room.pricePerHour,
          startTime: new Date()
        }
      });

      // Update room status
      await tx.room.update({
        where: { id: Number(roomId) },
        data: { status: 'active' }
      });

      // Update wristband status and map to active session
      await tx.nFCWristband.update({
        where: { id: Number(wristbandId) },
        data: {
          status: 'active',
          currentSessionId: newSession.id
        }
      });

      return newSession;
    });

    await logAudit(req, 'checkin', `Mijoz (${customerName || 'Nomalum'}, RFID: ${wristband.nfcUid.split('-').pop()}) ${room.name} xonasiga kiritildi. Depozit: ${initialPayment || 0} UZS.`);

    return res.status(201).json({
      success: true,
      message: 'Mijoz seansi muvaffaqiyatli boshlandi.',
      session
    });
  } catch (error) {
    console.error('Create Session Error:', error);
    return res.status(500).json({ success: false, message: 'Seansni boshlashda xatolik yuz berdi.' });
  }
};

// 2. Get all active sessions with dynamic pricing & warnings
export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { paymentStatus: 'pending' },
      include: {
        room: true,
        wristband: true,
        roomHistory: true,
        orders: {
          include: {
            product: true
          }
        }
      }
    });

    const activeSessionsWithCalculations = sessions.map(session => {
      // Calculate room charge dynamically across all rooms visited
      const billing = calculateHistoryRoomCharge(session.roomHistory);
      
      // Calculate orders sum
      let ordersTotal = 0;
      session.orders.forEach(order => {
        ordersTotal += order.product.price * order.quantity;
      });

      const totalDue = billing.roomCharge + ordersTotal;

      return {
        ...session,
        elapsedMinutes: billing.elapsedMinutes,
        roomCharge: billing.roomCharge,
        ordersTotal,
        totalDue,
        isOverage: false,
        warningActive: false
      };
    });

    return res.status(200).json({
      success: true,
      data: activeSessionsWithCalculations
    });
  } catch (error) {
    console.error('Get Active Sessions Error:', error);
    return res.status(500).json({ success: false, message: 'Faol seanslarni olishda xatolik yuz berdi.' });
  }
};

// 3. Scan RFID Wristband for Bar Purchase
export const addBarOrder = async (req, res) => {
  const { nfcUid, productId, quantity } = req.body;

  if (!nfcUid || !productId) {
    return res.status(400).json({ success: false, message: 'RFID UID va mahsulot ID si ko\'rsatilishi shart.' });
  }

  try {
    // Find active wristband
    const wristband = await prisma.nFCWristband.findUnique({
      where: { nfcUid }
    });

    if (!wristband || wristband.status !== 'active' || !wristband.currentSessionId) {
      return res.status(400).json({ success: false, message: 'Faol seansga bog\'lanmagan yoki yaroqsiz bilaguzuk.' });
    }

    // Find Product & check stock
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi.' });
    }

    const qty = Number(quantity || 1);
    if (product.type === 'sale' && product.stockQuantity < qty) {
      return res.status(400).json({ success: false, message: 'Omborda yetarli mahsulot yo\'q.' });
    }

    // Transaction to add order and update stock
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.sessionOrder.create({
        data: {
          sessionId: wristband.currentSessionId,
          productId: product.id,
          quantity: qty,
          orderType: product.type === 'rent' ? 'item_rental' : 'bar_sale'
        }
      });

      if (product.type === 'sale') {
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              decrement: qty
            }
          }
        });
      }

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      message: 'Buyurtma muvaffaqiyatli qo\'shildi va ombordan chegirildi.',
      data: order
    });
  } catch (error) {
    console.error('Add Bar Order Error:', error);
    return res.status(500).json({ success: false, message: 'Bar buyurtmasini qo\'shishda xatolik.' });
  }
};

// 4. Checkout and Close Session (Mixed Payments)
export const checkoutSession = async (req, res) => {
  const { sessionId, cashAmount, cardAmount } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Seans ID si kiritilishi shart.' });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        room: true,
        roomHistory: true,
        orders: {
          include: { product: true }
        }
      }
    });

    if (!session || session.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Seans topilmadi yoki allaqachon to\'langan.' });
    }

    // Dynamic hourly billing calculation across all rooms visited
    const billing = calculateHistoryRoomCharge(session.roomHistory);

    let ordersTotal = 0;
    session.orders.forEach(order => {
      ordersTotal += order.product.price * order.quantity;
    });

    const totalDue = billing.roomCharge + ordersTotal;

    // Validate payment matching
    const cash = Number(cashAmount || 0);
    const card = Number(cardAmount || 0);
    const paymentCheck = validateMixedPayment(totalDue, cash, card);

    if (!paymentCheck.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: `To'lov summasi mos kelmadi. Jami: ${totalDue}, Kiritildi: ${cash + card}. Farq: ${paymentCheck.difference}` 
      });
    }

    // Complete transaction
    await prisma.$transaction(async (tx) => {
      // 1. Close active room history
      const activeHistory = session.roomHistory.find(h => h.endTime === null);
      if (activeHistory) {
        await tx.sessionRoomHistory.update({
          where: { id: activeHistory.id },
          data: { endTime: new Date() }
        });
      }

      // 2. Close session
      await tx.session.update({
        where: { id: session.id },
        data: {
          endTime: new Date(),
          totalAmount: totalDue,
          cashAmount: cash,
          cardAmount: card,
          paymentStatus: 'paid'
        }
      });

      // 3. Set Room status to cleaning
      await tx.room.update({
        where: { id: session.roomId },
        data: { status: 'cleaning' }
      });

      // 4. Free Wristband
      await tx.nFCWristband.update({
        where: { id: session.wristbandId },
        data: {
          status: 'free',
          currentSessionId: null
        }
      });
    });

    await logAudit(req, 'checkout', `${session.room.name} xonasi yopildi. Jami hisob: ${totalDue} UZS (Naqd: ${cash} UZS, Karta: ${card} UZS).`);

    return res.status(200).json({
      success: true,
      message: 'Mijoz to\'lovi muvaffaqiyatli qabul qilindi. Xona tozalash holatiga o\'tkazildi.',
      totalDue,
      cash,
      card
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    return res.status(500).json({ success: false, message: 'Hisob-kitob qilishda xatolik yuz berdi.' });
  }
};

// 5. Complete room cleaning (change status from cleaning to free)
export const completeCleaning = async (req, res) => {
  const { roomId } = req.body;

  try {
    const room = await prisma.room.update({
      where: { id: Number(roomId) },
      data: { status: 'free' }
    });

    await logAudit(req, 'cleaning_complete', `${room.name} xonasi tozalab bo'lindi va bo'sh holatga o'tkazildi.`);

    return res.status(200).json({
      success: true,
      message: 'Xonani tozalash yakunlandi. Xona endi bo\'sh va foydalanishga tayyor.',
      room
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Xona holatini o\'zgartirishda xatolik.' });
  }
};

// 6. Get all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany();
    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Xonalarni yuklashda xatolik yuz berdi.' });
  }
};

// 7. Create a new room manually
export const createRoom = async (req, res) => {
  const { name, type, pricePerHour } = req.body;

  if (!name || !type || !pricePerHour) {
    return res.status(400).json({ success: false, message: 'Barcha maydonlarni to\'ldirish shart.' });
  }

  try {
    const newRoom = await prisma.room.create({
      data: {
        name,
        type,
        pricePerHour: Number(pricePerHour),
        status: 'free'
      }
    });

    await logAudit(req, 'add_room', `Yangi xona qo'shildi: ${newRoom.name} (${newRoom.type === 'hamom' ? 'Hammom' : 'Sauna'}, ${pricePerHour} UZS/soat).`);

    return res.status(201).json({
      success: true,
      message: 'Yangi xona muvaffaqiyatli qo\'shildi.',
      data: newRoom
    });
  } catch (error) {
    console.error('Create Room Error:', error);
    return res.status(500).json({ success: false, message: 'Xonani qo\'shishda xatolik yuz berdi.' });
  }
};

// 8. Get all completed/paid sessions (History logs)
export const getSessionHistory = async (req, res) => {
  try {
    const history = await prisma.session.findMany({
      where: { paymentStatus: 'paid' },
      include: {
        room: true,
        wristband: true
      },
      orderBy: {
        endTime: 'desc'
      }
    });

    const formattedHistory = history.map(session => {
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : new Date();
      const diffMs = end - start;
      const diffMins = Math.round(diffMs / 1000 / 60);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      const durationStr = `${hours > 0 ? hours + ' soat ' : ''}${mins} daq`;

      return {
        id: session.id,
        nfcUid: session.wristband.nfcUid,
        roomName: session.room.name,
        roomType: session.room.type === 'hamom' ? 'Hammom' : 'Sauna',
        customerName: session.customerName || 'Nomalum',
        phoneNumber: session.phoneNumber || 'Nomalum',
        startTime: session.startTime,
        endTime: session.endTime,
        duration: durationStr,
        cashAmount: session.cashAmount,
        cardAmount: session.cardAmount,
        totalAmount: session.totalAmount
      };
    });

    return res.status(200).json({ success: true, data: formattedHistory });
  } catch (error) {
    console.error('Get Session History Error:', error);
    return res.status(500).json({ success: false, message: 'Seanslar tarixini yuklashda xatolik yuz berdi.' });
  }
};

// 7. Transfer Session Room
export const transferSessionRoom = async (req, res) => {
  const { sessionId, targetRoomId } = req.body;

  if (!sessionId || !targetRoomId) {
    return res.status(400).json({ success: false, message: 'Seans ID va maqsadli xona ko\'rsatilishi shart.' });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        room: true,
        roomHistory: true
      }
    });

    if (!session || session.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Faol seans topilmadi.' });
    }

    if (session.roomId === Number(targetRoomId)) {
      return res.status(400).json({ success: false, message: 'Mijoz allaqachon shu xonada joylashgan.' });
    }

    const targetRoom = await prisma.room.findUnique({
      where: { id: Number(targetRoomId) }
    });

    if (!targetRoom || targetRoom.status !== 'free') {
      return res.status(400).json({ success: false, message: 'Tanlangan xona bo\'sh emas yoki tozalash jarayonida.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.room.update({
        where: { id: session.roomId },
        data: { status: 'cleaning' }
      });

      await tx.room.update({
        where: { id: targetRoom.id },
        data: { status: 'active' }
      });

      const activeHist = session.roomHistory.find(h => h.endTime === null);
      if (activeHist) {
        await tx.sessionRoomHistory.update({
          where: { id: activeHist.id },
          data: { endTime: new Date() }
        });
      }

      await tx.sessionRoomHistory.create({
        data: {
          sessionId: session.id,
          roomId: targetRoom.id,
          pricePerHour: targetRoom.pricePerHour,
          startTime: new Date()
        }
      });

      await tx.session.update({
        where: { id: session.id },
        data: { roomId: targetRoom.id }
      });
    });

    await logAudit(req, 'room_transfer', `Mijoz "${session.customerName || 'Nomalum'}" ${session.room.name} xonasidan ${targetRoom.name} xonasiga ko'chirildi. Yangi soatlik narxi: ${targetRoom.pricePerHour.toLocaleString()} UZS.`);

    return res.status(200).json({
      success: true,
      message: 'Mijoz yangi xonaga muvaffaqiyatli ko\'chirildi.',
      data: {
        sessionId: session.id,
        fromRoomName: session.room.name,
        toRoomName: targetRoom.name
      }
    });
  } catch (error) {
    console.error('Transfer Session Room Error:', error);
    return res.status(500).json({ success: false, message: 'Xonani ko\'chirishda xatolik yuz berdi.' });
  }
};
