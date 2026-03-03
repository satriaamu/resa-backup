import Link from "next/link";
import { useRouter } from "next/router";

export default function SidebarAdmin() {
  const router = useRouter();

  const linkStyle = (path: string) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: router.pathname === path ? "bold" : "normal",
    color: router.pathname === path ? "#ffffff" : "#e0e0e0",
    background: router.pathname === path ? "#1976d2" : "transparent",
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    transition: "all 0.3s",
  });

  const hoverStyle = {
    background: "#2196f3",
    color: "#fff",
  };

  return (
    <div
      style={{
        width: 220,
        minHeight: "100vh",
        background: "#334155",
        padding: 20,
        boxSizing: "border-box",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 10px rgba(0,0,0,0.2)",
      }}
    >
      <h2 style={{ marginBottom: 24, textAlign: "center", fontWeight: "bold" }}>
        🧭 Admin Champion
        
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={{ marginBottom: 12 }}>
          <Link href="/admin" style={linkStyle("/admin")} onMouseOver={(e) => Object.assign((e.target as HTMLElement).style, hoverStyle)}>
            📋 Daftar Reservasi
          </Link>
        </li>
        <li style={{ marginBottom: 12 }}>
          <Link href="/admin-slot" style={linkStyle("/admin-slot")} onMouseOver={(e) => Object.assign((e.target as HTMLElement).style, hoverStyle)}>
            🕒 Tambah Slot
          </Link>
        </li>
      </ul>
    </div>
  );
}
