"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

type Supplier = { id: string; name: string };
type Material = {
  id: string;
  name: string;
  unit: string;
  unitCost: number;
  active: boolean;
  supplierId: string | null;
  supplier: Supplier | null;
  _count: { recipeItems: number };
};

const UNITS = ["metro", "unidad", "cm", "kg", "par", "rollo"];

export function MaterialsManager({
  materials,
  suppliers,
}: {
  materials: Material[];
  suppliers: Supplier[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState({ name: "", unit: "metro", unitCost: "", supplierId: "" });
  const [supplierDraft, setSupplierDraft] = useState("");
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function request(url: string, method: string, body?: unknown) {
    setError(null);
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Algo salió mal");
      return false;
    }
    router.refresh();
    return true;
  }

  async function addMaterial(e: React.FormEvent) {
    e.preventDefault();
    setBusy("new");
    const ok = await request("/api/admin/materials", "POST", {
      ...draft,
      supplierId: draft.supplierId || null,
    });
    if (ok) setDraft({ name: "", unit: draft.unit, unitCost: "", supplierId: draft.supplierId });
    setBusy(null);
  }

  async function addSupplier() {
    if (!supplierDraft.trim()) return;
    setBusy("supplier");
    const ok = await request("/api/admin/suppliers", "POST", { name: supplierDraft });
    if (ok) setSupplierDraft("");
    setBusy(null);
  }

  async function savePrice(material: Material) {
    const value = editingPrice[material.id];
    if (value == null || value === "" || Number(value) === material.unitCost) {
      setEditingPrice((p) => ({ ...p, [material.id]: "" }));
      return;
    }
    setBusy(material.id);
    const ok = await request(`/api/admin/materials/${material.id}`, "PATCH", { unitCost: Number(value) });
    if (ok) setEditingPrice((p) => ({ ...p, [material.id]: "" }));
    setBusy(null);
  }

  async function removeMaterial(material: Material) {
    if (!confirm(`¿Borrar "${material.name}"?`)) return;
    setBusy(material.id);
    await request(`/api/admin/materials/${material.id}`, "DELETE");
    setBusy(null);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-brand-line bg-white p-5">
        <h2 className="font-serif text-lg text-brand-ink">Materiales e insumos</h2>
        <p className="mb-4 text-xs text-brand-ink-soft">
          Telas, cueros, cierres, rellenos, hilos... con el último precio que pagaste. Cuando un
          proveedor aumenta, actualizá el precio acá y todos los productos que lo usan recalculan su
          costo solos.
        </p>

        <form onSubmit={addMaterial} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1.5fr_auto]">
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            required
            placeholder="Nombre (ej: Tela tapicería floral)"
            className="input-field"
          />
          <select
            value={draft.unit}
            onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
            className="input-field"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                por {u}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            value={draft.unitCost}
            onChange={(e) => setDraft((d) => ({ ...d, unitCost: e.target.value }))}
            required
            placeholder="Precio $"
            className="input-field"
          />
          <select
            value={draft.supplierId}
            onChange={(e) => setDraft((d) => ({ ...d, supplierId: e.target.value }))}
            className="input-field"
          >
            <option value="">Proveedor (opcional)</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={busy === "new"} className="btn-primary">
            Agregar
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-brand-ink-soft">Nuevo proveedor:</span>
          <input
            value={supplierDraft}
            onChange={(e) => setSupplierDraft(e.target.value)}
            placeholder="Nombre del proveedor"
            className="input-field max-w-56"
          />
          <button
            type="button"
            onClick={addSupplier}
            disabled={busy === "supplier" || !supplierDraft.trim()}
            className="rounded-full border border-brand-line bg-white px-4 py-1.5 font-medium hover:border-brand-terracotta disabled:opacity-50"
          >
            Agregar
          </button>
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>

      {materials.length === 0 ? (
        <p className="rounded-2xl border border-brand-line bg-white p-8 text-center text-sm text-brand-ink-soft">
          Todavía no hay materiales cargados. Empezá por las telas y los cierres que más usás.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream text-left text-xs uppercase tracking-wide text-brand-ink/60">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Precio actual</th>
                <th className="px-4 py-3">Usado en</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {materials.map((m) => (
                <tr key={m.id} className={m.active ? "" : "opacity-50"}>
                  <td className="px-4 py-3 font-medium text-brand-ink">
                    {m.name}
                    <span className="block text-xs font-normal text-brand-ink-soft">por {m.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-brand-ink-soft">{m.supplier?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={editingPrice[m.id] ?? ""}
                        placeholder={String(m.unitCost)}
                        onChange={(e) => setEditingPrice((p) => ({ ...p, [m.id]: e.target.value }))}
                        onBlur={() => savePrice(m)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), savePrice(m))}
                        className="input-field w-28"
                      />
                      <span className="text-xs text-brand-ink-soft">{formatPrice(m.unitCost)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-ink-soft">
                    {m._count.recipeItems} producto{m._count.recipeItems === 1 ? "" : "s"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeMaterial(m)}
                      disabled={busy === m.id}
                      className="text-xs text-red-600 underline disabled:opacity-40"
                    >
                      Borrar
                    </button>
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
