import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-sauna';

// Verify token middleware
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Autentifikatsiya talab etiladi. Token topilmadi.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Yaroqsiz yoki muddati o\'tgan token.' });
  }
};

// RBAC Role middleware generator
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi aniqlanmadi.' });
    }

    const { role } = req.user;

    // Super Admin has all rights
    if (role === 'super_admin') {
      return next();
    }

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: 'Ushbu bo\'limga kirish huquqingiz yo\'q (Ruxsat etilmagan rol).' 
    });
  };
};
