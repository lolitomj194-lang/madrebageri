"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CategoryQuickAdd() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear");
        return;
      }
      setName("");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nueva categoría..."
        className="input-field max-w-48"
      />
      <button
        onClick={handleAdd}
        disabled={busy || !name.trim()}
        className="rounded-full border border-brand-line bg-white px-4 py-1.5 font-medium hover:border-brand-terracotta disabled:opacity-50"
      >
        {busy ? "..." : "Agregar"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
