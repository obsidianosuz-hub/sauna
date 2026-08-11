# Sauna Management System with Face ID & RFID integration

A modern, highly performant web application for managing saunas, bathhouses, customers, staff, and automated hardware integrations.

## Key Features
1. **Surveillance & Face ID Monitoring**: Real-time biometrics matching for check-ins, automated employee KPI scoring, stranger/visitor snap logging.
2. **Camera Script Integration**: Reusable database scripts dynamically mapped to active camera tokens to run automated behaviors.
3. **RFID & COM Port Switching**: Dynamic serial listener setup to capture card taps and automatically check guests in/out of specific rooms.
4. **Dynamic Localization**: Instantly translate all text, labels, and configurations between Uzbek (UZ), Russian (RU), English (EN), and Turkish (TR).
5. **Interactive Logs & Statistics**: Day-to-day revenue tracking, active customer sheets, audit logs, and finance control.

---

## Project Structure
- `frontend/` - Vue 3 Single Page Application styled with TailwindCSS (Runs entirely client-side using localStorage mock database).
- `backend/` - Node.js Express server (Legacy/optional).

---

## Installation & Setup

To run the interactive demo, you only need to start the frontend. It runs fully client-side with virtual API mock interception:

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Running Locally
* **Frontend Web Dashboard**: [http://localhost:3000](http://localhost:3000) (All data, logins, and settings are mocked and persisted in your browser's local storage).

