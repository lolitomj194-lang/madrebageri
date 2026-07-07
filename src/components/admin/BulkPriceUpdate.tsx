"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Scope = "all" | "collection" | "no-price";

const COLLECTIONS = ["Ferrari", "Signature", "Classic"];

export function BulkPriceUpdate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<Scope>("no-price");
  const [collection, setCollection] = useState("Ferrari");
  const [basePrice, setBasePrice] = useState("");
  const [cashPrice, setCashPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scopeLabel =
    scope === "all" ? "TODOS los productos" : scope === "collection" ? `la coleccion ${collection}` : "los productos que dicen 'Consultar precio'";

  async function handleApply() {
    setError(null);
    setMessage(null);

    if (!basePrice.trim()) {
      setError("Ingresa el precio tarjeta/Mercado Pago");
      return;
    }
    if (!confirm(`Esto va a actualizar el precio de ${scopeLabel}. ¿Confirmas?`)) return;

    setLoading(true);
    const res = await fetch("/api/admin/products/bulk-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope,
        collection: scope === "collection" ? collection : undefined,
        basePrice: Number(basePrice),
        cashPrice: cashPrice.trim() === "" ? null : Number(cashPrice),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo actualizar");
      return;
    }
    setMessage(`Se actualizaron ${data.updated} productos.`);
    router.refresh();
  }

  return (
    <div className="mb-6 rounded-2xl border border-brand-line bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-sm uppercase tracking-[0.2em] text-brand-ink/70">
          Actualizar precios en conjunto
        </span>
        <span className="text-brand-ink/50">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-brand-line px-6 py-5">
          <div>
            <label className="text-xs uppercase tracking-wide text-brand-ink/50">Aplicar a</label>
            <select value={scope} onChange={(e) => setScope(e.target.value as Scope)} className="input-field mt-1 w-full sm:w-80">
              <option value="no-price">Solo productos sin precio ("Consultar precio")</option>
              <option value="collection">Una coleccion especifica</option>
              <option value="all">Todos los productos</option>
            </select>
          </div>

          {scope === "collection" && (
            <div>
              <label className="text-xs uppercase tracking-wide text-brand-ink/50">Coleccion</label>
              <select value={collection} onChange={(e) => setCollection(e.target.value)} className="input-field mt-1 w-full sm:w-80">
                {COLLECTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-lg">
            <div>
              <input
                type="number"
                min={0}
                placeholder="Precio tarjeta/Mercado Pago"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <input
                type="number"
                min={0}
                placeholder="Precio efectivo/transf. (opcional)"
                value={cashPrice}
                onChange={(e) => setCashPrice(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          {error && <p className="text-sm text-brand-ferrari">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <button
            onClick={handleApply}
            disabled={loading}
            className="rounded-full bg-brand-ink px-8 py-2.5 text-sm uppercase tracking-wide text-brand-cream hover:bg-brand-gold hover:text-brand-ink transition-colors disabled:opacity-50"
          >
            {loading ? "Aplicando..." : "Aplicar precio"}
          </button>
        </div>
      )}
    </div>
  );
}
