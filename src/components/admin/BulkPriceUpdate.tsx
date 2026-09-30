"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Aumento masivo de precios por porcentaje (util con la inflacion: un solo
// numero y se actualiza todo el catalogo, redondeado a los $100).
export function BulkPriceUpdate() {
  const router = useRouter();
  const [percent, setPercent] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleApply() {
    const value = Number(percent);
    if (!Number.isFinite(value) || value === 0) {
      setMessage("Ingresá un porcentaje (ej: 15)");
      return;
    }
    if (
      !confirm(
        `Se van a ${value > 0 ? "aumentar" : "bajar"} TODOS los precios un ${Math.abs(value)}%. ¿Continuar?`
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/products/bulk-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percent: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "No se pudo actualizar");
        return;
      }
      setMessage(`Listo: se actualizaron ${data.updated} productos.`);
      setPercent("");
      router.refresh();
    } catch {
      setMessage("Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-brand-line bg-white px-4 py-3 text-sm">
      <span className="font-medium text-brand-ink">Ajustar todos los precios:</span>
      <input
        type="number"
        value={percent}
        onChange={(e) => setPercent(e.target.value)}
        placeholder="15"
        className="input-field w-24"
      />
      <span className="text-brand-ink-soft">%</span>
      <button
        onClick={handleApply}
        disabled={busy}
        className="rounded-full border border-brand-line px-4 py-1.5 font-medium hover:border-brand-terracotta disabled:opacity-50"
      >
        {busy ? "Aplicando..." : "Aplicar"}
      </button>
      {message && <span className="text-xs text-brand-ink-soft">{message}</span>}
    </div>
  );
}
