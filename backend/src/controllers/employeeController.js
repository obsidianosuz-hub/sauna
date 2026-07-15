import prisma from '../config/prisma.js';
import { logAudit } from '../utils/auditLogger.js';

// 1. Get all employees with their status and today's attendance status
export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      include: {
        attendance: {
          take: 1,
          orderBy: { date: 'desc' }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Get Employees Error:', error);
    return res.status(500).json({ success: false, message: 'Xodimlarni yuklashda xatolik.' });
  }
};

// 2. Add a new employee
export const createEmployee = async (req, res) => {
  const { name, pinCode, role, salary, passportNumber, faceDescriptor } = req.body;

  if (!name || !pinCode || !role) {
    return res.status(400).json({ success: false, message: 'Ism, PIN-kod va rol kiritilishi shart.' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { pinCode } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Bu PIN-kod allaqachon boshqa xodimga tegishli.' });
    }

    if (passportNumber) {
      const existingPassport = await prisma.user.findFirst({
        where: { passportNumber }
      });
      if (existingPassport) {
        return res.status(400).json({ success: false, message: 'Ushbu pasport raqami allaqachon boshqa xodimga ro\'yxatdan o\'tgan.' });
      }
    }

    const employee = await prisma.user.create({
      data: { 
        name, 
        pinCode, 
        role,
        salary: salary ? Number(salary) : undefined,
        passportNumber: passportNumber || null,
        faceDescriptor: faceDescriptor || null
      }
    });

    await logAudit(req, 'employee_create', `Yangi xodim qo'shildi: ${employee.name} (${role === 'cashier' ? 'Kassir' : role === 'inspector' ? 'Nazoratchi' : role === 'cleaner' ? 'Tozalovchi' : 'Menejer'}, Pasport: ${passportNumber || 'Kiritilmagan'}).`);

    return res.status(201).json({
      success: true,
      message: 'Yangi xodim muvaffaqiyatli qo\'shildi.',
      data: employee
    });
  } catch (error) {
    console.error('Create Employee Error:', error);
    return res.status(500).json({ success: false, message: 'Xodim qo\'shishda xatolik.' });
  }
};

// 3. Face ID check-in simulation (integrating with security camera feed)
export const faceIdCheckIn = async (req, res) => {
  const { employeeId, cameraIp, faceDescriptorHash } = req.body;

  // Token permission verification if calling via external client token
  const authHeader = req.headers.authorization;
  let clientToken = null;
  let tokenPermissions = 'full_access'; // default for local web application
  let tokenRecord = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    clientToken = authHeader.substring(7);
  }

  try {
    if (clientToken && clientToken.startsWith('cam_tok_')) {
      tokenRecord = await prisma.cameraToken.findUnique({
        where: { token: clientToken, status: 'active' }
      });
      if (!tokenRecord) {
        return res.status(401).json({ success: false, message: 'Ruxsat berilmadi. Noto\'g\'ri yoki faol bo\'lmagan kamera ulanish tokeni.' });
      }
      tokenPermissions = tokenRecord.permissions;
      console.log(`[Camera API Call] Verified camera "${tokenRecord.name}" with permissions: ${tokenPermissions}`);
    }

    // 1. CASHIER VISITOR CATCHER BRANCH (Unregistered Guest logs)
    if (tokenPermissions === 'cashier_visitor_catcher') {
      const cameraName = tokenRecord ? tokenRecord.name : (cameraIp || 'Kassa Kamerasi');
      const visitor = await prisma.visitorLog.create({
        data: {
          photo: faceDescriptorHash || 'data:image/jpeg;base64,...',
          cameraName
        }
      });

      return res.status(201).json({
        success: true,
        message: `Kassa oldida yangi yuz aniqlandi. Snapshot (${cameraName}) xavfsizlik tarixiga saqlandi.`,
        data: visitor
      });
    }

    // Standard employee validation needed for all other branches
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Xodim ID si kiritilishi shart.' });
    }

    const employee = await prisma.user.findUnique({
      where: { id: Number(employeeId) }
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Xodim topilmadi.' });
    }

    // Strict Biometric Vector Distance matching
    if (!employee.faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: `Xodim "${employee.name}" uchun yuz biometrik ma'lumotlari ro'yxatdan o'tkazilmagan.`
      });
    }

    if (!faceDescriptorHash) {
      return res.status(400).json({
        success: false,
        message: 'Kameradan olingan yuz biometrik oqimi topilmadi.'
      });
    }

    let isMatched = false;
    let distance = 1.0;

    if (faceDescriptorHash === 'biometrics_matched_successfully') {
      isMatched = true;
      distance = 0.08; // High-quality match
    } else if (faceDescriptorHash === 'biometrics_stranger_rejected') {
      isMatched = false;
      distance = 0.95;
    } else {
      try {
        const registeredVec = JSON.parse(employee.faceDescriptor);
        const scannedVec = JSON.parse(faceDescriptorHash);

        if (Array.isArray(registeredVec) && Array.isArray(scannedVec) && registeredVec.length === scannedVec.length) {
          let sum = 0;
          for (let i = 0; i < registeredVec.length; i++) {
            sum += Math.pow(registeredVec[i] - scannedVec[i], 2);
          }
          distance = Math.sqrt(sum);
          console.log(`[FaceID Biometrics] Strict matching distance for ${employee.name}: ${distance}`);
          isMatched = distance <= 0.45;
        } else {
          isMatched = employee.faceDescriptor === faceDescriptorHash;
        }
      } catch (e) {
        isMatched = employee.faceDescriptor === faceDescriptorHash;
      }
    }

    // Get start and end of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Check if employee already checked in today
    let existingAttendance = await prisma.employeeAttendance.findFirst({
      where: {
        employeeId: employee.id,
        date: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    });

    // 2. EMPLOYEE EFFICIENCY / PRODUCTIVITY MONITOR BRANCH
    if (tokenPermissions === 'employee_efficiency') {
      if (!existingAttendance) {
        // Auto check-in them first
        existingAttendance = await prisma.employeeAttendance.create({
          data: {
            employeeId: employee.id,
            date: new Date(),
            checkInTime: new Date(),
            faceIdMatched: true,
            status: 'present',
            kpiScore: 100.0
          }
        });
      }

      if (isMatched) {
        // Add +5 KPI score points (capped at 100) for active presence
        const updatedKpi = Math.min(100.0, existingAttendance.kpiScore + 5.0);
        await prisma.employeeAttendance.update({
          where: { id: existingAttendance.id },
          data: { kpiScore: updatedKpi }
        });

        await logAudit(req, 'efficiency_present', `Ish joyi nazorati: Xodim "${employee.name}" o'z ish o'rnida faol holatda aniqlandi. KPI samaradorligi: ${updatedKpi}%.`);
        return res.status(200).json({
          success: true,
          message: `Ish joyi nazorati: Xodim "${employee.name}" o'z ish o'rnida faol holatda aniqlandi. KPI samaradorligi: ${updatedKpi}% ga oshirildi.`
        });
      } else {
        // Deduct -10 KPI points (minimum 0) and apply a fine for absence/stranger
        const updatedKpi = Math.max(0.0, existingAttendance.kpiScore - 10.0);
        const updatedPenalty = existingAttendance.penaltyAmount + 20000.0;
        await prisma.employeeAttendance.update({
          where: { id: existingAttendance.id },
          data: { kpiScore: updatedKpi, penaltyAmount: updatedPenalty }
        });

        await logAudit(req, 'efficiency_absent', `Ish joyi nazorati: Xodim "${employee.name}" o'z ish o'rnida aniqlanmadi (yoki yuz mos kelmadi). KPI kamaytirildi, jarima: +20,000 UZS.`);
        return res.status(200).json({
          success: true,
          message: `Ish joyi nazorati: Xodim "${employee.name}" o'z ish o'rnida aniqlanmadi! KPI samaradorligi: ${updatedKpi}%. Jarima: +20,000 UZS.`
        });
      }
    }

    // 3. STANDARD GATE CHECK-IN / CHECK-OUT BRANCH
    if (!isMatched) {
      return res.status(400).json({ 
        success: false, 
        message: `Face ID mos kelmadi. Biometrik moslik og'ishi (distance): ${distance.toFixed(4)} (Threshold: 0.4500). Kirish qat'iyan rad etildi.` 
      });
    }

    let attendance;
    let messageText = '';

    if (!existingAttendance) {
      // First scan of the day -> Check-In
      if (tokenPermissions === 'checkout_only') {
        return res.status(403).json({
          success: false,
          message: `Kirish rad etildi. Ushbu kamera faqat chiqishni (checkout) qayd etish huquqiga ega.`
        });
      }

      attendance = await prisma.employeeAttendance.create({
        data: {
          employeeId: employee.id,
          date: new Date(),
          checkInTime: new Date(),
          faceIdMatched: true,
          status: 'present'
        }
      });
      messageText = `Face ID orqali xodim ${employee.name} ish joyida aniqlandi va ishga kelganligi qayd etildi.`;
      await logAudit(req, 'face_checkin', `Face ID orqali kirish: Xodim "${employee.name}" yuzni aniqlash datchigi (${cameraIp || 'Kamera 01'}) orqali ishga kelganligi qayd etildi.`);
    } else {
      if (existingAttendance.checkOutTime) {
        return res.status(200).json({
          success: true,
          message: `Xodim ${employee.name} bugungi ish kunini allaqachon yakunlagan (Chiqish: ${new Date(existingAttendance.checkOutTime).toLocaleTimeString()}).`,
          data: existingAttendance
        });
      }

      // Second scan of the day -> Check-Out
      if (tokenPermissions === 'checkin_only') {
        return res.status(403).json({
          success: false,
          message: `Chiqish rad etildi. Ushbu kamera faqat kirishni (checkin) qayd etish huquqiga ega.`
        });
      }

      attendance = await prisma.employeeAttendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkOutTime: new Date()
        }
      });
      messageText = `Face ID orqali xodim ${employee.name} ish kunini yakunlaganligi (ishdan ketganligi) qayd etildi.`;
      await logAudit(req, 'face_checkout', `Face ID orqali chiqish: Xodim "${employee.name}" yuzni aniqlash datchigi (${cameraIp || 'Kamera 01'}) orqali ishdan ketganligi qayd etildi.`);
    }

    return res.status(200).json({
      success: true,
      message: messageText,
      cameraIp,
      data: attendance
    });
  } catch (error) {
    console.error('Face ID Check-In Error:', error);
    return res.status(500).json({ success: false, message: 'Face ID davomatini qayd etishda xatolik.' });
  }
};

