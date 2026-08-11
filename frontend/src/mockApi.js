import axios from 'axios';

// Initialize Mock Database in LocalStorage
const initMockDB = () => {
  const getOrSet = (key, defaultVal) => {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(val);
  };

  const initialUsers = [
    { id: 1, name: "A.Axadov", pinCode: "1111", role: "super_admin", email: "admin@portfolio.com", password: "AdminPassword123!" },
    { id: 2, name: "Sherzod (Menejer)", pinCode: "2222", role: "manager", email: "manager@sauna.com", password: "Password123!" },
    { id: 3, name: "Malika (Kassir)", pinCode: "3333", role: "cashier", email: "cashier@sauna.com", password: "Password123!" },
    { id: 4, name: "Jasur (Barman)", pinCode: "4444", role: "barman", email: "barman@sauna.com", password: "Password123!" }
  ];

  const initialRooms = [
    { id: 1, name: "Lux Hamom 1", type: "hamom", pricePerHour: 150000, status: "free" },
    { id: 2, name: "Lux Sauna 2", type: "sauna", pricePerHour: 180000, status: "free" },
    { id: 3, name: "Standard Hamom 3", type: "hamom", pricePerHour: 100000, status: "free" },
    { id: 4, name: "Family Room 4", type: "sauna", pricePerHour: 200000, status: "free" }
  ];

  const initialWristbands = [
    { id: 1, nfcUid: "NFC-001", status: "free", currentSessionId: null },
    { id: 2, nfcUid: "NFC-002", status: "free", currentSessionId: null },
    { id: 3, nfcUid: "NFC-003", status: "free", currentSessionId: null },
    { id: 4, nfcUid: "NFC-004", status: "free", currentSessionId: null },
    { id: 5, nfcUid: "NFC-005", status: "free", currentSessionId: null },
    { id: 6, nfcUid: "NFC-006", status: "free", currentSessionId: null }
  ];

  const initialProducts = [
    { id: 1, name: "Coca-Cola 0.5L", barcode: "4780001234567", price: 10000, costPrice: 6000, stockQuantity: 100, type: "sale", partnerId: 1 },
    { id: 2, name: "Fanta 0.5L", barcode: "4780001234568", price: 10000, costPrice: 6000, stockQuantity: 80, type: "sale", partnerId: 1 },
    { id: 3, name: "Choynak choy (ko'k)", barcode: "4780001234569", price: 8000, costPrice: 2000, stockQuantity: 200, type: "sale", partnerId: null },
    { id: 4, name: "Sauna Sochiq", barcode: "4780001234570", price: 20000, costPrice: 10000, stockQuantity: 30, type: "rent", partnerId: null },
    { id: 5, name: "Vena supurgisi (dub)", barcode: "4780001234571", price: 25000, costPrice: 15000, stockQuantity: 40, type: "sale", partnerId: 2 }
  ];

  const initialPartners = [
    { id: 1, name: "Pepsi Co Uzbekistan", contact: "+998 90 123 45 67" },
    { id: 2, name: "Chortoq mineral suvlari", contact: "+998 93 987 65 43" }
  ];

  const initialExpenses = [
    { id: 1, category: "electricity", amount: 450000, description: "Iyul oyi elektr to'lovi", date: new Date().toISOString() },
    { id: 2, category: "water", amount: 200000, description: "Suv ta'minoti to'lovi", date: new Date().toISOString() }
  ];

  const initialScripts = [
    { id: 1, title: "Xodim KPI Nazorat Algoritmi", description: "Mijozlarni kutib olish va xizmat sifati monitoringi", code: "// KPI calculation logic\nconst kpi = 100;" },
    { id: 2, title: "Turniket Kamera Skripti", description: "Avtomatik nfc wristband va yuzni solishtirish", code: "// Comparison script\nconsole.log('Comparing turnstile data');" }
  ];

  const initialCameras = [
    { id: 1, name: "Kassa Kirish Cam 1", token: "CAM-TOK-123", purpose: "Turniket kassa nazorati", permissions: "full_access", connectionType: "RTSP", connectionAddress: "rtsp://192.168.1.100/stream1", status: "active", scriptId: 2 },
    { id: 2, name: "Zal Nazorat Cam 2", token: "CAM-TOK-456", purpose: "Mijoz xavfsizligi", permissions: "checkin_only", connectionType: "HTTP", connectionAddress: "http://192.168.1.101/video", status: "active", scriptId: 1 }
  ];

  const initialReservations = [
    { id: 1, roomId: 1, customerName: "Asror", phoneNumber: "+998991234567", startTime: new Date(Date.now() + 3600000).toISOString(), endTime: new Date(Date.now() + 7200000).toISOString(), status: "pending", createdAt: new Date().toISOString() }
  ];

  return {
    users: getOrSet('sauna_users', initialUsers),
    rooms: getOrSet('sauna_rooms', initialRooms),
    wristbands: getOrSet('sauna_wristbands', initialWristbands),
    products: getOrSet('sauna_products', initialProducts),
    partners: getOrSet('sauna_partners', initialPartners),
    expenses: getOrSet('sauna_expenses', initialExpenses),
    scripts: getOrSet('sauna_scripts', initialScripts),
    cameras: getOrSet('sauna_cameras', initialCameras),
    reservations: getOrSet('sauna_reservations', initialReservations),
    sessions: getOrSet('sauna_sessions', []),
    auditLogs: getOrSet('sauna_audit_logs', []),
    returns: getOrSet('sauna_returns', []),
    visitorLogs: getOrSet('sauna_visitor_logs', [])
  };
};

