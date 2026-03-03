import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "#e6eef8",
        padding: "2rem 1rem",
        marginTop: "2rem",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          justifyContent: "space-between",
        }}
      >
        <div style={{ minWidth: 220 }}>
          <img
            src="/champion-futsal-logo.png"
            alt="Champion Futsal"
            style={{ height: 44, objectFit: "contain", marginBottom: 8 }}
          />
          <p style={{ color: "#cbd5e1", marginTop: 8 }}>
            Champion Futsal — fasilitas futsal nyaman dengan layanan booking mudah.
          </p>
        </div>

        <div style={{ minWidth: 180 }}>
          <h4 style={{ margin: 0, color: "#f1f5f9" }}>Kontak</h4>
          <p style={{ margin: "8px 0 0", color: "#cbd5e1", lineHeight: 1.6 }}>
            Jl. Wolter Monginsidi, Bahu.<br />
            Tel: 0812-3456-7890<br />
            Facebook: Champion Futsal<br />
          </p>
        </div>

        <div style={{ minWidth: 180 }}>
          <h4 style={{ margin: 0, color: "#f1f5f9" }}>Jam Operasional</h4>
          <p style={{ margin: "8px 0 0", color: "#cbd5e1", lineHeight: 1.6 }}>
            Senin - Sabtu: 08:00 - 22:00<br />
            Minggu: 12:00 - 23:00
          </p>
        </div>

        <div style={{ minWidth: 220 }}>
          <h4 style={{ margin: 0, color: "#f1f5f9" }}>Quick Links</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", color: "#cbd5e1" }}>
            <li><a href="/" style={{ color: "#cbd5e1", textDecoration: "none" }}>Home</a></li>
            <li><a href="/venue" style={{ color: "#cbd5e1", textDecoration: "none" }}>Booking</a></li>
            <li><a href="/event" style={{ color: "#cbd5e1", textDecoration: "none" }}>Event</a></li>
            <li><a href="/about-us" style={{ color: "#cbd5e1", textDecoration: "none" }}>About Us</a></li>
          </ul>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(226, 232, 240, 0.06)",
          marginTop: 18,
          paddingTop: 16,
          maxWidth: 1100,
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <small style={{ color: "#94a3b8" }}>
          © {new Date().getFullYear()} Champion Futsal. All rights reserved.
        </small>

        
      </div>
    </footer>
  );
}