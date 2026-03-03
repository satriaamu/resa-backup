// pages/admin-event.tsx
import { useState, useEffect, ChangeEvent } from "react";
import SidebarAdmin from "./SidebarAdmin";

export default function AdminEvent() {
  const [images, setImages] = useState<string[]>([]);

  // 🔹 Ambil data event
  useEffect(() => {
    const savedImages = localStorage.getItem("eventImages");
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  // 🔹 Simpan ke localStorage
  const saveImages = (data: string[]) => {
    setImages(data);
    localStorage.setItem("eventImages", JSON.stringify(data));
  };

  // 🔹 Upload file → Base64
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      saveImages([...images, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Hapus gambar
  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    saveImages(updated);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarAdmin />

      <div style={{ flex: 1, padding: 30, background: "#f1f5f9" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
          🎉 Kelola Event & Promosi
        </h1>

        <p style={{ color: "#64748b", marginBottom: 20 }}>
          Admin dapat mengunggah dan menghapus gambar event.
        </p>

        {/* Upload */}
        <label
          style={{
            display: "inline-block",
            padding: "12px 20px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: 30,
          }}
        >
          + Upload Gambar Event
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
          />
        </label>

        {/* Daftar Gambar */}
        {images.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            Belum ada gambar event yang diunggah.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {images.map((img, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={img}
                  alt={`event-${i}`}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                  }}
                />

                <button
                  onClick={() => removeImage(i)}
                  style={{
                    width: "100%",
                    border: "none",
                    padding: 10,
                    background: "#ef4444",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
