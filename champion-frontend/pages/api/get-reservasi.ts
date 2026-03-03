// pages/api/get-reservasi.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const reservations = await prisma.reservasi.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json({ reservations });
  } catch (error) {
    console.error("Gagal mengambil data reservasi:", error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data reservasi.' });
  } finally {
    await prisma.$disconnect();
  }
}