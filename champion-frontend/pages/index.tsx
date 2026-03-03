// pages/index.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useQuery, gql } from "@apollo/client";
import client from "../lib/apolloClient";
import Footer from "./footer";
import Navbar from "./navbar";



const GET_FIELDS_WITH_SLOTS = gql`
  query ($tanggal: String!) {
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

// ======================
// 🔹 Navbar
// ======================
// ...existing code...
  <Navbar />
// ...existing code...

// ======================
// 🔹 Image Slider (baru)
// ======================
function ImageSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [manual, setManual] = useState(false);

  // 🔹 Auto slide tiap 5 detik
  useEffect(() => {
    if (!manual) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images.length, manual]);

  // 🔹 Fungsi next dan prev
  const nextSlide = () => {
    setManual(true);
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setManual(false), 8000);
  };

  const prevSlide = () => {
    setManual(true);
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setManual(false), 8000);
  };

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        height: "260px",
        boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
      }}
    >
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`slide-${i}`}
          style={{
            width: "100%",
            height: "260px",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        />
      ))}

      {/* 🔹 Tombol Navigasi manual */}
      <button
        onClick={prevSlide}
        style={{
          position: "absolute",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.4)",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          color: "white",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.4)",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          color: "white",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ❯
      </button>

      {/* 🔹 Indikator titik */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "6px",
        }}
      >
        {images.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? "10px" : "8px",
              height: i === index ? "10px" : "8px",
              borderRadius: "50%",
              background: i === index ? "#2563eb" : "#cbd5e1",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ======================
   🔹 EVENT – DEFAULT IMAGE
====================== */
const defaultEventImages = [
  "/event1.jpg",
  "/event2.jpeg",
  "/event3.jpg",
  "/event4.jpeg",
];

/* ======================
   🔹 EVENT CAROUSEL (SINKRON DENGAN event.tsx)
====================== */
function EventCarousel() {
  const [eventImages, setEventImages] = useState<string[]>(defaultEventImages);
  const [index, setIndex] = useState(0);

  // 🔹 Ambil gambar event dari dashboard admin
  useEffect(() => {
    const savedImages = localStorage.getItem("eventImages");
    if (savedImages) {
      const parsed = JSON.parse(savedImages);
      if (parsed.length > 0) {
        setEventImages(parsed);
      }
    }
  }, []);

  // 🔹 Auto slide
  useEffect(() => {
    if (eventImages.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % eventImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [eventImages]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 1000,
        margin: "0 auto",
        borderRadius: "16px",
        overflow: "hidden",
        aspectRatio: "16 / 9",
        background: "#ffffff",
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {eventImages.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`event-${i}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",        // ✅ sama dengan event.tsx
            objectPosition: "50% 50%",   // ✅ selalu di tengah
            opacity: i === index ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        />
      ))}
    </div>
  );
}



// ======================
// 🔹 Halaman Utama
// ======================
export default function Home() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const { data, loading, refetch } = useQuery(GET_FIELDS_WITH_SLOTS, {
    client,
    variables: { tanggal },
  });
  const router = useRouter();

  const imagesMap: Record<string, string[]> = {
    "Lapangan Futsal A": [
      "/LapanganA1.jpg",
      "/LapanganA2.jpg",
      "/LapanganA3.jpg",
      "/LapanganA4.jpg",
    ],
    "Lapangan Futsal B": [
      "/LapanganB1.jpg",
      "/LapanganB2.jpg",
      "/LapanganB3.jpg",
      "/LapanganB4.jpg",
    ],
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

      <Navbar />

      {/* Hero Section */}
      <header
        style={{
          position: "relative",
          height: "70vh",
          backgroundImage: "url('/hero-futsal.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ margin: 0, fontSize: "3rem", fontWeight: 700 }}>
            Futsal Champion Bahu
          </h1>
          <p style={{ marginTop: "1rem", fontSize: "1.3rem", color: "#e2e8f0" }}>
            Reservasi lapangan futsal yang lebih modern, cepat, dan tanpa ribet 
          </p>
        </div>
      </header>

      {/* Venue Section */}
      <main style={{ maxWidth: 1100, margin: "2.5rem auto", padding: "0 1rem" }}>
        <h2
          style={{
            color: "#1e293b",
            marginBottom: "1rem",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          Venue Kami
        </h2>

        {/* 🔹 Filter Tanggal */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <div
            style={{
              background: "#ffffff",
              padding: "0.7rem 1.2rem",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <label
              htmlFor="tanggal"
              style={{
                fontWeight: 500,
                color: "#334155",
                fontSize: "0.9rem",
              }}
            >
              Pilih Tanggal:
            </label>
            <input
              id="tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => {
                setTanggal(e.target.value);
                refetch({ tanggal: e.target.value });
              }}
              style={{
                padding: "0.4rem 0.6rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontFamily: "Poppins, sans-serif",
                fontSize: "0.9rem",
                cursor: "pointer",
                color: "#1e293b",
              }}
            />
          </div>
        </div>

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
                  flex: "1 1 350px",
                  maxWidth: "900px",
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
                   Rp
                  {["Lapangan Futsal A", "Lapangan Futsal B"].includes(
                    field.nama_lapangan
                  )
                    ? "175.000"
                    : field.harga_per_jam}{" "}
                  / jam
                </p>

                <ImageSlider
                  images={
                    imagesMap[field.nama_lapangan] || ["/champion-futsal-logo.png"]
                  }
                />

                <div
                  style={{
                    textAlign: "center",
                    fontWeight: 500,
                    marginTop: "1rem",
                    fontSize: "0.9rem",
                    color: "#1e293b",
                  }}
                >
                  Waktu Tersedia:
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    justifyContent: "center",
                    marginTop: "1rem",
                  }}
                >
                  {field.slots.map((slot: any) => {
                    const isAvailable = slot.status === "tersedia";
                    const isExpired = slot.status === "expired";
                    return (
                      <button
                        key={slot.id}
                        onClick={() => {
                          if (isAvailable) {
                            router.push(
                              `/reservasi?fieldId=${field.id}&slotId=${slot.id}&tanggal=${tanggal}&jam_mulai=${slot.jam_mulai}&jam_selesai=${slot.jam_selesai}`
                            );
                          }
                        }}
                        disabled={!isAvailable}
                        style={{
                          padding: "0.5rem 0.9rem",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          background: isAvailable
                            ? "#f1f5f9"
                            : isExpired
                            ? "#fecaca"
                            : "#e2e8f0",
                          color: isAvailable
                            ? "#0f172a"
                            : isExpired
                            ? "#991b1b"
                            : "#94a3b8",
                          cursor: isAvailable ? "pointer" : "not-allowed",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          opacity: isExpired ? 0.7 : 1,
                        }}
                        title={isExpired ? "Jam sudah lewat" : ""}
                      >
                        {slot.jam_mulai} - {slot.jam_selesai}{" "}
                        {!isAvailable && "❌"}
                      </button>
                    );
                  })}
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
          maxWidth: 1065,
          margin: "3rem auto",
          padding: "2rem 1rem",
          background: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#1e293b", marginBottom: "1rem", fontWeight: 600 }}>
           Event dan Promosi
        </h2>
        <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "1.5rem" }}>
          Nikmati berbagai event dan turnamen seru setiap bulan! 
        </p>

        <EventCarousel />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
