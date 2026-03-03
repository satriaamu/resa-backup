// pages/event.tsx
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "./navbar";
import Footer from "./footer";

export default function EventPage() {
  // 🔹 Gambar default jika admin belum upload
  const defaultImages = [
    "/event1.jpg",
    "/event2.jpeg",
    "/event3.jpg",
    "/event4.jpeg",
  ];

  const [eventImages, setEventImages] = useState<string[]>(defaultImages);
  const [index, setIndex] = useState(0);

  // 🔹 Ambil gambar event hasil upload admin
  useEffect(() => {
    const savedImages = localStorage.getItem("eventImages");
    if (savedImages) {
      const parsed = JSON.parse(savedImages);
      if (parsed.length > 0) {
        setEventImages(parsed);
      }
    }
  }, []);

  // 🔹 Auto slide setiap 5 detik
  useEffect(() => {
    if (eventImages.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % eventImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [eventImages]);

  const nextSlide = () =>
    setIndex((prev) => (prev + 1) % eventImages.length);

  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + eventImages.length) % eventImages.length);

  const goToSlide = (i: number) => setIndex(i);

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <Head>
        <title>Event | Champion Futsal</title>
      </Head>

      <Navbar />

      <section style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1e293b" }}>
          Event dan Promosi
        </h1>

        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          Lihat keseruan turnamen dan kegiatan di Champion Futsal Bahu!
        </p>

        {/* 🔹 CAROUSEL EVENT */}
        <div
          style={{
            position: "relative",
            width: "90%",
            maxWidth: "900px",
            margin: "0 auto",
            borderRadius: "16px",
            overflow: "hidden",
            aspectRatio: "16 / 9",
            backgroundColor: "#000",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {eventImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`event-${i}`}
              style={{
                position: "absolute",
                inset: 0,                  // ✅ ganti top/left manual
                width: "100%",
                height: "100%",
                objectFit: "contain",      // ✅ tidak terpotong
                objectPosition: "50% 50%", // ✅ selalu di tengah
                opacity: i === index ? 1 : 0,
                transition: "opacity 1s ease-in-out",
              }}
            />
          ))}

          {/* Tombol kiri */}
          <button
            onClick={prevSlide}
            style={{
              position: "absolute",
              left: 15,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.4)",
              border: "none",
              color: "#fff",
              width: 36,
              height: 36,
              borderRadius: "50%",
              fontSize: "1.3rem",
              cursor: "pointer",
            }}
          >
            ‹
          </button>

          {/* Tombol kanan */}
          <button
            onClick={nextSlide}
            style={{
              position: "absolute",
              right: 15,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.4)",
              border: "none",
              color: "#fff",
              width: 36,
              height: 36,
              borderRadius: "50%",
              fontSize: "1.3rem",
              cursor: "pointer",
            }}
          >
            ›
          </button>

          {/* Indikator */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 8,
            }}
          >
            {eventImages.map((_, i) => (
              <div
                key={i}
                onClick={() => goToSlide(i)}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: i === index ? "#2563eb" : "#cbd5e1",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        <p style={{ marginTop: "2rem", color: "#475569" }}>
          Nantikan event berikutnya dan jadilah bagian dari keseruannya!
        </p>
      </section>

      <Footer />
    </div>
  );
}
