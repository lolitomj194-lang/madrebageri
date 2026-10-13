"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Toggle, Notice, ImageField, apiFetch } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";

type ProductOption = { id: string; name: string; unitLabel: string; unitPrice: number };

export type ComboFormValues = {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  pricing: "FIXED" | "PER_PERSON";
  price: string;
  compareAtPrice: string;
  persons: string;
  maxPersons: string;
  badge: string;
  featured: boolean;
  active: boolean;
  order: string;
  items: { productId: string; quantity: string; note: string }[];
};

export const emptyCombo: ComboFormValues = {
  name: "", description: "", imageUrl: "", pricing: "FIXED", price: "", compareAtPrice: "", persons: "4", maxPersons: "", badge: "",
  featured: false, active: true, order: "0", items: [],
};

export function ComboForm({ initial, products }: { initial: ComboFormValues; products: ProductOption[] }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof ComboFormValues>(k: K, val: ComboFormValues[K]) => setV((s) => ({ ...s, [k]: val }));

  const perPerson = v.pricing === "PER_PERSON";
  const mult = perPerson ? Number(v.persons) || 1 : 1;
  const referenceCost = v.items.reduce((s, it) => {
    const p = products.find((x) => x.id === it.productId);
    return s + (p ? p.unitPrice * (Number(it.quantity) || 0) * mult : 0);
  }, 0);
  const comboTotal = perPerson ? (Number(v.price) || 0) * mult : Number(v.price) || 0;

  function updateItem(i: number, patch: Partial<ComboFormValues["items"][number]>) {
    set("items", v.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (v.id) await apiFetch(`/api/admin/combos/${v.id}`, { method: "PUT", body: JSON.stringify(v) });
      else await apiFetch("/api/admin/combos", { method: "POST", body: JSON.stringify(v) });
      router.push("/admin/combos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!v.id || !confirm("¿Eliminar este combo?")) return;
    try {
      const data = await apiFetch<{ message?: string }>(`/api/admin/combos/${v.id}`, { method: "DELETE" });
      if (data.message) alert(data.message);
      router.push("/admin/combos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-xl uppercase">Datos del combo</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" className="sm:col-span-2"><input className="input-field" value={v.name} onChange={(e) => set("name", e.target.value)} required /></Field>
            <Field label="Descripción" className="sm:col-span-2"><textarea className="input-field min-h-[80px]" value={v.description} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Tipo de precio">
              <select className="input-field" value={v.pricing} onChange={(e) => set("pricing", e.target.value as "FIXED" | "PER_PERSON")}>
                <option value="FIXED">Precio fijo (combo cerrado)</option>
                <option value="PER_PERSON">Por persona (escalable)</option>
              </select>
            </Field>
            <Field label={perPerson ? "Precio por persona ($)" : "Precio del combo ($)"}><input className="input-field" type="number" value={v.price} onChange={(e) => set("price", e.target.value)} required /></Field>
            <Field label={perPerson ? "Mínimo de personas" : "Comensales estimados"}><input className="input-field" type="number" min={1} value={v.persons} onChange={(e) => set("persons", e.target.value)} /></Field>
            {perPerson ? (
              <Field label="Máximo de personas" hint="Vacío = sin límite."><input className="input-field" type="number" value={v.maxPersons} onChange={(e) => set("maxPersons", e.target.value)} /></Field>
            ) : (
              <Field label="Precio anterior (tachado)" hint="Opcional, para mostrar una promoción."><input className="input-field" type="number" value={v.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} /></Field>
            )}
            <Field label="Etiqueta / promoción" hint='Ej: "Más pedido", "Promo finde".'><input className="input-field" value={v.badge} onChange={(e) => set("badge", e.target.value)} /></Field>
            <Field label="Orden"><input className="input-field" type="number" value={v.order} onChange={(e) => set("order", e.target.value)} /></Field>
            <div className="sm:col-span-2"><ImageField value={v.imageUrl} onChange={(u) => set("imageUrl", u)} /></div>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-xl uppercase">Productos incluidos</h2>
          <p className="mt-1 text-xs text-brand-ash">{perPerson ? "Cantidades POR PERSONA (ej: 0,5 porciones de vacío, 1 chorizo)." : "Cantidades totales del combo."}</p>
          <div className="mt-4 space-y-2">
            {v.items.map((it, i) => {
              const p = products.find((x) => x.id === it.productId);
              return (
                <div key={i} className="grid gap-2 rounded-xl border border-brand-line p-3 sm:grid-cols-[1fr_110px_1fr_auto]">
                  <select className="input-field" value={it.productId} onChange={(e) => updateItem(i, { productId: e.target.value })}>
                    <option value="">Producto…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.unitPrice)}/{p.unitLabel})</option>)}
                  </select>
                  <input className="input-field" type="number" step="0.25" min="0" placeholder={p ? p.unitLabel : "cant."} value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} />
                  <input className="input-field" placeholder="Nota (opcional)" value={it.note} onChange={(e) => updateItem(i, { note: e.target.value })} />
                  <button type="button" className="text-xs text-brand-ember underline" onClick={() => set("items", v.items.filter((_, idx) => idx !== i))}>Quitar</button>
                </div>
              );
            })}
          </div>
          <button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => set("items", [...v.items, { productId: "", quantity: "1", note: "" }])}>+ Agregar producto</button>
          <p className="mt-4 text-sm text-brand-ash">
            Valor de referencia de los productos sueltos{perPerson ? ` para ${mult} personas` : ""}: <strong>{formatPrice(referenceCost)}</strong> · Precio del combo: <strong>{formatPrice(comboTotal)}</strong>
            {referenceCost > 0 && comboTotal > 0 && <span> ({comboTotal < referenceCost ? `ahorro ${formatPrice(referenceCost - comboTotal)}` : "sin ahorro respecto a comprar suelto"})</span>}
          </p>
        </section>
      </div>

      <aside className="h-fit space-y-3 lg:sticky lg:top-6">
        <Toggle label="Disponible" checked={v.active} onChange={(b) => set("active", b)} />
        <Toggle label="Destacado en inicio" checked={v.featured} onChange={(b) => set("featured", b)} />
        {error && <Notice tone="error">{error}</Notice>}
        <button type="submit" disabled={saving} className="btn btn-primary w-full">{saving ? "Guardando…" : "Guardar combo"}</button>
        {v.id && <button type="button" onClick={remove} className="btn btn-outline w-full">Eliminar</button>}
      </aside>
    </form>
  );
}
