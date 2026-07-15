import prisma from '../config/prisma.js';

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 200 // Cap at last 200 logs for efficiency
    });

    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    return res.status(500).json({ success: false, message: 'Tizim amallari tarixini yuklashda xatolik yuz berdi.' });
  }
};
