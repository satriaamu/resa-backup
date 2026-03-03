import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    // 🔹 Ambil semua data lapangan
    fields: async () => prisma.field.findMany(),

    // 🔹 Ambil semua slot berdasarkan lapangan & tanggal
    slots: async (_: any, { fieldId, tanggal }: any) =>
      prisma.slot.findMany({
        where: {
          fieldId: Number(fieldId),
          tanggal: new Date(tanggal),
        },
        orderBy: { jam_mulai: "asc" },
      }),

    // 🔹 Ambil reservasi milik user tertentu
    reservations: async (_: any, { userId }: any) =>
      prisma.reservation.findMany({
        where: { userId: Number(userId) },
        include: { user: true, field: true, slot: true },
      }),

    // 🔹 Ambil semua reservasi (untuk admin)
    reservationsAll: async () =>
      prisma.reservation.findMany({
        include: { user: true, field: true, slot: true },
        orderBy: { tanggal: "desc" },
      }),
  },

  // 🔹 Relasi antar model (field → slot)
  Field: {
    slots: (parent: any, args: any) =>
      prisma.slot.findMany({
        where: {
          fieldId: parent.id,
          ...(args.tanggal && { tanggal: new Date(args.tanggal) }),
        },
        orderBy: { jam_mulai: "asc" },
      }),
  },

  Mutation: {
    // 🧩 Buat / perbarui user berdasarkan email
    createUser: async (_: any, { nama, email }: any) =>
      prisma.user.upsert({
        where: { email },
        update: { nama }, // update nama jika email sudah ada
        create: { nama, email },
      }),

    // 🧩 Buat reservasi baru
    createReservation: async (_: any, { input }: any) => {
      // Cek slot tersedia
      const slot = await prisma.slot.findUnique({
        where: { id: Number(input.slotId) },
      });

      if (!slot || slot.status !== "tersedia") {
        throw new Error("Slot tidak tersedia");
      }

      // Update slot jadi terpesan
      await prisma.slot.update({
        where: { id: Number(input.slotId) },
        data: { status: "terpesan" },
      });

      // Simpan reservasi
      return prisma.reservation.create({
        data: {
          userId: Number(input.userId),
          fieldId: Number(input.fieldId),
          slotId: Number(input.slotId),
          tanggal: new Date(input.tanggal),
          jam_mulai: input.jam_mulai,
          jam_selesai: input.jam_selesai,
          status: "pending",
        },
        include: { user: true, field: true, slot: true },
      });
    },

    // 🧩 Ubah status reservasi (admin)
    updateReservationStatus: async (_: any, { id, status }: any) => {
      // Ambil reservasi beserta slot-nya
      const reservasi = await prisma.reservation.findUnique({
        where: { id: Number(id) },
        include: { slot: true },
      });

      if (!reservasi) {
        throw new Error("Reservasi tidak ditemukan");
      }

      // Ubah status reservasi
      const updated = await prisma.reservation.update({
        where: { id: Number(id) },
        data: { status },
        include: { user: true, field: true, slot: true },
      });

      // Jika dibatalkan → buka kembali slot
      if (status === "cancelled" && reservasi.slot) {
        await prisma.slot.update({
          where: { id: reservasi.slot.id },
          data: { status: "tersedia" },
        });
      }

      // Jika dikonfirmasi → pastikan slot terkunci
      if (status === "confirmed" && reservasi.slot) {
        await prisma.slot.update({
          where: { id: reservasi.slot.id },
          data: { status: "terpesan" },
        });
      }

      return updated;
    },

    // 🧩 Hapus reservasi
    deleteReservation: async (_: any, { id }: any) => {
      const reservasi = await prisma.reservation.findUnique({
        where: { id: Number(id) },
      });

      if (!reservasi) return false;

      // Ubah slot jadi tersedia lagi
      await prisma.slot.update({
        where: { id: reservasi.slotId },
        data: { status: "tersedia" },
      });

      // Hapus reservasi
      await prisma.reservation.delete({
        where: { id: Number(id) },
      });

      return true;
    },

    // 🧩 Buat slot baru
    createSlot: async (
      _: any,
      { fieldId, tanggal, jam_mulai, jam_selesai, status }: any
    ) =>
      prisma.slot.create({
        data: {
          fieldId: Number(fieldId),
          tanggal: new Date(tanggal),
          jam_mulai,
          jam_selesai,
          status,
        },
        include: { field: true },
      }),
  },
};
