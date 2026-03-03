import { gql } from "apollo-server";

export const typeDefs = gql`
  # ===============================
  # 🏟️ Entity Lapangan (Field)
  # ===============================
  type Field {
    id: ID!
    nama_lapangan: String!
    tipe: String!
    harga_per_jam: Int!
    slots(tanggal: String): [Slot!]!
  }

  # ===============================
  # ⏰ Entity Slot Waktu (Slot)
  # ===============================
  type Slot {
    id: ID!
    tanggal: String!
    jam_mulai: String!
    jam_selesai: String!
    status: String! # "tersedia" | "terpesan"
    field: Field!
  }

  # ===============================
  # 👤 Entity Pengguna (User)
  # ===============================
  type User {
    id: ID!
    nama: String!
    email: String!
    no_telepon: String
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ===============================
  # 📅 Entity Reservasi Lapangan
  # ===============================
  type Reservation {
    id: ID!
    user: User!
    field: Field!
    slot: Slot!
    tanggal: String!
    jam_mulai: String!
    jam_selesai: String!
    status: String! # "pending" | "confirmed" | "cancelled"
  }

  # ===============================
  # ✏️ Input untuk membuat reservasi
  # ===============================
  input ReservationInput {
    userId: ID!
    fieldId: ID!
    slotId: ID!
    tanggal: String!
    jam_mulai: String!
    jam_selesai: String!
    no_telepon: String!
  }

  # ===============================
  # 🔍 Query (Baca Data)
  # ===============================
  type Query {
    # Ambil semua data lapangan
    fields: [Field!]!

    # Ambil slot berdasarkan lapangan & tanggal
    slots(fieldId: ID!, tanggal: String!): [Slot!]!

    # Ambil reservasi milik user tertentu
    reservations(userId: ID!): [Reservation!]!

    # Ambil semua reservasi (khusus admin)
    reservationsAll: [Reservation!]!
  }

  # ===============================
  # 🔧 Mutation (Ubah Data)
  # ===============================
  type Mutation {
    # Buat user (register) — menyimpan password yang sudah di-hash
    createUser(nama: String!, email: String!, password: String!): User!

    # Login — mengembalikan token + user
    login(email: String!, password: String!): AuthPayload!

    # Buat reservasi baru
    createReservation(input: ReservationInput!): Reservation!

    # Update status reservasi (admin)
    updateReservationStatus(id: ID!, status: String!): Reservation!

    # Hapus reservasi
    deleteReservation(id: ID!): Boolean!

    # Buat slot baru
    createSlot(
      fieldId: ID!
      tanggal: String!
      jam_mulai: String!
      jam_selesai: String!
      status: String!
    ): Slot!

    # Hapus slot tertentu
    deleteSlot(slotId: ID!): Slot
  }
`;
