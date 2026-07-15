import prisma from '../config/prisma.js';
import { logAudit } from '../utils/auditLogger.js';

export const scanProductBarcode = async (req, res) => {
  const { barcode, nfcUid } = req.body;

  if (!barcode) {
    return res.status(400).json({ success: false, message: 'Shtrix-kod ko\'rsatilishi shart.' });
  }

  try {
    // Find product by barcode
    const product = await prisma.product.findUnique({
      where: { barcode }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi.' });
    }

    // Check stock availability
    if (product.type === 'sale' && product.stockQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Ushbu mahsulot zaxirada qolmagan!' });
    }

    let order = null;

    // Atomic transaction for inventory update
    await prisma.$transaction(async (tx) => {
      // 1. Decrement product stock if it is a sale item
      if (product.type === 'sale') {
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              decrement: 1
            }
          }
        });
      }

      // 2. If nfcUid is provided, link to active guest session
      if (nfcUid) {
        const wristband = await tx.nFCWristband.findUnique({
          where: { nfcUid }
        });

        if (wristband && wristband.status === 'active' && wristband.currentSessionId) {
          order = await tx.sessionOrder.create({
            data: {
              sessionId: wristband.currentSessionId,
              productId: product.id,
              quantity: 1,
              orderType: product.type === 'rent' ? 'item_rental' : 'bar_sale'
            }
          });
        }
      }
    });

    if (nfcUid && order) {
      await logAudit(req, 'bar_order', `Bar xizmati: 1 ta "${product.name}" mahsuloti bilaguzuk seansiga yozildi.`);
    }

    return res.status(200).json({
      success: true,
      message: nfcUid 
        ? 'Mahsulot seans hisobiga muvaffaqiyatli qo\'shildi va zaxiradan chegirildi.' 
        : 'Mahsulot kassa savdosiga tayyorlandi va zaxiradan chegirildi.',
      product: {
        ...product,
        stockQuantity: product.type === 'sale' ? product.stockQuantity - 1 : product.stockQuantity
      },
      order
    });
  } catch (error) {
    console.error('Scan Product Barcode Error:', error);
    return res.status(500).json({ success: false, message: 'Shtrix-kodni skanerlashda xatolik yuz berdi.' });
  }
};

export const updateProductBarcode = async (req, res) => {
  const { id, barcode } = req.body;

  if (!id || !barcode) {
    return res.status(400).json({ success: false, message: 'Mahsulot ID va shtrix-kod ko\'rsatilishi shart.' });
  }

  try {
    const existing = await prisma.product.findFirst({
      where: {
        barcode,
        NOT: { id: Number(id) }
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `Ushbu shtrix-kod allaqachon boshqa mahsulotga ("${existing.name}") biriktirilgan!` });
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { barcode }
    });

    await logAudit(req, 'barcode_bind', `Shtrix-kod yangilandi: "${updated.name}" mahsulotiga yangi shtrix-kod (${barcode}) biriktirildi.`);

    return res.status(200).json({
      success: true,
      message: 'Shtrix-kod mahsulotga muvaffaqiyatli biriktirildi.',
      data: updated
    });
  } catch (error) {
    console.error('Update Product Barcode Error:', error);
    return res.status(500).json({ success: false, message: 'Shtrix-kodni yangilashda xatolik yuz berdi.' });
  }
};

export const createProductWithBarcode = async (req, res) => {
  const { name, price, costPrice, stockQuantity, type, barcode, partnerId } = req.body;

  if (!name || !price || !stockQuantity || !barcode) {
    return res.status(400).json({ success: false, message: 'Nomi, narxi, qoldig\'i va shtrix-kodi kiritilishi shart.' });
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { barcode }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `Ushbu shtrix-kod allaqachon boshqa mahsulotga ("${existing.name}") biriktirilgan!` });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        costPrice: costPrice ? Number(costPrice) : 0,
        stockQuantity: Number(stockQuantity),
        type: type || 'sale',
        barcode,
        partnerId: partnerId ? Number(partnerId) : null
      }
    });

    await logAudit(req, 'product_create', `Yangi mahsulot shtrix-kod bilan yaratildi: "${product.name}" (${price} UZS, shtrix-kod: ${barcode}).`);

    return res.status(201).json({
      success: true,
      message: 'Yangi mahsulot shtrix-kod bilan birga muvaffaqiyatli saqlandi.',
      data: product
    });
  } catch (error) {
    console.error('Create Product With Barcode Error:', error);
    return res.status(500).json({ success: false, message: 'Yangi mahsulotni saqlashda xatolik yuz berdi.' });
  }
};
