import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed user contoh
  await prisma.user.upsert({
    where: { email: 'user1@champion.local' },
    update: {},
    create: { nama: 'User 1', email: 'user1@champion.local' }
  });

  // Seed lapangan futsal
  await prisma.field.createMany({
    data: [
      { nama_lapangan: 'Lapangan Futsal A', tipe: 'Futsal', harga_per_jam: 100000 },
      { nama_lapangan: 'Lapangan Futsal B', tipe: 'Futsal', harga_per_jam: 80000 }
    ]
  });

  // Seed slot jadwal untuk Lapangan Futsal A tanggal hari ini
  const fieldA = await prisma.field.findFirst({ where: { nama_lapangan: 'Lapangan Futsal A' } });
  if (fieldA) {
    await prisma.slot.createMany({
      data: [
        {
          fieldId: fieldA.id,
          tanggal: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
          jam_mulai: '08:00',
          jam_selesai: '09:00',
          status: 'tersedia'
        },
        {
          fieldId: fieldA.id,
          tanggal: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
          jam_mulai: '09:00',
          jam_selesai: '10:00',
          status: 'tersedia'
        }
      ]
    });
  }
}

main().finally(() => prisma.$disconnect());