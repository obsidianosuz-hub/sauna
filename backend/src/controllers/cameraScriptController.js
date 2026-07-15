import prisma from '../config/prisma.js';
import { logAudit } from '../utils/auditLogger.js';

// 1. Get all saved camera scripts
export const getCameraScripts = async (req, res) => {
  try {
    const scripts = await prisma.cameraScript.findMany({
      include: {
        cameraTokens: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: scripts });
  } catch (error) {
    console.error('Get Camera Scripts Error:', error);
    return res.status(500).json({ success: false, message: 'Ssenariylar ro\'yxatini olishda xatolik yuz berdi.' });
  }
};

// 2. Add a new script code to library database
export const addCameraScript = async (req, res) => {
  const { title, description, code } = req.body;

  if (!title || !code) {
    return res.status(400).json({ success: false, message: 'Ssenariy nomi va kodi kiritilishi shart.' });
  }

  try {
    const script = await prisma.cameraScript.create({
      data: {
        title,
        description,
        code
      }
    });

    await logAudit(req, 'script_create', `Yangi kamera ssenariy kodi saqlandi: "${title}".`);

    return res.status(201).json({
      success: true,
      message: 'Ssenariy muvaffaqiyatli saqlandi.',
      data: script
    });
  } catch (error) {
    console.error('Add Camera Script Error:', error);
    return res.status(500).json({ success: false, message: 'Ssenariyni saqlashda xatolik yuz berdi.' });
  }
};

// 3. Delete a script
export const deleteCameraScript = async (req, res) => {
  const { id } = req.params;

  try {
    // Unlink cameras first
    await prisma.cameraToken.updateMany({
      where: { scriptId: Number(id) },
      data: { scriptId: null }
    });

    await prisma.cameraScript.delete({
      where: { id: Number(id) }
    });

    await logAudit(req, 'script_delete', `Kamera ssenariy kodi o'chirildi (ID: ${id}).`);

    return res.status(200).json({ success: true, message: 'Ssenariy muvaffaqiyatli o\'chirildi.' });
  } catch (error) {
    console.error('Delete Camera Script Error:', error);
    return res.status(500).json({ success: false, message: 'Ssenariyni o\'chirishda xatolik yuz berdi.' });
  }
};

// 4. Integrate / Map script to camera
export const integrateScriptToCamera = async (req, res) => {
  const { cameraId, scriptId } = req.body;

  if (!cameraId) {
    return res.status(400).json({ success: false, message: 'Kamera ID si kiritilishi shart.' });
  }

  try {
    const camera = await prisma.cameraToken.update({
      where: { id: Number(cameraId) },
      data: {
        scriptId: scriptId ? Number(scriptId) : null
      },
      include: {
        script: true
      }
    });

    await logAudit(
      req, 
      'camera_integrate_script', 
      scriptId 
        ? `Kamera "${camera.name}" maxsus "${camera.script.title}" ssenariysiga integratsiya qilindi.`
        : `Kamera "${camera.name}" ssenariy integratsiyasi bekor qilindi.`
    );

    return res.status(200).json({
      success: true,
      message: scriptId ? 'Kamera ssenariy bilan muvaffaqiyatli integratsiya qilindi.' : 'Ssenariy integratsiyasi bekor qilindi.',
      data: camera
    });
  } catch (error) {
    console.error('Integrate Script Error:', error);
    return res.status(500).json({ success: false, message: 'Integratsiya qilishda xatolik yuz berdi.' });
  }
};
