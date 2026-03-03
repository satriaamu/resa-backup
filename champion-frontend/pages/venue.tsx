// pages/venue.tsx
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useQuery, gql } from "@apollo/client";
import client from "../lib/apolloClient";
import { useRouter } from "next/router";
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



// 🖼️ Komponen ImageSlider
function ImageSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!manual) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images.length, manual]);

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
        height: "180px",
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
            height: "180px",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        />
      ))}

      {/* Tombol navigasi manual */}
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
          width: "30px",
          height: "30px",
          color: "white",
          fontSize: "16px",
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
          width: "30px",
          height: "30px",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        ❯
      </button>

      {/* Indikator titik */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "5px",
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

export default function VenuePage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  // Deskripsi Champion Bahu (form lokal, disimpan ke localStorage)
  const [description, setDescription] = useState({
    ukuran_lapangan: "20m x 40m",
    fasilitas: "Penerangan LED, Toilet, Ruang ganti, Tempat parkir" ,
    jam_operasional: "08:00 - 22:00",
    harga_rata_rata: "175000",
    catatan: " Reservasi Minimal 1 Jam, Lapangan Sintetis Kualitas A (5 vs 5)",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("champion_bahu_description");
      if (saved) setDescription(JSON.parse(saved));
    } catch (e) {
      // ignore
    }
  }, []);

  const saveDescription = () => {
    try {
      localStorage.setItem(
        "champion_bahu_description",
        JSON.stringify(description)
      );
      alert("Deskripsi Champion Bahu disimpan (lokal).");
    } catch (e) {
      alert("Gagal menyimpan deskripsi.");
    }
  };

  const { data, loading, error, refetch } = useQuery(GET_FIELDS_WITH_SLOTS, {
    client,
    variables: { tanggal: selectedDate },
  });

  const router = useRouter();

  const customHarga: Record<string, number> = {
    "Lapangan Futsal A": 175000,
    "Lapangan Futsal B": 175000,
  };

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

  if (loading)
    return <div style={{ textAlign: "center", marginTop: "4rem" }}>Loading...</div>;

  if (error)
    return (
      <div style={{ textAlign: "center", marginTop: "4rem", color: "red" }}>
        Gagal memuat data lapangan.
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <Head>
        <title>Venue | Champion Futsal</title>
      </Head>

      <Navbar />

      <section style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1e293b" }}>
        Daftar Lapangan & Slot Tersedia
        </h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          Pilih lapangan dan langsung lakukan reservasi cepat 
        </p>

        <div style={{ marginBottom: "2rem" }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              refetch({ tanggal: e.target.value });
            }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontFamily: "Poppins, sans-serif",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {data?.fields?.map((field: any) => (
            <div
              key={field.id}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                padding: "1.5rem",
                flex: "1 1 320px",
                maxWidth: "380px",
                position: "relative",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.06)";
              }}
            >
              <h3
                style={{
                  marginBottom: "0.5rem",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
              >
                {field.nama_lapangan}
              </h3>

              {/* 🖼️ Gambar pakai slider */}
              <ImageSlider
                images={
                  imagesMap[field.nama_lapangan] || ["/champion-futsal-logo.png"]
                }
              />

              <p
                style={{
                  color: "#475569",
                  fontSize: "0.95rem",
                  marginBottom: "0.5rem",
                }}
              >
                💰 Rp{" "}
                {(
                  customHarga[field.nama_lapangan] ?? field.harga_per_jam
                ).toLocaleString("id-ID")}{" "}
                / jam
              </p>

              <p
                style={{
                  color: "#22c55e",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                {field.slots.filter((s: any) => s.status === "tersedia").length} slot
                tersedia
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  justifyContent: "center",
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
                            `/reservasi?fieldId=${field.id}&slotId=${slot.id}&tanggal=${selectedDate}&jam_mulai=${slot.jam_mulai}&jam_selesai=${slot.jam_selesai}`
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
                        transition: "all 0.2s ease",
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
      </section>

      {/* Seksi Deskripsi Champion Bahu (baca-saja) */}
      <section
        style={{
          background: "#ffffff",
          margin: "1rem",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h2 style={{ marginBottom: "0,5 rem", color: "#0f172a" }}>
          Deskripsi
        </h2>
        <div style={{ display: "grid", gap: "0.5rem" }}>
        <p style={{ color: "#000000ff", margin: 0 }}>
                    <strong>Catatan:</strong> {description.catatan}
                  </p>
        
          <p style={{ color: "#000000ff", margin: 0 }}>
            <strong>Ukuran Lapangan:</strong> {description.ukuran_lapangan}
          </p>

          {/* <p style={{ color: "#475569", margin: 0 }}>
            <strong>Fasilitas:</strong> {description.fasilitas}
          </p> */}

          <p style={{ color: "#000000ff", margin: 0 }}>
            <strong>Jam Operasional:</strong> {description.jam_operasional}
          </p>

          <p style={{ color: "#000000ff", margin: 0 }}>
            <strong>Harga Rata-rata:</strong> Rp {Number(description.harga_rata_rata).toLocaleString("id-ID")}
          </p>

          <div>
          <strong>Fasilitas:</strong>
          <div style={{ marginTop: "0.5rem" }}>
           {description.fasilitas.split(", ").map((item, index) => (
          <div key={index} style={{ marginBottom: "0.25rem" }}>
         {item}
          </div>
          ))}
          </div>
        </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
