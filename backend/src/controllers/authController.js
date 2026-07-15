import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-sauna';

// PIN code login for standard staff (cashier, barman, cleaner, inspector, manager)
export const pinLogin = async (req, res) => {
  const { pinCode } = req.body;

  if (!pinCode || pinCode.length < 4 || pinCode.length > 8) {
    return res.status(400).json({ 
      success: false, 
      message: 'PIN-kod 4 tadan 8 tagacha raqamdan iborat bo\'lishi lozim.' 
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { pinCode }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Noto\'g\'ri PIN-kod.' 
      });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Tizimga muvaffaqiyatli kirildi.',
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('PIN Login Error:', error);
    return res.status(500).json({ success: false, message: 'Serverda xatolik yuz berdi.' });
  }
};

// Super Admin Gmail + Password Login
export const superAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gmail va parol kiritilishi shart.' 
    });
  }

  try {
    // Check for admin/cashier credentials. Default password is 12121212
    const isDefaultAdmin = email === 'admin@sauna.uz' && password === '12121212';
    const isDefaultCashier = email === 'cashier@sauna.uz' && password === '12121212';
    
    let adminUser = null;
    if (isDefaultAdmin) {
      adminUser = { id: 0, name: 'Tizim Super Admini', role: 'super_admin' };
    } else if (isDefaultCashier) {
      const dbCashier = await prisma.user.findFirst({ where: { role: 'cashier' } });
      adminUser = dbCashier || { id: 1, name: 'Malika Karimova', role: 'cashier' };
    } else {
      // Find in DB
      const dbUser = await prisma.user.findFirst({
        where: {
          role: 'super_admin',
          name: email
        }
      });

      if (dbUser && password === dbUser.pinCode) {
        adminUser = dbUser;
      }
    }

    if (!adminUser) {
      return res.status(401).json({ 
        success: false, 
        message: 'Gmail yoki parol noto\'g\'ri.' 
      });
    }

    const token = jwt.sign(
      { id: adminUser.id, name: adminUser.name, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Tizimga muvaffaqiyatli kirildi.',
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Super Admin Login Error:', error);
    return res.status(500).json({ success: false, message: 'Serverda xatolik yuz berdi.' });
  }
};
