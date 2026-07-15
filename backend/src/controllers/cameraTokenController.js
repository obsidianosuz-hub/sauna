import prisma from '../config/prisma.js';
import crypto from 'crypto';
import { logAudit } from '../utils/auditLogger.js';

// 1. Get all camera tokens
export const getCameraTokens = async (req, res) => {
  try {
    const tokens = await prisma.cameraToken.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    console.error('Get Camera Tokens Error:', error);
    return res.status(500).json({ success: false, message: 'Tokenlarni olishda xatolik yuz berdi.' });
  }
};

// 2. Generate a new secure token
export const generateCameraToken = async (req, res) => {
  const { name, purpose, permissions, connectionType, connectionAddress, customCode } = req.body;

  if (!name || !purpose || !permissions) {
    return res.status(400).json({ success: false, message: 'Nomi, maqsadi va ruxsatlar kiritilishi shart.' });
  }

  try {
    const secureToken = 'cam_tok_' + crypto.randomBytes(16).toString('hex');

    const cameraToken = await prisma.cameraToken.create({
      data: {
        name,
        purpose,
        permissions,
        connectionType: connectionType || 'USB',
        connectionAddress: connectionAddress || 'local_webcam',
        token: secureToken,
        status: 'active',
        customCode: customCode || null
      }
    });

    await logAudit(req, 'token_generate', `Yangi kamera ulanish tokeni yaratildi: "${name}" (${permissions}, Turi: ${connectionType || 'USB'}).`);

    return res.status(201).json({
      success: true,
      message: 'Token muvaffaqiyatli generatsiya qilindi.',
      data: cameraToken
    });
  } catch (error) {
    console.error('Generate Camera Token Error:', error);
    return res.status(500).json({ success: false, message: 'Token yaratishda xatolik yuz berdi.' });
  }
};

// 3. Revoke/delete a token
export const revokeCameraToken = async (req, res) => {
  const { id } = req.params;

  try {
    const tokenRecord = await prisma.cameraToken.findUnique({
      where: { id: Number(id) }
    });

    if (!tokenRecord) {
      return res.status(404).json({ success: false, message: 'Token topilmadi.' });
    }

    await prisma.cameraToken.delete({
      where: { id: Number(id) }
    });

    await logAudit(req, 'token_revoke', `Kamera ulanish tokeni o'chirildi: "${tokenRecord.name}".`);

    return res.status(200).json({
      success: true,
      message: 'Token muvaffaqiyatli bekor qilindi (o\'chirildi).'
    });
  } catch (error) {
    console.error('Revoke Camera Token Error:', error);
    return res.status(500).json({ success: false, message: 'Tokenni bekor qilishda xatolik yuz berdi.' });
  }
};
