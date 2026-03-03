import { useQuery, gql, useMutation } from "@apollo/client";
import client from "../lib/apolloClient";
import { useState } from "react";
import SidebarAdmin from "./SidebarAdmin";
import { useRouter } from "next/router";

const GET_FIELDS = gql`
  query {
    fields {
      id
      nama_lapangan
      tipe
    }
  }
`;

const GET_SLOTS = gql`
  query ($fieldId: ID!, $tanggal: String!) {
    slots(fieldId: $fieldId, tanggal: $tanggal) {
      id
      jam_mulai
      jam_selesai
      status
    }
  }
`;

const CREATE_SLOT = gql`
  mutation (
    $fieldId: ID!
    $tanggal: String!
    $jam_mulai: String!
    $jam_selesai: String!
    $status: String!
  ) {
    createSlot(
      fieldId: $fieldId
      tanggal: $tanggal
      jam_mulai: $jam_mulai
      jam_selesai: $jam_selesai
      status: $status
    ) {
      id
      tanggal
      jam_mulai
      jam_selesai
      status
      field {
        nama_lapangan
      }
    }
  }
`;

const DELETE_SLOT = gql`
  mutation ($slotId: ID!) {
    deleteSlot(slotId: $slotId) {
      id
    }
  }
`;

export default function AdminSlot() {
  const { data, loading } = useQuery(GET_FIELDS, { client });
  const [createSlot] = useMutation(CREATE_SLOT, { client });
  const [deleteSlot] = useMutation(DELETE_SLOT, { client });
  const [fieldId, setFieldId] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
  const [status, setStatus] = useState("tersedia");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const { data: slotData, refetch: refetchSlots } = useQuery(GET_SLOTS, {
    client,
    variables: { fieldId, tanggal },
    skip: !fieldId || !tanggal,
  });

  if (loading) return <p>Loading...</p>;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createSlot({
        variables: {
          fieldId,
          tanggal,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          status,
        },
      });
      setSuccess("✅ Slot berhasil ditambahkan!");
      setJamMulai("");
      setJamSelesai("");
      refetchSlots();
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menambah slot.");
    }
  };

  const handleDelete = async (slotId: string) => {
    try {
      if (confirm("Yakin hapus slot ini?")) {
        await deleteSlot({ variables: { slotId } });
        refetchSlots();
        setSuccess("🗑️ Slot berhasil dihapus.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghapus slot.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5" }}>
      <SidebarAdmin />
      <div style={{ flex: 1, padding: "32px" }}>
        <h1 style={{ fontSize: 24, marginBottom: 20, color: "#334155" }}>
          📅 Tambah Slot Jadwal Lapangan
        </h1>

        {/* FORM CARD */}
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: 30,
            maxWidth: 600,
          }}
        >
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: 10 }}>
              Lapangan:
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 5,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Pilih Lapangan</option>
                {data?.fields?.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.nama_lapangan} ({f.tipe})
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginBottom: 10 }}>
              Tanggal:
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 5,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ flex: 1 }}>
                Jam Mulai:
                <input
                  type="time"
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 5,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                  }}
                />
              </label>
              <label style={{ flex: 1 }}>
                Jam Selesai:
                <input
                  type="time"
                  value={jamSelesai}
                  onChange={(e) => setJamSelesai(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 5,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                  }}
                />
              </label>
            </div>

            <label style={{ display: "block", margin: "12px 0" }}>
              Status:
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 5,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              >
                <option value="tersedia">Tersedia</option>
                <option value="terpesan">Terpesan</option>
              </select>
            </label>

            <button
              type="submit"
              style={{
                background: "#1976d2",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Tambah Slot
            </button>
          </form>

          {success && <p style={{ color: "green", marginTop: 10 }}>{success}</p>}
          {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        </div>

        {/* TABLE SECTION */}
        {fieldId && tanggal && (
          <div>
            <h2 style={{ marginBottom: 10, color: "#1e3a8a" }}>Daftar Slot ({tanggal})</h2>
            {!slotData ? (
              <p>Silakan pilih lapangan dan tanggal.</p>
            ) : slotData.slots.length === 0 ? (
              <p>Belum ada slot untuk tanggal ini.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#fff",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <thead style={{ background: "#1976d2", color: "#fff" }}>
                  <tr>
                    <th style={{ padding: 12, textAlign: "left" }}>Jam Mulai</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Jam Selesai</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {slotData.slots.map((slot: any, i: number) => (
                    <tr
                      key={slot.id}
                      style={{
                        background: i % 2 === 0 ? "#fafafa" : "#fff",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <td style={{ padding: 10 }}>{slot.jam_mulai}</td>
                      <td style={{ padding: 10 }}>{slot.jam_selesai}</td>
                      <td style={{ padding: 10 }}>
                        <span
                          style={{
                            color: slot.status === "tersedia" ? "green" : "red",
                            fontWeight: "bold",
                          }}
                        >
                          {slot.status}
                        </span>
                      </td>
                      <td style={{ padding: 10 }}>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#d32f2f",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
