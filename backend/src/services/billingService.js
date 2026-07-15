/**
 * Billing Service - Sauna & Bathhouse Management System
 */

/**
 * Calculates current or final room billing amount based on elapsed time.
 * Supports:
 *  - Fixed plan booking with overage billing (per minute rate after limit)
 *  - Warning flag when 15 minutes are left.
 * 
 * @param {Date} startTime - Session start time
 * @param {number} bookedHours - Initial hours booked (optional, default is open-ended)
 * @param {number} pricePerHour - Hourly price of the room
 * @returns {object} - { elapsedMinutes, roomCharge, isOverage, warningActive }
 */
export const calculateRoomCharge = (startTime, bookedHours, pricePerHour) => {
  const start = new Date(startTime);
  const now = new Date();
  
  // Difference in milliseconds converted to minutes
  const elapsedMinutes = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60)));
  const minuteRate = pricePerHour / 60;
  
  let roomCharge = 0;
  let isOverage = false;
  let warningActive = false;

  if (bookedHours && bookedHours > 0) {
    const bookedMinutes = bookedHours * 60;
    const baseCharge = bookedHours * pricePerHour;

    if (elapsedMinutes <= bookedMinutes) {
      roomCharge = baseCharge;
      
      // Warning matches when within 15 minutes of expiration
      const minutesRemaining = bookedMinutes - elapsedMinutes;
      if (minutesRemaining <= 15 && minutesRemaining >= 0) {
        warningActive = true;
      }
    } else {
      // Exceeded limit: charge base + per-minute extra
      const extraMinutes = elapsedMinutes - bookedMinutes;
      roomCharge = baseCharge + (extraMinutes * minuteRate);
      isOverage = true;
    }
  } else {
    // Open-ended duration: charge for actual elapsed time
    roomCharge = elapsedMinutes * minuteRate;
    
    // Warning status is false for open-ended unless set by user
    warningActive = false;
  }

  return {
    elapsedMinutes,
    roomCharge: Math.round(roomCharge * 100) / 100, // round to 2 decimal places
    isOverage,
    warningActive
  };
};

/**
 * Calculates total billing amount across all rooms in a session's history.
 */
export const calculateHistoryRoomCharge = (roomHistory = []) => {
  const now = new Date();
  let totalCharge = 0;
  let totalElapsedMinutes = 0;

  roomHistory.forEach(hist => {
    const start = new Date(hist.startTime);
    const end = hist.endTime ? new Date(hist.endTime) : now;
    const elapsedMinutes = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60)));
    const minuteRate = hist.pricePerHour / 60;
    
    totalCharge += elapsedMinutes * minuteRate;
    totalElapsedMinutes += elapsedMinutes;
  });

  return {
    elapsedMinutes: totalElapsedMinutes,
    roomCharge: Math.round(totalCharge)
  };
};

/**
 * Processes mixed payment splits and returns payment distribution status.
 * Checks that the total split amount matches the total session charge.
 * 
 * @param {number} totalAmount - Total amount to pay
 * @param {number} cashAmount - Paid in cash
 * @param {number} cardAmount - Paid in card/electronic payment
 * @returns {object} - { isValid, difference }
 */
export const validateMixedPayment = (totalAmount, cashAmount = 0, cardAmount = 0) => {
  const totalPaid = Number(cashAmount) + Number(cardAmount);
  const diff = Math.round((totalPaid - totalAmount) * 100) / 100;
  return {
    isValid: Math.abs(diff) <= 0.05, // allowance for float point difference
    difference: diff
  };
};

/**
 * Calculates net profit for the complex.
 * Net Profit = (Paid Sessions + Bar Orders) - Expenses.
 * 
 * @param {Array} sessions - Paid sessions array
 * @param {Array} expenses - Expenses array
 * @returns {object} - Financial breakdown
 */
export const calculateFinancials = (sessions = [], expenses = []) => {
  let roomRevenue = 0;
  let barRevenue = 0;
  let saunaRevenue = 0;
  let hammomRevenue = 0;
  let totalRevenue = 0;
  let totalExpenses = 0;

  // Calculate Revenue
  sessions.forEach(session => {
    if (session.paymentStatus === 'paid') {
      let sessionOrdersTotal = 0;
      if (session.orders && session.orders.length > 0) {
        session.orders.forEach(order => {
          const itemPrice = order.product.price;
          const orderCost = itemPrice * order.quantity;
          barRevenue += orderCost;
          sessionOrdersTotal += orderCost;
        });
      }

      // Room cost is session total amount minus bar orders to prevent double counting
      const actualRoomCost = Math.max(0, session.totalAmount - sessionOrdersTotal);
      roomRevenue += actualRoomCost;

      // Classify by room type
      if (session.room) {
        if (session.room.type === 'sauna') {
          saunaRevenue += actualRoomCost;
        } else if (session.room.type === 'hamom' || session.room.type === 'hammom') {
          hammomRevenue += actualRoomCost;
        }
      }
    }
  });

  // Calculate Expenses
  expenses.forEach(exp => {
    totalExpenses += exp.amount;
  });

  totalRevenue = roomRevenue + barRevenue;
  const netProfit = totalRevenue - totalExpenses;

  return {
    roomRevenue: Math.round(roomRevenue * 100) / 100,
    barRevenue: Math.round(barRevenue * 100) / 100,
    saunaRevenue: Math.round(saunaRevenue * 100) / 100,
    hammomRevenue: Math.round(hammomRevenue * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100
  };
};
