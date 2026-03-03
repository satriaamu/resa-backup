import { useQuery, gql, useMutation } from "@apollo/client";
import client from "../lib/apolloClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const GET_FIELDS = gql`
  query {
    fields {
      id
      nama_lapangan
      tipe
      harga_per_jam
    }
  }
`;

const CREATE_USER = gql`
  mutation($nama: String!, $email: String!) {
    createUser(nama: $nama, email: $email) {
      id
      nama
      email
    }
  }
`;

const CREATE_RESERVATION = gql`
  mutation($input: ReservationInput!) {
    createReservation(input: $input) {
      id
      status
      slot { jam_mulai jam_selesai }
      field { nama_lapangan }
    }
  }
`;

export default function ReservasiPage() {
  const { data, loading } = useQuery(GET_FIELDS, { client });
  const [selected, setSelected] = useState<any>(null);
  const router = useRouter();

  const { fieldId, slotId, tanggal, jam_mulai, jam_selesai } = router.query;

  useEffect(() => {
    if (data && fieldId && slotId && tanggal && jam_mulai && jam_selesai) {
      const field = data.fields.find((f: any) => f.id === fieldId);
      if (field) {
        setSelected({
          ...field,
          slot: {
            id: slotId,
            tanggal,
            jam_mulai,
            jam_selesai,
            status: "tersedia",
          },
        });
      }
    }
  }, [data, fieldId, slotId, tanggal, jam_mulai, jam_selesai]);

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.bg}>
      <div style={styles.container}>
        <h1 style={styles.title}>Reservasi Lapangan</h1>
        {selected && selected.slot ? (
          <ReservationForm
            field={selected}
            slot={selected.slot}
            onClose={() => router.push("/reservasi")}
          />
        ) : (
          <>
            <h2 style={styles.subtitle}>Pilih Lapangan</h2>
            <ul style={styles.fieldList}>
              {data.fields.map((f: any) => (
                <li key={f.id} style={styles.fieldCard}>
                  <div>
                    <span style={styles.fieldName}>{f.nama_lapangan}</span>
                    <span style={styles.fieldType}>{f.tipe}</span>
                  </div>
                  <div style={styles.fieldPrice}>Rp{f.harga_per_jam}/jam</div>
                  <button style={styles.primaryBtn} onClick={() => setSelected(f)}>
                    Lihat Jadwal
                  </button>
                </li>
              ))}
            </ul>
            {selected && <SlotList field={selected} />}
          </>
        )}
      </div>
    </div>
  );
}

function SlotList({ field }: any) {
  const [tanggal, setTanggal] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const fetchSlots = async () => {
    setLoading(true);
    const res = await client.query({
      query: gql`
        query($fieldId: ID!, $tanggal: String!) {
          slots(fieldId: $fieldId, tanggal: $tanggal) {
            id
            jam_mulai
            jam_selesai
            status
          }
        }
      `,
      variables: { fieldId: field.id, tanggal },
    });
    setSlots(res.data.slots);
    setLoading(false);
  };

  return (
    <div style={styles.slotSection}>
      <div style={styles.slotHeader}>
        <h3 style={{ margin: 0, color: "#1e293b" }}>Jadwal {field.nama_lapangan}</h3>
        <div>
          <input
            type="date"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
            style={styles.input}
          />
          <button style={styles.secondaryBtn} onClick={fetchSlots}>
            Lihat Slot
          </button>
        </div>
      </div>
      {loading && <div style={styles.loading}>Loading slot...</div>}
      <ul style={styles.slotList}>
        {slots.map(s => (
          <li key={s.id} style={styles.slotCard}>
            <span style={{ fontWeight: 500 }}>
              {s.jam_mulai} - {s.jam_selesai}
            </span>
            <span style={{
              ...styles.slotStatus,
              background: s.status === "tersedia" ? "#e3f2fd" : "#ffe0e0",
              color: s.status === "tersedia" ? "#1976d2" : "#c62828"
            }}>
              {s.status}
            </span>
            {s.status === "tersedia" && (
              <button style={styles.primaryBtnSmall} onClick={() => setSelectedSlot({ ...s, tanggal })}>
                Pesan
              </button>
            )}
          </li>
        ))}
      </ul>
      {selectedSlot && (
        <ReservationForm
          field={field}
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}

function ReservationForm({ field, slot, onClose }: any) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [createUser] = useMutation(CREATE_USER, { client });
  const [createReservation] = useMutation(CREATE_RESERVATION, { client });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data: userData } = await createUser({ variables: { nama, email } });
      await createReservation({
        variables: {
          input: {
            userId: userData.createUser.id,
            fieldId: field.id,
            slotId: slot.id,
            tanggal: slot.tanggal,
            jam_mulai: slot.jam_mulai,
            jam_selesai: slot.jam_selesai,
          },
        },
      });
      setSuccess("Reservasi berhasil! Silakan cek status di admin.");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.formWrapper}>
      <h3 style={styles.formTitle}>Formulir Reservasi</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nama</label>
          <input
            style={styles.input}
            value={nama}
            onChange={e => setNama(e.target.value)}
            required
            placeholder="Nama lengkap"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Alamat email"
            type="email"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Lapangan</label>
          <input style={styles.input} value={field.nama_lapangan} disabled />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Tanggal</label>
          <input style={styles.input} value={slot.tanggal} disabled />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Jam</label>
          <input style={styles.input} value={`${slot.jam_mulai} - ${slot.jam_selesai}`} disabled />
        </div>
        <div style={styles.formActions}>
          <button style={styles.primaryBtn} type="submit" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Reservasi"}
          </button>
          <button style={styles.secondaryBtn} type="button" onClick={onClose}>
            Batal
          </button>
        </div>
      </form>
      {success && <div style={styles.successMsg}>{success}</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}
    </div>
  );
}

// CSS-in-JS styles
const styles: Record<string, any> = {
  bg: {
    minHeight: "100vh",
    background: "linear-gradient(120deg, #e3f2fd 60%, #ffffff 100%)",
    fontFamily: "Poppins, sans-serif",
    padding: "40px 0",
  },
  container: {
    maxWidth: 700,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(25,118,210,0.10)",
    padding: 36,
  },
  title: {
    fontWeight: 700,
    fontSize: 32,
    marginBottom: 16,
    color: "#334155",
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    fontWeight: 600,
    fontSize: 20,
    margin: "24px 0 12px 0",
    color: "#1976d2",
    letterSpacing: 0.5,
  },
  fieldList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 18,
  },
  fieldCard: {
    background: "#e3f2fd",
    borderRadius: 12,
    padding: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.06)",
    gap: 16,
  },
  fieldName: {
    fontWeight: 600,
    fontSize: 18,
    color: "#334155",
    marginRight: 8,
  },
  fieldType: {
    fontSize: 14,
    color: "#334155",
    background: "#fff",
    borderRadius: 6,
    padding: "2px 10px",
    marginLeft: 8,
    fontWeight: 500,
    border: "1px solid #bbdefb",
  },
  fieldPrice: {
    fontWeight: 500,
    color: "#388e3c",
    fontSize: 16,
    marginRight: 16,
  },
  primaryBtn: {
    background: "linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 22px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
    transition: "background 0.2s",
    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.08)",
  },
  primaryBtnSmall: {
    background: "#334155",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 16px",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 14,
    marginLeft: 12,
    boxShadow: "0 1px 4px rgba(25, 118, 210, 0.08)",
  },
  secondaryBtn: {
    background: "#fff",
    color: "#334155",
    border: "1.5px solid #334155",
    borderRadius: 8,
    padding: "8px 20px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
    marginLeft: 8,
    transition: "background 0.2s",
  },
  slotSection: {
    marginTop: 32,
    background: "#f5faff",
    borderRadius: 14,
    padding: 28,
    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.04)",
  },
  slotHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  slotList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 14,
  },
  slotCard: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: 10,
    padding: "12px 18px",
    boxShadow: "0 1px 4px rgba(25, 118, 210, 0.06)",
    gap: 16,
  },
  slotStatus: {
    fontWeight: 600,
    fontSize: 13,
    borderRadius: 6,
    padding: "2px 12px",
    marginLeft: 12,
    border: "1px solid #bbdefb",
  },
  formWrapper: {
    background: "#e3f2fd",
    borderRadius: 14,
    padding: 32,
    marginTop: 36,
    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.06)",
    maxWidth: 440,
    marginLeft: "auto",
    marginRight: "auto",
  },
  formTitle: {
    fontWeight: 600,
    fontSize: 22,
    marginBottom: 18,
    color: "#334155",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontWeight: 500,
    color: "#334155",
    marginBottom: 2,
  },
  input: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1.5px solid #bdbdbd",
    fontSize: 15,
    outline: "none",
    transition: "border 0.2s",
    background: "#fff",
  },
  formActions: {
    display: "flex",
    gap: 12,
    marginTop: 8,
  },
  successMsg: {
    color: "#388e3c",
    background: "#e8f5e9",
    borderRadius: 8,
    padding: "10px 16px",
    marginTop: 16,
    textAlign: "center",
    fontWeight: 500,
  },
  errorMsg: {
    color: "#c62828",
    background: "#ffebee",
    borderRadius: 8,
    padding: "10px 16px",
    marginTop: 16,
    textAlign: "center",
    fontWeight: 500,
  },
  loading: {
    textAlign: "center",
    color: "#0c253dff",
    fontWeight: 500,
    marginTop: 40,
    fontSize: 18,
  },
};