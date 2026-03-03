// ...existing code...
import React from "react";
import Head from "next/head";
import Navbar from "./navbar";
import Footer from "./footer";

export default function AboutUs() {
  return (
    <div style={{ fontFamily: "Poppins, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      <Head>
        <title>About Us - Champion Futsal</title>
      </Head>

      <Navbar />

      <header style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "2.2rem", color: "#0f172a" }}>About Us</h1>
        <p style={{ marginTop: "0.8rem", color: "#64748b" }}>
          Champion Futsal Bahu berdiri sebagai salah satu tempat olahraga khususnya di bidang futsal, Dan pilihan utama bagi pecinta futsal di kawasan Manado.
          Berawal dari kebutuhan masyarakat akan lapangan yang nyaman, terawat, dan mudah diakses, Champion Futsal Bahu
          hadir untuk menyediakan fasilitas olahraga yang berkualitas bagi semua kalangan.
          Sejak dibuka, tempat ini terus berkembang dan menjadi lokasi favorit untuk bermain, latihan, maupun persiapan pertandingan.
          Dengan lapangan yang baik, pelayanan ramah, serta suasana yang aman dan nyaman, kami berkomitmen memberikan pengalaman terbaik
          bagi setiap pemain. Kini, Champion Futsal Bahu juga menjadi ruang komunitas tempat berbagai event dan kegiatan olahraga berlangsung.
          Kami percaya bahwa futsal tidak hanya soal pertandingan, tetapi juga tentang kebersamaan, kesehatan, dan membangun komunitas positif.
        </p>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
        <section style={{ background: "#ffffff", padding: "1.5rem", borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#1e293b", fontSize: "1.2rem" }}>Lokasi dan Informasi</h2>
          <p style={{ color: "#475569" }}>
            Alamat: Jl. Wolter Monginsidi, Bahu, Kec. Malalayang, Kota Manado, Sulawesi Utara
            <br />Telepon: 0812-3456-7890<br />
            Facebook: Champion Futsal Bahu
          </p>
        </section>

        <section style={{ marginTop: "1rem", background: "#ffffff", padding: "1.5rem", borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#1e293b", fontSize: "1.2rem" }}>Owner Champion Futsal Bahu</h2>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center", marginTop: "1rem" }}>
            <img
              src="/owner.jpeg"   // GANTI DENGAN FOTO OWNER
              alt="Foto Owner"
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 6px 14px rgba(0,0,0,0.12)"
              }}
            />

            <p style={{ color: "#475569", margin: 0, maxWidth: 720 }}>
              Champion Futsal Bahu dikelola oleh <strong>Christian Yokung, S.Kom</strong>.
              Beliau berperan dalam mengembangkan fasilitas dan layanan, serta memastikan setiap pemain
              mendapatkan pengalaman terbaik saat berkunjung ke Champion Futsal Bahu.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
// ...existing code...
