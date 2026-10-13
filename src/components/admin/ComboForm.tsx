"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Toggle, Notice, ImageField, apiFetch } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";
import { formatGrams } from "@/lib/pricing";

type ProductOption = { id: string; name: string; unitLabel: string; unitPrice: number; pricePerKg: number | null; saleUnit: string };

export type ComboFormValues = {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  pricing: "FIXED" | "PER_PERSON" | "SCALABLE";
  price: string;
  extraPersonPrice: string;
  compareAtPrice: string;
  persons: string;
  maxPersons: string;
  badge: string;
  featured: boolean;
  active: boolean;
  order: string;
  items: { productId: string; quantity: string; inGrams: boolean; perExtraPerson: string; note: string }[];
};

export const emptyCombo: ComboFormValues = {
  name: "", description: "", imageUrl: "", pricing: "SCALABLE", price: "", extraPersonPrice: "", compareAtPrice: "", persons: "4", maxPersons: "",
  badge: "", featured: false, active: true, order: "0", items: [],
};

/** Valor de referencia de un item comprado suelto, segun su unidad (gramos o unidades). */
function itemReference(p: ProductOption | undefined, qty: number, inGrams: boolean) {
  if (!p) return 0;
  if (inGrams) return p.pricePerKg ? (p.pricePerKg * qty) / 1000 : 0;
  return p.unitPrice * qty;
}

export function ComboForm({ initial, products }: { initial: ComboFormValues; products: ProductOption[] }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof ComboFormValues>(k: K, val: ComboFormValues[K]) => setV((s) => ({ ...s, [k]: val }));

  const perPerson = v.pricing === "PER_PERSON";
  const scalable = v.pricing === "SCALABLE";
  const basePersons = Number(v.persons) || 1;
  const baseReference = v.items.reduce((s, it) => s + itemReference(products.find((x) => x.id === it.productId), (Number(it.quantity) || 0) * (perPerson ? basePersons : 1), it.inGrams), 0);
  const extraReference = v.items.reduce((s, it) => s + itemReference(products.find((x) => x.id === it.productId), Number(it.perExtraPerson) || 0, it.inGrams), 0);
  const basePrice = perPerson ? (Number(v.price) || 0) * basePersons : Number(v.price) || 0;

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
            <Field label="Tipo de combo" className="sm:col-span-2">
              <select className="input-field" value={v.pricing} onChange={(e) => set("pricing", e.target.value as ComboFormValues["pricing"])}>
                <option value="SCALABLE">Base para N personas + agregado por persona extra</option>
                <option value="FIXED">Precio fijo (combo cerrado)</option>
                <option value="PER_PERSON">Lineal por persona</option>
              </select>
            </Field>
            <Field label={perPerson ? "Precio por persona ($)" : scalable ? "Precio base ($)" : "Precio del combo ($)"}><input className="input-field" type="number" value={v.price} onChange={(e) => set("price", e.target.value)} required /></Field>
            <Field label={perPerson ? "Mínimo de personas" : scalable ? "Personas de la base" : "Comensales estimados"}><input className="input-field" type="number" min={1} value={v.persons} onChange={(e) => set("persons", e.target.value)} /></Field>
            {scalable && (
              <Field label="Recargo por persona adicional ($)" hint="Lo que suma cada persona por encima de la base. 0 = sin recargo (el combo no permite agregar personas si es 0)."><input className="input-field" type="number" value={v.extraPersonPrice} onChange={(e) => set("extraPersonPrice", e.target.value)} /></Field>
            )}
            {(perPerson || scalable) ? (
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
          <p className="mt-1 text-xs text-brand-ash">
            {perPerson ? "Cantidades POR PERSONA." : scalable ? `Cantidades de la base (${basePersons} personas) y cuánto se agrega por cada persona extra.` : "Cantidades totales del combo."}{" "}
            Con “en gramos” la cantidad se carga en gramos (1000 = 1 kg); si no, en {`porciones/unidades`} del producto.
          </p>
          <div className="mt-4 space-y-2">
            {v.items.map((it, i) => {
              const p = products.find((x) => x.id === it.productId);
              return (
                <div key={i} className="grid gap-2 rounded-xl border border-brand-line p-3 sm:grid-cols-[1fr_110px_auto_110px_1fr_auto]">
                  <select className="input-field" value={it.productId} onChange={(e) => updateItem(i, { productId: e.target.value })}>
                    <option value="">Producto…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.pricePerKg ? `${formatPrice(p.pricePerKg)}/kg` : `${formatPrice(p.unitPrice)}/${p.unitLabel}`})</option>)}
                  </select>
                  <input className="input-field" type="number" step={it.inGrams ? "50" : "0.25"} min="0" placeholder={it.inGrams ? "gramos" : p ? p.unitLabel : "cant."} value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} title="Cantidad base" />
                  <label className="flex items-center gap-1 whitespace-nowrap text-xs"><input type="checkbox" checked={it.inGrams} onChange={(e) => updateItem(i, { inGrams: e.target.checked })} className="accent-brand-ember" /> en gramos</label>
                  {scalable ? (
                    <input className="input-field" type="number" step={it.inGrams ? "50" : "0.25"} min="0" placeholder="+ por extra" value={it.perExtraPerson} onChange={(e) => updateItem(i, { perExtraPerson: e.target.value })} title="Cantidad que se suma por cada persona extra" />
                  ) : <span />}
                  <input className="input-field" placeholder="Nota (opcional)" value={it.note} onChange={(e) => updateItem(i, { note: e.target.value })} />
                  <button type="button" className="text-xs text-brand-ember underline" onClick={() => set("items", v.items.filter((_, idx) => idx !== i))}>Quitar</button>
                </div>
              );
            })}
          </div>
          <button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => set("items", [...v.items, { productId: "", quantity: "1", inGrams: false, perExtraPerson: "0", note: "" }])}>+ Agregar producto</button>
          <div className="mt-4 space-y-1 text-sm text-brand-ash">
            <p>
              Valor de referencia comprando suelto{perPerson ? ` (${basePersons} personas)` : ""}: <strong>{formatPrice(Math.round(baseReference))}</strong> · Precio del combo: <strong>{formatPrice(basePrice)}</strong>
              {baseReference > 0 && basePrice > 0 && <span> ({basePrice < baseReference ? `ahorro ${formatPrice(Math.round(baseReference - basePrice))}` : "sin ahorro respecto a comprar suelto"})</span>}
            </p>
            {scalable && v.items.some((it) => Number(it.perExtraPerson) > 0) && (
              <p>
                Lo que se agrega por persona extra vale suelto <strong>{formatPrice(Math.round(extraReference))}</strong>
                {v.items.filter((it) => Number(it.perExtraPerson) > 0).map((it) => { const p = products.find((x) => x.id === it.productId); return p ? ` · ${it.inGrams ? formatGrams(Number(it.perExtraPerson)) : it.perExtraPerson} ${p.name}` : ""; }).join("")}
                {v.extraPersonPrice ? ` · recargo cargado: ${formatPrice(Number(v.extraPersonPrice))}` : ""}
              </p>
            )}
          </div>
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
