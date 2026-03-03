import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { signToken } from "./auth";

const prisma = new PrismaClient();

// 🕐 Utility: Generate semua time slots untuk hari tertentu (08:00 - 22:00)
// Dengan deteksi slot yang sudah lewat
const generateTimeSlots = (fieldId: number, tanggal: string, existingSlots: any[]) => {
  const slots = [];
  const START_HOUR = 8;
  const END_HOUR = 22;

  // 🕰️ Cek waktu sekarang
  const now = new Date();
  const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Convert jam ke format "HH:MM" untuk perbandingan
  const getCurrentTimeInMinutes = () => currentHour * 60 + currentMinute;
  const getTimeInMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    const jam_mulai = `${hour.toString().padStart(2, "0")}:00`;
    const jam_selesai = `${(hour + 1).toString().padStart(2, "0")}:00`;

    // Cek apakah slot ini sudah ada di database (terpesan)
    const existingSlot = existingSlots.find(
      (s: any) => s.jam_mulai === jam_mulai && s.jam_selesai === jam_selesai
    );

    // 🔍 Cek apakah slot sudah lewat (expired)
    let slotStatus = existingSlot?.status || "tersedia";
    let isExpired = false;

    // Jika tanggal sudah lewat dari hari ini, mark sebagai expired
    if (tanggal < currentDate) {
      isExpired = true;
      slotStatus = "expired";
    } 
    // Jika tanggal hari ini, cek jam
    else if (tanggal === currentDate) {
      const jam_selesai_minutes = getTimeInMinutes(jam_selesai);
      if (jam_selesai_minutes <= getCurrentTimeInMinutes()) {
        isExpired = true;
        slotStatus = "expired";
      }
    }

    // Jika sudah expired tapi ada terpesan di DB, tetap gunakan status DB
    if (isExpired && existingSlot) {
      slotStatus = existingSlot.status;
    }

    slots.push({
      id: existingSlot?.id || `virtual-${fieldId}-${tanggal}-${jam_mulai}`,
      fieldId,
      tanggal,
      jam_mulai,
      jam_selesai,
      status: slotStatus,
      field: null,
    });
  }

  return slots;
};

export const resolvers = {
  Query: {
    // 🔹 Ambil semua data lapangan
    fields: async () => prisma.field.findMany(),

    // 🔹 Ambil semua slot berdasarkan lapangan & tanggal (GENERATE REALTIME)
    slots: async (_: any, { fieldId, tanggal }: any) => {
      const dbSlots = await prisma.slot.findMany({
        where: {
          fieldId: Number(fieldId),
          tanggal: new Date(tanggal),
        },
      });

      return generateTimeSlots(Number(fieldId), tanggal, dbSlots);
    },

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
    slots: async (parent: any, args: any) => {
      const dbSlots = await prisma.slot.findMany({
        where: {
          fieldId: parent.id,
          ...(args.tanggal && { tanggal: new Date(args.tanggal) }),
        },
        orderBy: { jam_mulai: "asc" },
      });

      if (args.tanggal) {
        return generateTimeSlots(parent.id, args.tanggal, dbSlots);
      }

      return dbSlots;
    },
  },

  Mutation: {
    // 🧩 Buat user (register) dengan role USER
    createUser: async (_: any, { nama, email, password }: any) => {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      return prisma.user.create({
        data: {
          nama,
          email,
          password: hashedPassword,
          role: "USER",
        } as any,
      });
    },

    // 🧩 Login — return token + user dengan role
    login: async (_: any, { email, password }: any) => {
      const user = await prisma.user.findUnique({
        where: { email },
      }) as any;

      if (!user) {
        throw new Error("Email atau password salah");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Email atau password salah");
      }

      // Generate token dengan role
      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      };
    },

    // 🧩 Buat reservasi baru (handle virtual slot IDs)
    createReservation: async (_: any, { input }: any) => {
      let slot: any = null;
      const slotIdStr = String(input.slotId);

      // 🔹 Check apakah slot ID adalah virtual (format: virtual-fieldId-tanggal-jamMulai)
      const isVirtualSlot = slotIdStr.startsWith("virtual-");

      if (isVirtualSlot) {
        // 🔹 Cari atau buat slot dari database
        const existingSlot = await prisma.slot.findFirst({
          where: {
            fieldId: Number(input.fieldId),
            tanggal: new Date(input.tanggal),
            jam_mulai: input.jam_mulai,
            jam_selesai: input.jam_selesai,
          },
        });

        if (existingSlot) {
          slot = existingSlot;
          // Cek status
          if (slot.status !== "tersedia") {
            throw new Error("Slot tidak tersedia");
          }
        } else {
          // Buat slot baru di DB dengan status tersedia dulu
          slot = await prisma.slot.create({
            data: {
              fieldId: Number(input.fieldId),
              tanggal: new Date(input.tanggal),
              jam_mulai: input.jam_mulai,
              jam_selesai: input.jam_selesai,
              status: "tersedia",
            },
          });
        }
      } else {
        // 🔹 Slot ID adalah real (dari database)
        slot = await prisma.slot.findUnique({
          where: { id: Number(input.slotId) },
        });

        if (!slot || slot.status !== "tersedia") {
          throw new Error("Slot tidak tersedia");
        }
      }

      // Update user dengan nomor telepon
      await prisma.user.update({
        where: { id: Number(input.userId) },
        data: { no_telepon: input.no_telepon },
      });

      // Update slot jadi terpesan
      await prisma.slot.update({
        where: { id: slot.id },
        data: { status: "terpesan" },
      });

      // Simpan reservasi
      return prisma.reservation.create({
        data: {
          userId: Number(input.userId),
          fieldId: Number(input.fieldId),
          slotId: slot.id,
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
      const reservasi = await prisma.reservation.findUnique({
        where: { id: Number(id) },
        include: { slot: true },
      });

      if (!reservasi) throw new Error("Reservasi tidak ditemukan");

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

    // 🧩 Hapus slot
    deleteSlot: async (_: any, { slotId }: any) => {
      // Cek apakah slot ada
      const existingSlot = await prisma.slot.findUnique({
        where: { id: Number(slotId) },
      });

      if (!existingSlot) {
        throw new Error("Slot tidak ditemukan");
      }

      // Hapus slot
      const deleted = await prisma.slot.delete({
        where: { id: Number(slotId) },
      });

      return deleted;
    },
  },
};
