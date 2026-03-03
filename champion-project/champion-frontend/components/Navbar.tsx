import Link from "next/link";
import React from "react";

const navLinkStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "1rem",
  transition: "color 0.2s",
};

export default function Navbar() {
  return (
    <nav
      style={{
        background: "#0ea5e9",
        padding: "0.8rem 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
        }}
      >
        <span style={{ color: "#fff", fontWeight: "bold", fontSize: "1.2rem", letterSpacing: 1 }}>
          Champion Futsal
        </span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/" style={navLinkStyle}>
            Home
          </Link>
          <Link href="/reservasi" style={navLinkStyle}>
            Reservasi
          </Link>
          <Link href="/informasi-lapangan" style={navLinkStyle}>
            Informasi Lapangan
          </Link>
        </div>
      </div>
    </nav>
  );
}