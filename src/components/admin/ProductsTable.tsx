"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { apiFetch } from "@/components/admin/ui";

export type ProductRow = {
  id: string;
  name: string;
  categoryName: string;
  unitLabel: string;
  unitPrice: number;
  pricePerKg: number | null;
  priceMode: string;
  saleUnit: string;
  portionMinGrams: number | null;
  portionMaxGrams: number | null;
  active: boolean;
  featured: boolean;
  tier: string;
};

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.categoryName.toLowerCase().includes(q.toLowerCase()));

  async function toggle(p: ProductRow, field: "active" | "featured") {
    setBusy(p.id);
    try {
      await apiFetch(`/api/admin/products/${p.id}`, { method: "PATCH", body: JSON.stringify({ [field]: !p[field] }) });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-line bg-white">
      <div className="border-b border-brand-line p-4">
        <input className="input-field max-w-sm" placeholder="Buscar producto o categoría…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-cream text-left text-xs uppercase tracking-wider text-brand-ash">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Porción</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Disponible</th>
              <th className="px-4 py-3">Destacado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {filtered.map((p) => (
              <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                <td className="px-4 py-3 font-medium">
                  {p.name} {p.tier === "PREMIUM" && <span className="badge bg-brand-carbon text-brand-cream">Premium</span>}
                </td>
                <td className="px-4 py-3 text-brand-ash">{p.categoryName}</td>
                <td className="px-4 py-3 text-brand-ash">
                  {p.saleUnit === "PORTION" && p.portionMinGrams ? `${p.portionMinGrams}–${p.portionMaxGrams} g` : p.unitLabel}
                </td>
                <td className="px-4 py-3">
                  {formatPrice(p.unitPrice)} <span className="text-xs text-brand-ash">/ {p.unitLabel}</span>
                  {p.priceMode === "PER_KG" && p.pricePerKg && <span className="block text-xs text-brand-ash">{formatPrice(p.pricePerKg)}/kg</span>}
                </td>
                <td className="px-4 py-3">
                  <button type="button" disabled={busy === p.id} onClick={() => toggle(p, "active")} className={`badge ${p.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                    {p.active ? "Sí" : "No"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button type="button" disabled={busy === p.id} onClick={() => toggle(p, "featured")} className={`badge ${p.featured ? "bg-brand-ember text-brand-cream" : "bg-slate-100 text-slate-600"}`}>
                    {p.featured ? "Sí" : "No"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/productos/${p.id}`} className="text-xs font-semibold uppercase tracking-wider text-brand-ember hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-brand-ash">Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
