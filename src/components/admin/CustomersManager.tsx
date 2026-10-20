"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  isWholesale: boolean;
  notes: string | null;
  ordersCount: number;
  totalBought: number;
  owed: number;
  lastOrderAt: string | Date | null;
};

export function CustomersManager({ customers }: { customers: CustomerRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState({ name: "", phone: "", city: "", isWholesale: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear");
        return;
      }
      setDraft({ name: "", phone: "", city: "", isWholesale: true });
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={addCustomer} className="rounded-2xl border border-brand-line bg-white p-5">
        <h2 className="mb-3 font-serif text-lg text-brand-ink">Nuevo cliente</h2>
        <div className="grid gap-2 sm:grid-cols-[2fr_1.5fr_1.5fr_auto_auto]">
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            required
            placeholder="Nombre o local *"
            className="input-field"
          />
          <input
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            placeholder="WhatsApp"
            className="input-field"
          />
          <input
            value={draft.city}
            onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
            placeholder="Ciudad"
            className="input-field"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.isWholesale}
              onChange={(e) => setDraft((d) => ({ ...d, isWholesale: e.target.checked }))}
            />
            Mayorista
          </label>
          <button type="submit" disabled={saving} className="btn-primary">
            Agregar
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      {customers.length === 0 ? (
        <p className="rounded-2xl border border-brand-line bg-white p-8 text-center text-sm text-brand-ink-soft">
          Todavía no hay clientes. Cargá los locales a los que les vendés para llevar su historial.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream text-left text-xs uppercase tracking-wide text-brand-ink/60">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3 text-right">Compras</th>
                <th className="px-4 py-3 text-right">Total comprado</th>
                <th className="px-4 py-3 text-right">Debe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-brand-ink">{c.name}</span>
                    {c.isWholesale && (
                      <span className="ml-2 rounded-full bg-brand-sage/15 px-2 py-0.5 text-xs text-brand-sage-dark">
                        mayorista
                      </span>
                    )}
                    {c.city && <span className="block text-xs text-brand-ink-soft">{c.city}</span>}
                  </td>
                  <td className="px-4 py-3 text-brand-ink-soft">
                    {c.phone ? (
                      <a
                        href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-terracotta underline"
                      >
                        {c.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-brand-ink-soft">
                    {c.ordersCount}
                    {c.lastOrderAt && (
                      <span className="block text-xs">
                        últ. {new Date(c.lastOrderAt).toLocaleDateString("es-AR")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(c.totalBought)}</td>
                  <td className="px-4 py-3 text-right">
                    {c.owed > 0 ? (
                      <Link
                        href="/admin/ventas?cobro=pendiente"
                        className="font-semibold text-amber-700 underline"
                      >
                        {formatPrice(c.owed)}
                      </Link>
                    ) : (
                      <span className="text-brand-ink-soft">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
