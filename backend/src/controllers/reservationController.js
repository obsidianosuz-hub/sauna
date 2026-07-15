import prisma from '../config/prisma.js';
import { logAudit } from '../utils/auditLogger.js';

// 1. Get all reservations (optionally filtered by roomId)
export const getReservations = async (req, res) => {
  const { roomId } = req.query;
  try {
    const where = {};
    if (roomId) {
      where.roomId = Number(roomId);
    }
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        room: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Get Reservations Error:', error);
    return res.status(500).json({ success: false, message: 'Navbatlar ro\'yxatini yuklashda xatolik yuz berdi.' });
  }
};

// 2. Create a new reservation (checking for scheduling conflicts!)
export const createReservation = async (req, res) => {
  const { roomId, customerName, phoneNumber, startTime, endTime } = req.body;

  if (!roomId || !customerName || !phoneNumber || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Barcha ma\'lumotlar (xona, mijoz ismi, telefon, kirish va chiqish vaqti) kiritilishi shart.' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return res.status(400).json({ success: false, message: 'Chiqish vaqti kirish vaqtidan keyin bo\'lishi kerak.' });
  }

  try {
    // Check if there's any active or pending reservation for this room that overlaps with the requested timeslot
    const overlapping = await prisma.reservation.findFirst({
      where: {
        roomId: Number(roomId),
        status: 'pending',
        OR: [
          {
            startTime: {
              lt: end
            },
            endTime: {
              gt: start
            }
          }
        ]
      }
    });

    if (overlapping) {
      const timeStrStart = new Date(overlapping.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeStrEnd = new Date(overlapping.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return res.status(400).json({
        success: false,
        message: `Kechirasiz, ushbu vaqt oralig'i allaqachon band qilingan! (Mijoz: ${overlapping.customerName}, Vaqt: ${timeStrStart} - ${timeStrEnd})`
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        roomId: Number(roomId),
        customerName,
        phoneNumber,
        startTime: start,
        endTime: end,
        status: 'pending'
      },
      include: {
        room: true
      }
    });

    await logAudit(req, 'reservation_create', `Yangi navbat yozildi: ${reservation.room.name} xonasiga mijoz ${customerName} (tel: ${phoneNumber}) soat ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ga band qildi.`);

    return res.status(201).json({
      success: true,
      message: 'Navbat (bron) muvaffaqiyatli ro\'yxatga olindi.',
      data: reservation
    });
  } catch (error) {
    console.error('Create Reservation Error:', error);
    return res.status(500).json({ success: false, message: 'Navbatni saqlashda xatolik yuz berdi.' });
  }
};

// 3. Update reservation status (e.g. check-in or cancel)
export const updateReservationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "active", "cancelled", "completed"

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status ko\'rsatilishi shart.' });
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(id) },
      include: { room: true }
    });

    const updated = await prisma.reservation.update({
      where: { id: Number(id) },
      data: { status }
    });

    if (status === 'cancelled' && reservation) {
      await logAudit(req, 'reservation_cancel', `Navbat bekor qilindi: ${reservation.room.name} xonasidagi mijoz ${reservation.customerName} brondi bekor qilindi.`);
    } else {
      await logAudit(req, 'reservation_status', `Navbat holati yangilandi: ID ${id} holati "${status}" ga o'zgartirildi.`);
    }

    return res.status(200).json({
      success: true,
      message: 'Navbat holati muvaffaqiyatli yangilandi.',
      data: updated
    });
  } catch (error) {
    console.error('Update Reservation Status Error:', error);
    return res.status(500).json({ success: false, message: 'Navbat holatini yangilashda xatolik yuz berdi.' });
  }
};
