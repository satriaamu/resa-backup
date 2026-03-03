import { useQuery, gql, useMutation } from "@apollo/client";
import client from "../lib/apolloClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

/* =========================
   GRAPHQL
========================= */
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
  mutation ($nama: String!, $email: String!, $password: String!) {
    createUser(nama: $nama, email: $email, password: $password) {
      id
      nama
      email
    }
  }
`;

const CREATE_RESERVATION = gql`
  mutation ($input: ReservationInput!) {
    createReservation(input: $input) {
      id
      status
      slot { jam_mulai jam_selesai }
      field { nama_lapangan }
    }
  }
`;

// 🔐 Helper: Get current logged-in user
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (err) {
    // Invalid JSON
  }
  return null;
};

/* =========================
   PAGE
========================= */
export default function ReservasiPage() {
  const { data, loading } = useQuery(GET_FIELDS, { client });
  const [selected, setSelected] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  const { fieldId, slotId, tanggal, jam_mulai, jam_selesai } = router.query;

  // ==========================================
  // AUTH GUARD
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Akses Ditolak! Anda harus login terlebih dahulu untuk melakukan reservasi.");
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

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

  if (!isAuthorized) {
    return <div style={styles.loading}>Memeriksa autentikasi...</div>;
  }

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

/* =========================
   SLOT LIST
========================= */
function SlotList({ field }: any) {
  const [tanggal, setTanggal] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const fetchSlots = async () => {
    setLoading(true);
    const res = await client.query({
      query: gql`
        query ($fieldId: ID!, $tanggal: String!) {
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
        <h3>Jadwal {field.nama_lapangan}</h3>
        <div>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            style={styles.input}
          />
          <button style={styles.secondaryBtn} onClick={fetchSlots}>
            Lihat Slot
          </button>
        </div>
      </div>

      {loading && <div style={styles.loading}>Loading slot...</div>}

      <ul style={styles.slotList}>
        {slots.map((s) => (
          <li key={s.id} style={styles.slotCard}>
            <span>{s.jam_mulai} - {s.jam_selesai}</span>
            <span style={styles.slotStatus}>{s.status}</span>
            {s.status === "tersedia" && (
              <button
                style={styles.primaryBtnSmall}
                onClick={() => setSelectedSlot({ ...s, tanggal })}
              >
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

/* =========================
   FORM RESERVASI (VERSI LAMA)
========================= */
function ReservationForm({ field, slot, onClose }: any) {
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const [createUser] = useMutation(CREATE_USER, { client });
  const [createReservation] = useMutation(CREATE_RESERVATION, { client });

  // 🔐 Load user data saat component mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsUserLoggedIn(true);
      setNama(user.nama || ""); // Auto-fill nama dari user yang login
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let userId: number;

      if (isUserLoggedIn && currentUser) {
        // 🔒 User sudah login, gunakan userId mereka
        userId = currentUser.id;
      } else {
        // 👤 User belum login, buat user baru
        const email = `${nama.toLowerCase().replace(/\s+/g, ".")}.${Date.now()}@reservasi.local`;
        const password = Math.random().toString(36).substring(2, 10);

        const { data: userData } = await createUser({
          variables: { nama, email, password },
        });

        userId = userData.createUser.id;
      }

      const { data: reservationData } = await createReservation({
        variables: {
          input: {
            userId,
            fieldId: field.id,
            slotId: slot.id,
            tanggal: slot.tanggal,
            jam_mulai: slot.jam_mulai,
            jam_selesai: slot.jam_selesai,
            no_telepon: telepon,
          },
        },
      });

      setSuccess("Reservasi berhasil! Silakan cetak bukti reservasi.");
      openReceipt(reservationData.createReservation);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  const openReceipt = (res: any) => {
  const waktuReservasi = new Date().toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const html = `
    <html>
      <head>
        <title>Bukti Reservasi</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            background: #f5f7fa;
            padding: 32px;
          }

          .receipt {
            max-width: 520px;
            margin: auto;
            background: #ffffff;
            padding: 24px 28px;
            border-radius: 10px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          }

          .receipt h2 {
            text-align: center;
            margin-bottom: 10px;
            color: #1976d2;
          }

          .timestamp {
            text-align: center;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 24px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }

          .row:last-child {
            border-bottom: none;
          }

          .label {
            color: #64748b;
          }

          .value {
            font-weight: 600;
            color: #111827;
          }

          .status {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            background: #e3f2fd;
            color: #1976d2;
            font-size: 12px;
            font-weight: 600;
          }

          .separator {
            margin: 20px 0;
            border-top: 2px solid #e5e7eb;
          }

          .section-title {
            font-weight: 700;
            color: #1f2937;
            font-size: 14px;
            margin-top: 16px;
            margin-bottom: 12px;
          }

          .note {
            background-color: #f3f4f6;
            border-left: 3px solid #dc2626;
            padding: 10px;
            margin: 12px 0;
            font-size: 12px;
            color: #374151;
            line-height: 1.6;
          }

          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <h2>Bukti Reservasi</h2>
          <div class="timestamp">
            Dicetak pada: ${waktuReservasi}
          </div>

          <div class="row">
            <span class="label">Nama</span>
            <span class="value">${nama}</span>
          </div>

          <div class="row">
            <span class="label">Telepon</span>
            <span class="value">${telepon}</span>
          </div>

          <div class="row">
            <span class="label">Lapangan</span>
            <span class="value">${field.nama_lapangan}</span>
          </div>

          <div class="row">
            <span class="label">Tanggal Main</span>
            <span class="value">${slot.tanggal}</span>
          </div>

          <div class="row">
            <span class="label">Jam Main</span>
            <span class="value">${slot.jam_mulai} - ${slot.jam_selesai}</span>
          </div>

          <div class="row">
            <span class="label">Status</span>
            <span class="status">${res.status}</span>
          </div>

          <div class="separator"></div>

          <div class="section-title">💰 INFORMASI PEMBAYARAN</div>
          
          <div class="note">
            <strong>📝 PEMBAYARAN DILAKUKAN DI TEMPAT</strong><br>
            Silakan melakukan pembayaran langsung di lokasi lapangan pada saat tiba.<br><br>
            Tunjukkan bukti reservasi ini kepada petugas untuk verifikasi.
          </div>
        </div>
      </body>
    </html>
  `;



  // iframe tersembunyi (tanpa buka tab baru)
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.right = "0";
  iframe.style.bottom = "0";

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }

  // bersihkan iframe setelah print
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
};


  return (
    <div style={styles.formWrapper}>
      <h3 style={styles.formTitle}>Formulir Reservasi</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label>
          Nama
        </label>
        <input
          style={{
            ...styles.input,
            backgroundColor: isUserLoggedIn ? "#f0fdf4" : "#ffffff",
            cursor: isUserLoggedIn ? "default" : "text",
          }}
          placeholder="Nama lengkap"
          value={nama}
          onChange={(e) => !isUserLoggedIn && setNama(e.target.value)}
          disabled={isUserLoggedIn}
          required
        />

        <label>Nomor Telepon</label>
        <input
          style={styles.input}
          placeholder="08xxxxxxxx"
          value={telepon}
          onChange={(e) => setTelepon(e.target.value)}
          required
        />

        <label>Lapangan</label>
        <input style={styles.input} value={field.nama_lapangan} disabled />

        <label>Tanggal</label>
        <input style={styles.input} value={slot.tanggal} disabled />

        <label>Jam</label>
        <input
          style={styles.input}
          value={`${slot.jam_mulai} - ${slot.jam_selesai}`}
          disabled
        />

        <button style={styles.primaryBtn} disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Reservasi"}
        </button>

        <button type="button" style={styles.secondaryBtn} onClick={onClose}>
          Batal
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          style={{ background: "none", border: "none", color: "#1976d2", cursor: "pointer" }}
        >
          ← Kembali ke Beranda
        </button>
      </form>

      {success && <div style={styles.successMsg}>{success}</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles: Record<string, any> = {
  bg: { minHeight: "100vh", padding: 40, background: "#e3f2fd" },
  container: { maxWidth: 700, margin: "auto", background: "#fff", padding: 30, borderRadius: 12 },
  title: { textAlign: "center", fontSize: 28, fontWeight: 700 },
  subtitle: { marginTop: 20, fontSize: 18 },
  fieldList: { listStyle: "none", padding: 0 },
  fieldCard: { padding: 16, background: "#f1f5f9", marginBottom: 12, borderRadius: 8 },
  fieldName: { fontWeight: 600 },
  fieldType: { marginLeft: 8 },
  fieldPrice: { color: "green" },
  primaryBtn: { background: "#1976d2", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 6 },
  primaryBtnSmall: { background: "#334155", color: "#fff", padding: "6px 12px", borderRadius: 6 },
  secondaryBtn: { background: "#fff", border: "1px solid #334155", padding: "8px 16px", borderRadius: 6 },
  slotSection: { marginTop: 24 },
  slotHeader: { display: "flex", justifyContent: "space-between" },
  slotList: { listStyle: "none", padding: 0 },
  slotCard: { display: "flex", gap: 12, padding: 10 },
  slotStatus: { fontSize: 12 },
  formWrapper: { marginTop: 24, background: "#e3f2fd", padding: 20, borderRadius: 10 },
  formTitle: { textAlign: "center", fontSize: 20 },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  input: { padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  successMsg: { marginTop: 12, color: "green" },
  errorMsg: { marginTop: 12, color: "red" },
  loading: { textAlign: "center", marginTop: 40 },
};