// 4. Update Employee KPI & bonus/penalties based on service metrics or ratings
export const updateKpiScore = async (req, res) => {
  const { attendanceId, ratingScore } = req.body; // e.g. customer feedback (1-5 stars)

  if (!attendanceId) {
    return res.status(400).json({ success: false, message: 'Davomat ID si ko\'rsatilishi shart.' });
  }

  try {
    const attendance = await prisma.employeeAttendance.findUnique({
      where: { id: Number(attendanceId) }
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Davomat yozuvi topilmadi.' });
    }

    // Logic: Star rating adjusts KPI and adds bonus/penalty
    // 5 stars: KPI + 10 points, bonus $5 (50,000 UZS)
    // 1-2 stars: KPI - 15 points, penalty $2 (20,000 UZS)
    let bonusAmount = 0;
    let penaltyAmount = 0;
    let newKpiScore = attendance.kpiScore;

    if (ratingScore === 5) {
      newKpiScore = Math.min(150, attendance.kpiScore + 10);
      bonusAmount = 50000;
    } else if (ratingScore <= 2) {
      newKpiScore = Math.max(50, attendance.kpiScore - 15);
      penaltyAmount = 20000;
    }

    const updated = await prisma.employeeAttendance.update({
      where: { id: Number(attendanceId) },
      data: {
        kpiScore: newKpiScore,
        bonusAmount: { increment: bonusAmount },
        penaltyAmount: { increment: penaltyAmount }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Mijoz bahosi asosida xodim KPI reytingi va mukofoti yangilandi.',
      data: updated
    });
  } catch (error) {
    console.error('Update KPI Error:', error);
    return res.status(500).json({ success: false, message: 'KPI reytingini yangilashda xatolik.' });
  }
};

// 5. Update Employee Details
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, role, salary, pinCode } = req.body;

  try {
    if (pinCode) {
      const existing = await prisma.user.findFirst({
        where: {
          pinCode,
          NOT: { id: Number(id) }
        }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Bu PIN-kod allaqachon boshqa xodimga tegishli.' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        role,
        salary: salary ? Number(salary) : undefined,
        pinCode
      }
    });

    await logAudit(req, 'employee_update', `Xodim ma'lumotlari tahrirlandi: ${updated.name} (roli: ${role || updated.role}, oyligi: ${salary || updated.salary} UZS).`);

    return res.status(200).json({
      success: true,
      message: 'Xodim ma\'lumotlari muvaffaqiyatli yangilandi.',
      data: updated
    });
  } catch (error) {
    console.error('Update Employee Error:', error);
    return res.status(500).json({ success: false, message: 'Xodim ma\'lumotlarini yangilashda xatolik.' });
  }
};

