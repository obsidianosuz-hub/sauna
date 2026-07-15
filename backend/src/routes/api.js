import { Router } from 'express';
import prisma from '../config/prisma.js';
import { pinLogin, superAdminLogin } from '../controllers/authController.js';
import { getAuditLogs } from '../controllers/auditController.js';
import { 
  createSession, 
  getActiveSessions, 
  addBarOrder, 
  checkoutSession, 
  completeCleaning,
  getRooms,
  createRoom,
  getSessionHistory,
  transferSessionRoom
} from '../controllers/sessionController.js';
import { 
  createExpense, 
  createProductReturn, 
  getFinancialMetrics 
} from '../controllers/financeController.js';
import { 
  getEmployees, 
  createEmployee, 
  faceIdCheckIn, 
  updateKpiScore,
  updateEmployee,
  deleteEmployee,
  saveAttendanceStatus
} from '../controllers/employeeController.js';
import { 
  getPartners, 
  createPartner, 
  supplyProducts 
} from '../controllers/partnerController.js';
import { verifyToken, authorize } from '../middlewares/auth.js';
import { scanProductBarcode, updateProductBarcode, createProductWithBarcode } from '../controllers/productController.js';
import { getReservations, createReservation, updateReservationStatus } from '../controllers/reservationController.js';
import { handleRfidTap, updateRfidPort } from '../services/rfidService.js';
import { getCameraTokens, generateCameraToken, revokeCameraToken } from '../controllers/cameraTokenController.js';
import { 
  getCameraScripts, 
  addCameraScript, 
  deleteCameraScript, 
  integrateScriptToCamera 
} from '../controllers/cameraScriptController.js';

const router = Router();

// ================= AUTH ROUTES =================
router.post('/auth/login/pin', pinLogin);
router.post('/auth/login/super', superAdminLogin);

// ================= SESSION & NFC ROUTES =================
// Both cashier and super_admin can check active sessions and check in/out
router.post('/sessions', verifyToken, authorize(['cashier', 'manager']), createSession);
router.get('/sessions/active', verifyToken, authorize(['cashier', 'manager']), getActiveSessions);
router.get('/sessions/history', verifyToken, authorize(['cashier', 'manager']), getSessionHistory);
router.post('/sessions/checkout', verifyToken, authorize(['cashier', 'manager']), checkoutSession);
router.post('/sessions/transfer', verifyToken, authorize(['cashier', 'manager']), transferSessionRoom);
router.post('/sessions/cleaning/complete', verifyToken, authorize(['cashier', 'manager', 'cleaner']), completeCleaning);

// ================= AUDIT LOGS ROUTES =================
router.get('/audit-logs', verifyToken, authorize(['manager']), getAuditLogs);

// NFC scanner at the bar adds orders (both cashier and barman can do this)
router.post('/sessions/bar-order', verifyToken, authorize(['cashier', 'barman', 'manager']), addBarOrder);

// ================= RESERVATION ROUTES =================
router.get('/reservations', verifyToken, authorize(['cashier', 'manager']), getReservations);
router.post('/reservations', verifyToken, authorize(['cashier', 'manager']), createReservation);
router.post('/reservations/:id/status', verifyToken, authorize(['cashier', 'manager']), updateReservationStatus);

// ================= ROOMS ROUTES =================
router.get('/rooms', verifyToken, authorize(['cashier', 'manager']), getRooms);
router.post('/rooms/add', verifyToken, authorize(['manager']), createRoom);

// ================= FINANCE & INVENTORY ROUTES =================
// Only manager and super admin can view financial metrics or register expenses/returns
router.post('/finance/expense', verifyToken, authorize(['manager']), createExpense);
router.post('/finance/return', verifyToken, authorize(['manager']), createProductReturn);
router.get('/finance/metrics', verifyToken, authorize(['manager']), getFinancialMetrics);
router.post('/products/scan', verifyToken, authorize(['cashier', 'barman', 'manager']), scanProductBarcode);
router.post('/products/update-barcode', verifyToken, authorize(['manager']), updateProductBarcode);
router.post('/products/add-with-barcode', verifyToken, authorize(['manager']), createProductWithBarcode);

// ================= EMPLOYEE & ATTENDANCE ROUTES =================
router.get('/employees', verifyToken, authorize(['manager']), getEmployees);
router.post('/employees/add', verifyToken, authorize(['manager']), createEmployee);
router.put('/employees/:id', verifyToken, authorize(['manager']), updateEmployee);
router.delete('/employees/:id', verifyToken, authorize(['manager']), deleteEmployee);
router.post('/employees/attendance', verifyToken, authorize(['manager']), saveAttendanceStatus);
router.post('/employees/kpi', verifyToken, authorize(['manager']), updateKpiScore);

// Face ID security camera endpoint (can be called by local cameras/external clients with system token or bypassed for demo)
router.post('/employees/face-id-scan', faceIdCheckIn);

// ================= PARTNER ROUTES =================
router.get('/partners', verifyToken, authorize(['manager']), getPartners);
router.post('/partners/add', verifyToken, authorize(['manager']), createPartner);
router.post('/partners/supply', verifyToken, authorize(['manager']), supplyProducts);

// ================= CAMERA API TOKENS ROUTES =================
router.get('/camera-tokens', verifyToken, authorize(['manager']), getCameraTokens);
router.post('/camera-tokens/generate', verifyToken, authorize(['manager']), generateCameraToken);
router.delete('/camera-tokens/:id', verifyToken, authorize(['manager']), revokeCameraToken);

// ================= CAMERA SCRIPTS LIBRARY ROUTES =================
router.get('/camera-scripts', verifyToken, authorize(['manager']), getCameraScripts);
router.post('/camera-scripts/add', verifyToken, authorize(['manager']), addCameraScript);
router.delete('/camera-scripts/:id', verifyToken, authorize(['manager']), deleteCameraScript);
router.post('/camera-tokens/integrate-script', verifyToken, authorize(['manager']), integrateScriptToCamera);
router.get('/visitors/logs', verifyToken, authorize(['manager']), async (req, res) => {
  try {
    const logs = await prisma.visitorLog.findMany({
      orderBy: { detectedAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Get Visitor Logs Error:', error);
    return res.status(500).json({ success: false, message: 'Tashriflar tarixini olishda xatolik yuz berdi.' });
  }
});

// ================= RFID SIMULATION ROUTES =================
router.post('/rfid/simulate-tap', async (req, res) => {
  const { nfcUid } = req.body;
  if (!nfcUid) {
    return res.status(400).json({ success: false, message: 'Card UID is required.' });
  }
  try {
    await handleRfidTap(nfcUid);
    return res.status(200).json({ success: true, message: `RFID Card ${nfcUid} simulated tap processed successfully.` });
  } catch (err) {
    console.error('RFID Simulation Error:', err);
    return res.status(500).json({ success: false, message: 'Error processing simulation tap.', error: err.message });
  }
});

router.post('/rfid/set-port', verifyToken, authorize(['manager']), (req, res) => {
  const { port } = req.body;
  if (!port) {
    return res.status(400).json({ success: false, message: 'Port kiritilmadi.' });
  }
  updateRfidPort(port);
  return res.status(200).json({ success: true, message: `RFID datchik faol ulanish porti ${port} ga muvaffaqiyatli o'zgartirildi.` });
});

export default router;
