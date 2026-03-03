import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  const items = [
    { label: "Home", href: "/" },
    { label: "Booking", href: "/venue" },
    { label: "Event", href: "/event" },
    { label: "About Us", href: "/about-us" },
  ];

  const [active, setActive] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const idx = items.findIndex((it) => it.href === router.pathname);
    setActive(idx >= 0 ? idx : null);

    // cek status login (user atau admin)
    const user = localStorage.getItem("user");
    const admin = localStorage.getItem("admin");
    const token = localStorage.getItem("token");

    if (user || admin || token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");

    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <nav
      style={{
        background: "#ffffffff",
        padding: "1rem 2rem",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
        fontFamily: "Poppins, sans-serif",
        borderRadius: "5px",
      }}
    >
      {/* LOGO */}
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

      {/* MENU */}
      <ul
        style={{
          display: "flex",
          listStyle: "none",
          gap: "1.5rem",
          margin: 0,
          padding: 0,
          alignItems: "center",
        }}
      >
        {items.map((it, i) => {
          const isActive = i === active;
          return (
            <li key={it.href}>
              <Link href={it.href} legacyBehavior>
                <a
                  onClick={() => setActive(i)}
                  style={{
                    textDecoration: "none",
                    color: isActive ? "#2563eb" : "#334155",
                    fontWeight: isActive ? 700 : 500,
                    padding: "4px 6px",
                    borderRadius: 6,
                    background: isActive
                      ? "rgba(37,99,235,0.08)"
                      : "transparent",
                  }}
                >
                  {it.label}
                </a>
              </Link>
            </li>
          );
        })}

        {/* LOGIN / LOGOUT */}
        <li>
          {!isLoggedIn ? (
            <Link href="/login" legacyBehavior>
              <a
                style={{
                  textDecoration: "none",
                  background: "#2563eb",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                Login
              </a>
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              Logout
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}
