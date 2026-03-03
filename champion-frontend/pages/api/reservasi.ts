// pages/api/reservasi.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { field, slot, name, phone, note } = req.body;

  if (!field || !slot || !name || !phone) {
    return res.status(400).json({ message: 'Semua field wajib diisi: field, slot, nama, dan nomor HP.' });
  }

  try {
    const newReservation = await prisma.reservasi.create({
      data: {
        field,
        slot,
        name,
        phone,
        note,
      },
    });
    res.status(200).json({ message: 'Reservasi berhasil', data: newReservation });
  } catch (error) {
    console.error("Gagal menyimpan reservasi:", error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan reservasi.' });
  } finally {
    await prisma.$disconnect();
  }
}