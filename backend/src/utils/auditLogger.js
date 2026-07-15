import prisma from '../config/prisma.js';

export const logAudit = async (req, action, details) => {
  try {
    // Extract user information if authenticated
    const userName = req.user?.name || 'Sistema';
    const userPin = req.user?.pinCode || null;

    await prisma.auditLog.create({
      data: {
        action,
        details,
        userPin,
        userName
      }
    });
  } catch (error) {
    console.error('Audit Logging Failed:', error);
  }
};
