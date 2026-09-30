"use client";

import { useRef, useState } from "react";

// Boton de subida de foto pensado para usarse desde el celular: abre la
// camara/galeria, sube a /api/admin/uploads y devuelve la URL.
export function ImageUploadButton({
  onUploaded,
  label = "Subir foto",
  className = "",
}: {
  onUploaded: (url: string) => void;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la foto");
        return;
      }
      onUploaded(data.url);
    } catch {
      setError("Error de conexión al subir la foto");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="rounded-full border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-ink hover:border-brand-terracotta disabled:opacity-50"
      >
        {uploading ? "Subiendo..." : `📷 ${label}`}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
