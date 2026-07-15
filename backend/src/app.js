import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { startRfidListener } from './services/rfidService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for RFID client and Vue frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Sauna System API is running smoothly.' });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resurs topilmadi.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Serverda ichki xatolik yuz berdi.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start RFID Serial Listener
startRfidListener();

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Sauna Management API Server started!`);
  console.log(` Port: http://localhost:${PORT}`);
  console.log(` Time: ${new Date().toISOString()}`);
  console.log(`===============================================`);
});

export default app;
