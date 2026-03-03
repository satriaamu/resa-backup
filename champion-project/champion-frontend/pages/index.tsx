import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useQuery, gql } from "@apollo/client";
import client from "../lib/apolloClient";

const GET_FIELDS_WITH_SLOTS = gql`
  query($tanggal: String!) {
    fields {
      id
      nama_lapangan
      harga_per_jam
      tipe
      slots(tanggal: $tanggal) {
        id
        jam_mulai
        jam_selesai
        status
      }
    }
  }
`;

// Navbar Component
function Navbar() {
  return (
    <nav
      style={{
        background: "#ffffff",
        padding: "1rem 2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <img
          src="/champion-futsal-logo.png"
          alt="Champion Futsal"
          style={{ height: "45px", objectFit: "contain" }}
        />
        <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "#1e293b" }}>
          Champion Futsal
        </span>
      </div>

      {/* Menu */}
     <ul
        style={{
          display: "flex",
          listStyle: "none",
          gap: "1.5rem",
          margin: 0,
          padding: 0,
        }}
      >
        {["Home", "Venue", "Event"].map((menu, idx) => (
          <li key={idx}>
            <a
              href={`#${menu.toLowerCase()}`}
              style={{
                textDecoration: "none",
                color: "#334155",
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              {menu}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Komponen slider foto
function ImageSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const next = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
      <img
        src={images[index]}
        alt={`slide-${index}`}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
          display: "block",
          borderRadius: "12px",
        }}
      />
      {/* tombol prev/next */}
     
      
    </div>
  );
}

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const { data, loading } = useQuery(GET_FIELDS_WITH_SLOTS, {
    client,
    variables: { tanggal: today },
  });
  const router = useRouter();

  // Data gambar untuk slider per lapangan
  const imagesMap: Record<string, string[]> = {
    "Lapangan Futsal A": ["/LapanganA.jpg"],
    "Lapangan Futsal B": ["/LapanganB.jpg"],
  };

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header
        id="home"
        style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          color: "#ffffff",
          padding: "4rem 1rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: 700 }}>
          Futsal Champion Bahu
        </h1>
        <p style={{ marginTop: "1rem", fontSize: "1.1rem", color: "#e2e8f0" }}>
          Reservasi lapangan futsal lebih modern, cepat, dan tanpa ribet ⚡
        </p>
      </header>

      {/* Venue Section */}
      <main
        id="venue"
        style={{ maxWidth: 1100, margin: "2.5rem auto", padding: "0 1rem" }}
      >
        <h2
          style={{
            color: "#1e293b",
            marginBottom: "2rem",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          📍 Venue Kami
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : !data || !data.fields ? (
          <p>Tidak ada data lapangan.</p>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {data.fields.map((field: any) => (
              <div
                key={field.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                  padding: "1.5rem",
                  flex: "1 1 320px",
                  maxWidth: "350px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 0.3rem 0",
                    color: "#0f172a",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "1.2rem",
                  }}
                >
                  {field.nama_lapangan}
                </h3>
                <p
                  style={{
                    textAlign: "center",
                    color: "#475569",
                    fontSize: "0.95rem",
                    marginBottom: "0.8rem",
                  }}
                >
                  💰 Rp
                  {["Lapangan Futsal A", "Lapangan Futsal B"].includes(field.nama_lapangan)
                    ? "175.000"
                    : field.harga_per_jam}{" "}
                  / jam
                </p>

                {/* Slider Foto Lapangan */}
                <ImageSlider images={imagesMap[field.nama_lapangan] || ["/champion-futsal-logo.png"]} />

                {/* Jam Booking */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    justifyContent: "center",
                    marginTop: "1rem",
                  }}
                >
                  {field.slots.map((slot: any) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        if (slot.status === "tersedia") {
                          router.push(
                            `/reservasi?fieldId=${field.id}&slotId=${slot.id}&tanggal=${today}&jam_mulai=${slot.jam_mulai}&jam_selesai=${slot.jam_selesai}`
                          );
                        }
                      }}
                      disabled={slot.status !== "tersedia"}
                      style={{
                        padding: "0.5rem 0.9rem",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: slot.status !== "tersedia" ? "#e2e8f0" : "#f1f5f9",
                        color: slot.status !== "tersedia" ? "#94a3b8" : "#0f172a",
                        cursor: slot.status !== "tersedia" ? "not-allowed" : "pointer",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      {slot.jam_mulai} - {slot.jam_selesai}{" "}
                      {slot.status !== "tersedia" && "❌"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Event Section */}
      <section
        id="event"
        style={{
          maxWidth: 900,
          margin: "3rem auto",
          padding: "2rem 1rem",
          background: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#1e293b", marginBottom: "1rem", fontWeight: 600 }}>
          🎉 Event
        </h2>
        <p style={{ color: "#64748b", fontSize: "1rem" }}>
          Nantikan berbagai event seru di Champion Futsal!
        </p>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "1.2rem 0",
          color: "#94a3b8",
          fontSize: "0.9rem",
        }}
      >
        &copy; {new Date().getFullYear()} Champion Futsal. All rights reserved.
      </footer>
    </div>
  );
}
