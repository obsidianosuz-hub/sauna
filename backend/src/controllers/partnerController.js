import prisma from '../config/prisma.js';
import { logAudit } from '../utils/auditLogger.js';

// 1. Get all partners and their supplied products
export const getPartners = async (req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      include: {
        products: true
      }
    });

    return res.status(200).json({
      success: true,
      data: partners
    });
  } catch (error) {
    console.error('Get Partners Error:', error);
    return res.status(500).json({ success: false, message: 'Hamkorlar ro\'yxatini yuklashda xatolik.' });
  }
};

// 2. Create a new partner
export const createPartner = async (req, res) => {
  const { name, contact } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Hamkor nomi kiritilishi shart.' });
  }

  try {
    const partner = await prisma.partner.create({
      data: { name, contact }
    });

    await logAudit(req, 'partner_create', `Yangi hamkor qo'shildi: "${partner.name}".`);

    return res.status(201).json({
      success: true,
      message: 'Yangi hamkor muvaffaqiyatli ro\'yxatga olindi.',
      data: partner
    });
  } catch (error) {
    console.error('Create Partner Error:', error);
    return res.status(500).json({ success: false, message: 'Hamkor qo\'shishda xatolik.' });
  }
};

// 3. Record supply delivery from a partner (updates product stock)
export const supplyProducts = async (req, res) => {
  const { partnerId, productName, price, costPrice, quantity, type } = req.body;

  if (!partnerId || !productName || !price || !costPrice || !quantity) {
    return res.status(400).json({ success: false, message: 'Hamkor, mahsulot nomi, narx, tannarx va miqdor kiritilishi shart.' });
  }

  try {
    const partner = await prisma.partner.findUnique({
      where: { id: Number(partnerId) }
    });

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Hamkor topilmadi.' });
    }

    const product = await prisma.$transaction(async (tx) => {
      let existingProduct = await tx.product.findFirst({
        where: {
          name: productName,
          partnerId: Number(partnerId)
        }
      });

      if (existingProduct) {
        existingProduct = await tx.product.update({
          where: { id: existingProduct.id },
          data: {
            stockQuantity: {
              increment: Number(quantity)
            },
            price: Number(price),
            costPrice: Number(costPrice)
          }
        });
        return existingProduct;
      } else {
        const newProduct = await tx.product.create({
          data: {
            name: productName,
            price: Number(price),
            costPrice: Number(costPrice),
            stockQuantity: Number(quantity),
            type: type || 'sale',
            partnerId: Number(partnerId)
          }
        });
        return newProduct;
      }
    });

    await logAudit(req, 'product_supply', `Hamkor "${partner.name}" dan yuk qabul qilindi: ${quantity} ta "${product.name}" (dona tannarxi: ${costPrice} UZS).`);

    return res.status(200).json({
      success: true,
      message: 'Mahsulot yetkazib berilishi muvaffaqiyatli saqlandi va ombor qoldig\'i yangilandi.',
      data: product
    });
  } catch (error) {
    console.error('Supply Products Error:', error);
    return res.status(500).json({ success: false, message: 'Mahsulot yetkazib berilishini yozishda xatolik.' });
  }
};
