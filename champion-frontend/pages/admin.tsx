import { useQuery, gql, useMutation } from "@apollo/client";
import client from "../lib/apolloClient";
import { useState, useEffect } from "react";
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
      user { nama email no_telepon }
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
function parseDateInput(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const d1 = new Date(value);
    if (!isNaN(d1.getTime())) return d1;
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    if (/^\d+$/.test(value)) {
      return new Date(Number(value.length === 10 ? Number(value) * 1000 : Number(value)));
    }
  }
  if (typeof value === "object") {
    if (value.year && value.month && value.day) {
      return new Date(value.year, value.month - 1, value.day);
    }
    if (value.seconds) return new Date(value.seconds * 1000);
  }
  return null;
}

function formatDate(value: any, style: "long" | "iso" = "long") {
  const dt = parseDateInput(value);
  if (!dt) return "—";
  if (style === "iso") return dt.toISOString().split("T")[0];
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
  const { data, loading, error, refetch } = useQuery(GET_ALL_RESERVATIONS, { 
    client,
    pollInterval: 3000, // Auto-refresh setiap 3 detik
  });
  const [updateStatus] = useMutation(UPDATE_RESERVATION_STATUS, { client });
  const [deleteReservation] = useMutation(DELETE_RESERVATION, { client });
  const [editId, setEditId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");

  // Auto-refetch saat halaman mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <SidebarAdmin />
        <div style={{ flex: 1, padding: 24 }}>Loading data reservasi...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex" }}>
        <SidebarAdmin />
        <div style={{ flex: 1, padding: 24, color: "red" }}>Error: {error.message}</div>
      </div>
    );
  }

  const reservations = data?.reservationsAll || [];

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ margin: 0, color: "#1e293b" }}>Daftar Reservasi Lapangan</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              {loading ? "⏳ Memperbarui data..." : "✅ Data real-time"}
            </span>
            <button
              onClick={() => refetch()}
              style={{
                padding: "8px 16px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              🔄 Refresh Manual
            </button>
          </div>
        </div>

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
              <th>Kontak (No. Telepon)</th>
              <th>Lapangan</th>
              <th>Tipe</th>
              <th>Tanggal</th>
              <th>Jam</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  Belum ada reservasi.
                </td>
              </tr>
            ) : (
              reservations.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.user?.nama || "—"}</td>
                  <td>{r.user?.no_telepon || "—"}</td>
                  <td>{r.field?.nama_lapangan || "—"}</td>
                  <td>{r.field?.tipe || "—"}</td>
                  <td>{formatDate(r.tanggal)}</td>
                  <td>{r.jam_mulai} - {r.jam_selesai}</td>
                  <td>
                    {editId === r.id ? (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 4 }}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
