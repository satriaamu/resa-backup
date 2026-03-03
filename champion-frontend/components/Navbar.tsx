import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/authContext";

const navLinkStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "1rem",
  transition: "color 0.2s",
};

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
          maxWidth: 1200,
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
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link href="/" style={navLinkStyle}>
            Home
          </Link>
          <Link href="/reservasi" style={navLinkStyle}>
            Reservasi
          </Link>
          <Link href="/informasi-lapangan" style={navLinkStyle}>
            Informasi Lapangan
          </Link>

          {isLoggedIn && user ? (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: "1.5rem" }}>
              <span style={{ color: "#fff", fontSize: "0.95rem" }}>
                Halo, <strong>{user.nama}</strong>
              </span>
              <button
                onClick={logout}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#dc2626";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#ef4444";
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                ...navLinkStyle,
                background: "#fff",
                color: "#0ea5e9",
                padding: "0.5rem 1rem",
                borderRadius: 6,
              }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}