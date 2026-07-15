import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Sauna Database...');

  // 1. Create Partners
  const drinkSupplier = await prisma.partner.create({
    data: { name: 'Sifatli Ichimliklar MCHJ', contact: '+998901234567' }
  });

  const hygieneSupplier = await prisma.partner.create({
    data: { name: 'Yuvish Vositalari Hamkori', contact: '+998909876543' }
  });

  console.log('Partners created.');

  // 2. Create Users/Staff
  const superAdmin = await prisma.user.create({
    data: { name: 'Jahongir Aliyev', pinCode: '00000000', role: 'super_admin' }
  });

  const cashier = await prisma.user.create({
    data: { name: 'Malika Karimova', pinCode: '12121212', role: 'cashier' }
  });

  const barman = await prisma.user.create({
    data: { name: 'Rustam Qodirov', pinCode: '2222', role: 'barman' }
  });

  const cleaner = await prisma.user.create({
    data: { name: 'Fazilat opa', pinCode: '3333', role: 'cleaner' }
  });

  console.log('Staff users created.');

  // 3. Create Rooms
  const room1 = await prisma.room.create({
    data: { name: 'Oddiy Hammom #1', type: 'hamom', pricePerHour: 50000, status: 'free' }
  });

  const room2 = await prisma.room.create({
    data: { name: 'VIP Hammom #2', type: 'hamom', pricePerHour: 80000, status: 'free' }
  });

  const room3 = await prisma.room.create({
    data: { name: 'Fin Saunasi #3', type: 'sauna', pricePerHour: 100000, status: 'free' }
  });

  const room4 = await prisma.room.create({
    data: { name: 'Turk Saunasi #4', type: 'sauna', pricePerHour: 120000, status: 'free' }
  });

  console.log('Rooms created.');

  // 4. Create RFID/NFC Wristbands
  const band1 = await prisma.nFCWristband.create({
    data: { nfcUid: 'RFID-RC522-BAND-001', status: 'free' }
  });

  const band2 = await prisma.nFCWristband.create({
    data: { nfcUid: 'RFID-RC522-BAND-002', status: 'free' }
  });

  const band3 = await prisma.nFCWristband.create({
    data: { nfcUid: 'RFID-RC522-BAND-003', status: 'free' }
  });

  const band4 = await prisma.nFCWristband.create({
    data: { nfcUid: 'RFID-RC522-BAND-004', status: 'free' }
  });

  console.log('NFC Wristbands created.');

  // 5. Create Products & Rentals
  await prisma.product.create({
    data: { 
      name: 'Coca Cola 0.5L', 
      price: 15000, 
      costPrice: 9000, 
      stockQuantity: 150, 
      type: 'sale',
      partnerId: drinkSupplier.id
    }
  });

  await prisma.product.create({
    data: { 
      name: 'Meva Sharbatlari', 
      price: 20000, 
      costPrice: 12000, 
      stockQuantity: 80, 
      type: 'sale',
      partnerId: drinkSupplier.id
    }
  });

  await prisma.product.create({
    data: { 
      name: 'Sochiq Ijarasi (Towel)', 
      price: 10000, 
      costPrice: 3000, 
      stockQuantity: 40, 
      type: 'rent',
      partnerId: hygieneSupplier.id
    }
  });

  await prisma.product.create({
    data: { 
      name: 'Maxsus Sovun (Soap)', 
      price: 5000, 
      costPrice: 1500, 
      stockQuantity: 200, 
      type: 'sale',
      partnerId: hygieneSupplier.id
    }
  });

  console.log('Products created.');
  console.log('Database Seeding Completed Successfully.');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
