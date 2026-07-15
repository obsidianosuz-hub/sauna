import prisma from '../config/prisma.js';
import { calculateFinancials } from '../services/billingService.js';
import { logAudit } from '../utils/auditLogger.js';

// 1. Record an Expense (Chiqim)
export const createExpense = async (req, res) => {
  const { category, amount, description } = req.body;

  if (!category || !amount) {
    return res.status(400).json({ success: false, message: 'Kategoriya va miqdor kiritilishi shart.' });
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        category,
        amount: Number(amount),
        description,
        date: new Date()
      }
    });

    await logAudit(req, 'expense_create', `Chiqim qayd etildi: Kategoriya: "${category}", Miqdor: ${amount.toLocaleString()} UZS. Tavsif: ${description || 'yo\'q'}.`);

    return res.status(201).json({
      success: true,
      message: 'Chiqim muvaffaqiyatli saqlandi.',
      data: expense
    });
  } catch (error) {
    console.error('Create Expense Error:', error);
    return res.status(500).json({ success: false, message: 'Chiqimni yozishda xatolik.' });
  }
};

// 2. Return products to partner (Yukni qaytarish)
export const createProductReturn = async (req, res) => {
  const { productId, quantity, reason } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ success: false, message: 'Mahsulot va miqdori ko\'rsatilishi shart.' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi.' });
    }

    if (product.stockQuantity < Number(quantity)) {
      return res.status(400).json({ success: false, message: 'Qaytariladigan mahsulot miqdori ombor zaxirasidan ko\'p.' });
    }

    const productReturn = await prisma.$transaction(async (tx) => {
      // 1. Log return record
      const returnRecord = await tx.productReturn.create({
        data: {
          productId: Number(productId),
          quantity: Number(quantity),
          reason,
          date: new Date()
        }
      });

      // 2. Decrement inventory stock
      await tx.product.update({
        where: { id: Number(productId) },
        data: {
          stockQuantity: {
            decrement: Number(quantity)
          }
        }
      });

      return returnRecord;
    });

    await logAudit(req, 'product_return', `Yuk yetkazib beruvchiga qaytarildi: ${quantity} ta "${product.name}" mahsuloti qaytarildi. Sabab: ${reason || 'izohsiz'}.`);

    return res.status(201).json({
      success: true,
      message: 'Yuk muvaffaqiyatli yetkazib beruvchiga qaytarildi va ombordan chegirildi.',
      data: productReturn
    });
  } catch (error) {
    console.error('Return Product Error:', error);
    return res.status(500).json({ success: false, message: 'Yukni qaytarishda xatolik.' });
  }
};

// 3. Get Financial Metrics (Revenue, Expenses, Net Profit)
export const getFinancialMetrics = async (req, res) => {
  const { startDate, endDate } = req.query;

  // Setup date filters if provided
  const dateFilter = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  const queryFilter = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};
  const sessionFilter = Object.keys(dateFilter).length > 0 ? {
    createdAt: {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) })
    }
  } : {};

  try {
    // 1. Fetch paid sessions and their orders
    const sessions = await prisma.session.findMany({
      where: {
        paymentStatus: 'paid',
        ...sessionFilter
      },
      include: {
        room: true,
        orders: {
          include: {
            product: true
          }
        }
      }
    });

    // 2. Fetch expenses
    const expenses = await prisma.expense.findMany({
      where: queryFilter
    });

    // Calculate metrics using service formulas
    const financials = calculateFinancials(sessions, expenses);

    // Additional statistics
    const totalCustomers = sessions.length;
    
    // Top selling bar products
    const productSales = {};
    sessions.forEach(s => {
      s.orders.forEach(o => {
        if (o.orderType === 'bar_sale') {
          productSales[o.product.name] = (productSales[o.product.name] || 0) + o.quantity;
        }
      });
    });

    const topSellingProducts = Object.entries(productSales)
      .map(([name, qty]) => ({ name, quantity: qty }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        ...financials,
        totalCustomers,
        topSellingProducts
      }
    });
  } catch (error) {
    console.error('Get Financial Metrics Error:', error);
    return res.status(500).json({ success: false, message: 'Moliyaviy tahlil ma\'lumotlarini hisoblashda xatolik.' });
  }
};