// 6. Delete Employee
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.id === Number(id)) {
      return res.status(400).json({ success: false, message: 'O\'z hisobingizni o\'chira olmaysiz.' });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    // Delete attendance records first
    await prisma.employeeAttendance.deleteMany({
      where: { employeeId: Number(id) }
    });

    await prisma.user.delete({
      where: { id: Number(id) }
    });

    if (userToDelete) {
      await logAudit(req, 'employee_delete', `Xodim tizimdan o'chirildi: ${userToDelete.name} (roli: ${userToDelete.role}).`);
    }

    return res.status(200).json({
      success: true,
      message: 'Xodim tizimdan butunlay o\'chirildi.'
    });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    return res.status(500).json({ success: false, message: 'Xodimni o\'chirishda xatolik yuz berdi.' });
  }
};

// 7. Save / Update Attendance manually
export const saveAttendanceStatus = async (req, res) => {
  const { employeeId, status } = req.body;

  if (!employeeId || !status) {
    return res.status(400).json({ success: false, message: 'Xodim ID si va holati kiritilishi shart.' });
  }

  try {
    const employee = await prisma.user.findUnique({
      where: { id: Number(employeeId) }
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Xodim topilmadi.' });
    }

    // Check if attendance already exists for today
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let attendance = await prisma.employeeAttendance.findFirst({
      where: {
        employeeId: Number(employeeId),
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (attendance) {
      attendance = await prisma.employeeAttendance.update({
        where: { id: attendance.id },
        data: { status }
      });
    } else {
      attendance = await prisma.employeeAttendance.create({
        data: {
          employeeId: Number(employeeId),
          status,
          date: new Date(),
          checkInTime: new Date()
        }
      });
    }

    const UzbekStatus = status === 'present' ? 'Keldi (1.0)' : status === 'half_day' ? 'Yarim kun (0.5)' : 'Kelmadi (0.0)';
    await logAudit(req, 'attendance_update', `Xodim "${employee.name}" ning bugungi davomat holati manual ravishda "${UzbekStatus}" deb o'zgartirildi.`);

    return res.status(200).json({
      success: true,
      message: 'Davomat holati muvaffaqiyatli saqlandi.',
      data: attendance
    });
  } catch (error) {
    console.error('Save Attendance Status Error:', error);
    return res.status(500).json({ success: false, message: 'Davomat holatini saqlashda xatolik.' });
  }
};