const db = initMockDB();

const updateStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Create a custom Axios Adapter
axios.defaults.adapter = async function (config) {
  const { url, method, data: rawData } = config;
  const data = rawData ? JSON.parse(rawData) : null;
  const urlParts = url.split('?')[0].split('/');
  const apiPath = urlParts.slice(urlParts.indexOf('api') + 1);

  const getParams = () => {
    if (!config.params) return {};
    return config.params;
  };

  // Helper to log audit logs
  const logAudit = (action, details) => {
    const userString = localStorage.getItem('sauna_user');
    const user = userString ? JSON.parse(userString) : { name: "Tizim", pinCode: "0000" };
    db.auditLogs.unshift({
      id: db.auditLogs.length + 1,
      action,
      details,
      userPin: user.pinCode,
      userName: user.name,
      createdAt: new Date().toISOString()
    });
    updateStorage('sauna_audit_logs', db.auditLogs);
  };

  // Process Mock Routes
  try {
    // 1. Auth login
    if (url.includes('/api/auth/login/super') || url.includes('/api/auth/login')) {
      const { email, password, pinCode } = data || {};
      
      let matchedUser = null;
      if (pinCode) {
        matchedUser = db.users.find(u => u.pinCode === pinCode);
      } else {
        matchedUser = db.users.find(u => u.email === email && u.password === password);
      }

      if (matchedUser) {
        logAudit("Kirish", `${matchedUser.name} tizimga kirdi`);
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: { success: true, token: 'mock-jwt-token-sauna-12345', user: matchedUser }
        };
      } else {
        return {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
          data: { success: false, message: 'Gmail yoki parol/PIN-kod noto\'g\'ri' }
        };
      }
    }

    // 2. Rooms
    if (apiPath[0] === 'rooms') {
      if (method === 'get' || method === 'GET') {
        return { status: 200, statusText: 'OK', headers: {}, config, data: db.rooms };
      }
      if (method === 'post' || method === 'POST') {
        const newRoom = {
          id: db.rooms.length + 1,
          name: data.name,
          type: data.type || 'hamom',
          pricePerHour: parseFloat(data.pricePerHour),
          status: 'free',
          createdAt: new Date().toISOString()
        };
        db.rooms.push(newRoom);
        updateStorage('sauna_rooms', db.rooms);
        logAudit("Xona Qo'shildi", `Yangi xona: ${newRoom.name}`);
        return { status: 201, statusText: 'Created', headers: {}, config, data: newRoom };
      }
    }

    // 3. Wristbands
    if (apiPath[0] === 'wristbands') {
      if (apiPath[1] === 'free') {
        const freeWristbands = db.wristbands.filter(w => w.status === 'free');
        return { status: 200, statusText: 'OK', headers: {}, config, data: freeWristbands };
      }
      return { status: 200, statusText: 'OK', headers: {}, config, data: db.wristbands };
    }

    // 4. Products
    if (apiPath[0] === 'products') {
      if (method === 'get' || method === 'GET') {
        return { status: 200, statusText: 'OK', headers: {}, config, data: db.products };
      }
      if (method === 'post' || method === 'POST') {
        const newProduct = {
          id: db.products.length + 1,
          name: data.name,
          price: parseFloat(data.price),
          costPrice: parseFloat(data.costPrice || data.price * 0.6),
          stockQuantity: parseInt(data.stockQuantity || 0),
          type: data.type || 'sale',
          barcode: data.barcode || Math.random().toString().slice(2,15),
          partnerId: data.partnerId ? parseInt(data.partnerId) : null,
          createdAt: new Date().toISOString()
        };
        db.products.push(newProduct);
        updateStorage('sauna_products', db.products);
        logAudit("Mahsulot Qo'shildi", `Yangi mahsulot: ${newProduct.name}`);
        return { status: 201, statusText: 'Created', headers: {}, config, data: newProduct };
      }
    }

    // 5. Partners Suppliers
    if (apiPath[0] === 'partners') {
      if (method === 'get' || method === 'GET') {
        return { status: 200, statusText: 'OK', headers: {}, config, data: db.partners };
      }
      if (url.includes('/supplier/add') && (method === 'post' || method === 'POST')) {
        const newPartner = {
          id: db.partners.length + 1,
          name: data.name,
          contact: data.contact,
          createdAt: new Date().toISOString()
        };
        db.partners.push(newPartner);
        updateStorage('sauna_partners', db.partners);
        logAudit("Ta'minotchi Qo'shildi", `Yangi ta'minotchi: ${newPartner.name}`);
        return { status: 201, statusText: 'Created', headers: {}, config, data: newPartner };
      }
    }

    // 6. Finance / Expenses
    if (apiPath[0] === 'finance') {
      if (apiPath[1] === 'expenses') {
        if (method === 'get' || method === 'GET') {
          return { status: 200, statusText: 'OK', headers: {}, config, data: db.expenses };
        }
        if (method === 'post' || method === 'POST') {
          const newExpense = {
            id: db.expenses.length + 1,
            category: data.category,
            amount: parseFloat(data.amount),
            description: data.description,
            date: new Date().toISOString()
          };
          db.expenses.push(newExpense);
          updateStorage('sauna_expenses', db.expenses);
          logAudit("Xarajat Qo'shildi", `Xarajat: ${newExpense.category} - ${newExpense.amount} so'm`);
          return { status: 201, statusText: 'Created', headers: {}, config, data: newExpense };
        }
      }
    }

    // 7. Sessions
    if (apiPath[0] === 'sessions') {
      // Create session
      if (method === 'post' || method === 'POST') {
        if (url.includes('/checkout') || url.includes('/check-out')) {
          // Checkout session
          const sessId = parseInt(urlParts[urlParts.length - 2]);
          const session = db.sessions.find(s => s.id === sessId);
          if (session) {
            session.endTime = new Date().toISOString();
            session.paymentStatus = 'paid';
            session.cashAmount = parseFloat(data.cashAmount || 0);
            session.cardAmount = parseFloat(data.cardAmount || 0);
            session.totalAmount = session.cashAmount + session.cardAmount;

            // Room status cleaning
            const room = db.rooms.find(r => r.id === session.roomId);
            if (room) room.status = 'cleaning';
            
            // Wristband free
            const wristband = db.wristbands.find(w => w.id === session.wristbandId);
            if (wristband) {
              wristband.status = 'free';
              wristband.currentSessionId = null;
            }

            updateStorage('sauna_sessions', db.sessions);
            updateStorage('sauna_rooms', db.rooms);
            updateStorage('sauna_wristbands', db.wristbands);

            logAudit("Hisob-kitob", `Seans yakunlandi: ID ${session.id}, Jami: ${session.totalAmount}`);
            return { status: 200, statusText: 'OK', headers: {}, config, data: session };
          }
        }

        if (url.includes('/bar-order')) {
          const { sessionId, productId, quantity } = data;
          const session = db.sessions.find(s => s.id === parseInt(sessionId));
          const product = db.products.find(p => p.id === parseInt(productId));
          if (session && product) {
            if (!session.orders) session.orders = [];
            session.orders.push({
              id: session.orders.length + 1,
              productId: product.id,
              product: product,
              quantity: parseInt(quantity || 1),
              createdAt: new Date().toISOString()
            });
            // subtract stock
            product.stockQuantity -= parseInt(quantity || 1);
            
            updateStorage('sauna_sessions', db.sessions);
            updateStorage('sauna_products', db.products);
            logAudit("Bar Buyurtmasi", `Seansga buyurtma qo'shildi: ${product.name} (x${quantity})`);
            return { status: 200, statusText: 'OK', headers: {}, config, data: session };
          }
        }

        if (url.includes('/clean-done')) {
          const { roomId } = data;
          const room = db.rooms.find(r => r.id === parseInt(roomId));
          if (room) {
            room.status = 'free';
            updateStorage('sauna_rooms', db.rooms);
            logAudit("Tozalash Yakunlandi", `${room.name} tozalab bo'lindi.`);
            return { status: 200, statusText: 'OK', headers: {}, config, data: room };
          }
        }

        // Start session
        const roomId = parseInt(data.roomId);
        const wristbandId = parseInt(data.wristbandId);
        
        const room = db.rooms.find(r => r.id === roomId);
        const wristband = db.wristbands.find(w => w.id === wristbandId);

        if (room && wristband) {
          room.status = 'active';
          wristband.status = 'active';

          const newSession = {
            id: db.sessions.length + 1,
            roomId,
            room,
            wristbandId,
            wristband,
            customerName: data.customerName || 'Mijoz',
            phoneNumber: data.phoneNumber || '',
            initialPayment: parseFloat(data.initialPayment || 0),
            startTime: new Date().toISOString(),
            endTime: null,
            totalAmount: 0,
            paymentStatus: 'pending',
            orders: [],
            createdAt: new Date().toISOString()
          };

          wristband.currentSessionId = newSession.id;
          db.sessions.push(newSession);

          updateStorage('sauna_rooms', db.rooms);
          updateStorage('sauna_wristbands', db.wristbands);
          updateStorage('sauna_sessions', db.sessions);

          logAudit("Mijoz kiritildi", `${room.name} ga mijoz kiritildi: ${newSession.customerName}`);
          return { status: 201, statusText: 'Created', headers: {}, config, data: newSession };
        }
      }

      if (method === 'get' || method === 'GET') {
        const activeSessions = db.sessions.filter(s => s.endTime === null);
        return { status: 200, statusText: 'OK', headers: {}, config, data: activeSessions };
      }
    }

    // 8. Reservations
    if (apiPath[0] === 'reservations') {
      if (method === 'get' || method === 'GET') {
        return { status: 200, statusText: 'OK', headers: {}, config, data: db.reservations };
      }
      if (method === 'post' || method === 'POST') {
        const newRes = {
          id: db.reservations.length + 1,
          roomId: parseInt(data.roomId),
          customerName: data.customerName,
          phoneNumber: data.phoneNumber,
          startTime: new Date(data.startTime).toISOString(),
          endTime: new Date(data.endTime).toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        db.reservations.push(newRes);
        updateStorage('sauna_reservations', db.reservations);
        logAudit("Bron qo'shildi", `${newRes.customerName} uchun joy band qilindi`);
        return { status: 201, statusText: 'Created', headers: {}, config, data: newRes };
      }
    }

    // 9. Audit Logs
    if (apiPath[0] === 'audit-logs' || apiPath[0] === 'audit_logs') {
      return { status: 200, statusText: 'OK', headers: {}, config, data: db.auditLogs };
    }

    // 10. Cameras / Scripts
    if (apiPath[0] === 'cameras') {
      if (apiPath[1] === 'scripts') {
        if (method === 'get' || method === 'GET') {
          return { status: 200, statusText: 'OK', headers: {}, config, data: db.scripts };
        }
        if (method === 'post' || method === 'POST') {
          const newScript = {
            id: db.scripts.length + 1,
            title: data.title,
            description: data.description,
            code: data.code,
            createdAt: new Date().toISOString()
          };
          db.scripts.push(newScript);
          updateStorage('sauna_scripts', db.scripts);
          logAudit("Kamera Algoritmi qo'shildi", `Yangi skript: ${newScript.title}`);
          return { status: 201, statusText: 'Created', headers: {}, config, data: newScript };
        }
      }

      if (method === 'get' || method === 'GET') {
        return { status: 200, statusText: 'OK', headers: {}, config, data: db.cameras };
      }
      if (method === 'post' || method === 'POST') {
        const newCamera = {
          id: db.cameras.length + 1,
          name: data.name,
          token: data.token || `CAM-TOK-${Math.random().toString(36).substring(7).toUpperCase()}`,
          purpose: data.purpose,
          permissions: data.permissions || 'checkin_only',
          connectionType: data.connectionType || 'USB',
          connectionAddress: data.connectionAddress || 'local_webcam',
          status: 'active',
          scriptId: data.scriptId ? parseInt(data.scriptId) : null,
          createdAt: new Date().toISOString()
        };
        db.cameras.push(newCamera);
        updateStorage('sauna_cameras', db.cameras);
        logAudit("Kamera qo'shildi", `Yangi kamera: ${newCamera.name}`);
        return { status: 201, statusText: 'Created', headers: {}, config, data: newCamera };
      }
    }

    // Default Fallback: Return empty success for undefined mock routes
    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: { success: true }
    };

  } catch (error) {
    console.error('Mock Adapter Error:', error);
    return {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config,
      data: { success: false, message: 'Mock API server internal error' }
    };
  }
};
