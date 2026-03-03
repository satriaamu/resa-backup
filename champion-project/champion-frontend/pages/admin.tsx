import { useQuery, gql, useMutation } from "@apollo/client";
import client from "../lib/apolloClient";
import { useState } from "react";
import SidebarAdmin from "../pages/SidebarAdmin";

// =====================
// 🔹 QUERY & MUTATION
// =====================
const GET_ALL_RESERVATIONS = gql`
  query {
    reservationsAll {
      id
      status
      tanggal
      jam_mulai
      jam_selesai
      user { nama email }
      field { nama_lapangan tipe }
      slot { jam_mulai jam_selesai }
    }
  }
`;

const UPDATE_RESERVATION_STATUS = gql`
  mutation($id: ID!, $status: String!) {
    updateReservationStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const DELETE_RESERVATION = gql`
  mutation($id: ID!) {
    deleteReservation(id: $id)
  }
`;

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled"];

// =====================
// 🔹 UTILITAS FORMAT TANGGAL
// =====================

// Fungsi untuk parse berbagai format tanggal dari server
function parseDateInput(value: any): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "number") return new Date(value);

  if (typeof value === "string") {
    // jika format ISO (2025-10-08T00:00:00Z)
    const d1 = new Date(value);
    if (!isNaN(d1.getTime())) return d1;

    // jika format hanya YYYY-MM-DD
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }

    // jika string angka (timestamp)
    if (/^\d+$/.test(value)) {
      return new Date(Number(value.length === 10 ? Number(value) * 1000 : Number(value)));
    }
  }

  if (typeof value === "object") {
    // GraphQL custom format { year, month, day }
    if (value.year && value.month && value.day) {
      return new Date(value.year, value.month - 1, value.day);
    }

    // Firebase timestamp { seconds, nanos }
    if (value.seconds) {
      return new Date(value.seconds * 1000);
    }
  }

  return null;
}

// Fungsi untuk ubah ke format lokal
function formatDate(value: any, style: "long" | "iso" = "long") {
  const dt = parseDateInput(value);
  if (!dt) return "—";

  if (style === "iso") {
    return dt.toISOString().split("T")[0]; // tampil seperti 2025-10-08
  }

  return dt.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// =====================
// 🔹 HALAMAN ADMIN
// =====================
export default function AdminPage() {
  const { data, loading, error, refetch } = useQuery(GET_ALL_RESERVATIONS, { client });
  const [updateStatus] = useMutation(UPDATE_RESERVATION_STATUS, { client });
  const [deleteReservation] = useMutation(DELETE_RESERVATION, { client });
  const [editId, setEditId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || !data.reservationsAll.length) return <p>Belum ada reservasi.</p>;

  const handleEdit = (id: number, status: string) => {
    setEditId(id);
    setEditStatus(status);
  };

  const handleSave = async (id: number) => {
    await updateStatus({ variables: { id, status: editStatus } });
    setEditId(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin hapus reservasi ini?")) {
      await deleteReservation({ variables: { id } });
      refetch();
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <SidebarAdmin />
      <div style={{ flex: 1, padding: 24, fontFamily: "Poppins, sans-serif" }}>
        <h1 style={{ marginBottom: 20, color: "#1e293b" }}>Daftar Reservasi Lapangan</h1>

        <table
          border={1}
          cellPadding={8}
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.95rem",
          }}
        >
          <thead style={{ background: "#f1f5f9", color: "#334155" }}>
            <tr>
              <th>Nama Pemesan</th>
              <th>Email</th>
              <th>Lapangan</th>
              <th>Tipe</th>
              <th>Tanggal</th>
              <th>Jam</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.reservationsAll.map((r: any) => (
              <tr key={r.id}>
                <td>{r.user?.nama || "—"}</td>
                <td>{r.user?.email || "—"}</td>
                <td>{r.field?.nama_lapangan || "—"}</td>
                <td>{r.field?.tipe || "—"}</td>
                <td>{formatDate(r.tanggal)}</td>
                <td>
                  {r.jam_mulai} - {r.jam_selesai}
                </td>
                <td>
                  {editId === r.id ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: 4 }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    r.status
                  )}
                </td>
                <td>
                  {editId === r.id ? (
                    <>
                      <button
                        onClick={() => handleSave(r.id)}
                        style={{
                          marginRight: 6,
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        style={{
                          background: "#e2e8f0",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(r.id, r.status)}
                        style={{
                          marginRight: 6,
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
