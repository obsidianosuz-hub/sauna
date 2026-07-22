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
- `backend/` - Node.js Express server with Prisma ORM & SQLite database.
- `frontend/` - Vue 3 Single Page Application styled with TailwindCSS.

---

## Installation & Setup

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="super-secret-key-sauna"
   PORT=5000
   ```
4. Push database migrations and seed default data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
5. Start the backend server:
   ```bash
   npm run start
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Running Locally
* **API Server URL**: [http://localhost:5000](http://localhost:5000)
* **Frontend Web Dashboard**: [http://localhost:3000](http://localhost:3000)
