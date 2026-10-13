"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Toggle, Notice, ImageField, apiFetch } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";
import { roundPrice } from "@/lib/pricing";

type Category = { id: string; name: string; role: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  role: string;
  tier: string;
  saleUnit: string;
  priceMode: string;
  pricePerKg: string;
  fixedPrice: string;
  portionMinGrams: string;
  portionMaxGrams: string;
  portionRefGrams: string;
  unitGrams: string;
  unitLabel: string;
  suggestedPerPerson: string;
  minQuantity: string;
  featured: boolean;
  active: boolean;
  recommendable: boolean;
  order: string;
};

export const emptyProduct: ProductFormValues = {
  name: "", description: "", imageUrl: "", categoryId: "", role: "CARNE", tier: "CLASICO", saleUnit: "PORTION", priceMode: "PER_KG",
  pricePerKg: "", fixedPrice: "", portionMinGrams: "450", portionMaxGrams: "600", portionRefGrams: "500", unitGrams: "", unitLabel: "porción",
  suggestedPerPerson: "", minQuantity: "1", featured: false, active: true, recommendable: true, order: "0",
};

const ROLE_LABELS: Record<string, string> = { CARNE: "Carne (corte)", ACHURA: "Achura", EMBUTIDO: "Embutido", EXTRA: "Extra (provoleta, pan)", ACCESORIO: "Accesorio / condimento", FUEGO: "Para el fuego" };
const TIER_LABELS: Record<string, string> = { ECONOMICO: "Económico", CLASICO: "Clásico", PREMIUM: "Premium" };

export function ProductForm({ initial, categories }: { initial: ProductFormValues; categories: Category[] }) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) => setV((s) => ({ ...s, [k]: val }));

  const isPortion = v.saleUnit === "PORTION";
  const perKg = v.priceMode === "PER_KG";
  const grams = isPortion ? Number(v.portionRefGrams) : Number(v.unitGrams);
  const preview = perKg ? (Number(v.pricePerKg) && grams ? roundPrice((Number(v.pricePerKg) * grams) / 1000) : 0) : Number(v.fixedPrice) || 0;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (v.id) await apiFetch(`/api/admin/products/${v.id}`, { method: "PUT", body: JSON.stringify(v) });
      else await apiFetch("/api/admin/products", { method: "POST", body: JSON.stringify(v) });
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!v.id || !confirm("¿Eliminar este producto? Si tiene pedidos o combos asociados se desactivará en lugar de borrarse.")) return;
    try {
      const data = await apiFetch<{ message?: string }>(`/api/admin/products/${v.id}`, { method: "DELETE" });
      if (data.message) alert(data.message);
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-xl uppercase">Datos básicos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" className="sm:col-span-2"><input className="input-field" value={v.name} onChange={(e) => set("name", e.target.value)} required /></Field>
            <Field label="Descripción" className="sm:col-span-2"><textarea className="input-field min-h-[80px]" value={v.description} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Categoría">
              <select className="input-field" value={v.categoryId} onChange={(e) => { set("categoryId", e.target.value); const c = categories.find((x) => x.id === e.target.value); if (c) set("role", c.role); }} required>
                <option value="">Elegí…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Rol en el asado" hint="Define cómo lo usan la calculadora y el presupuesto.">
              <select className="input-field" value={v.role} onChange={(e) => set("role", e.target.value)}>
                {Object.entries(ROLE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
            <Field label="Nivel">
              <select className="input-field" value={v.tier} onChange={(e) => set("tier", e.target.value)}>
                {Object.entries(TIER_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
            <Field label="Orden de aparición"><input className="input-field" type="number" value={v.order} onChange={(e) => set("order", e.target.value)} /></Field>
            <div className="sm:col-span-2"><ImageField value={v.imageUrl} onChange={(u) => set("imageUrl", u)} /></div>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-xl uppercase">Unidad de venta y porciones</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Se vende por">
              <select className="input-field" value={v.saleUnit} onChange={(e) => { const su = e.target.value; set("saleUnit", su); set("unitLabel", su === "PORTION" ? "porción" : su === "UNIT" ? "unidad" : "bolsa"); if (su !== "PORTION" && v.priceMode === "PER_KG" && !v.unitGrams) set("priceMode", "FIXED"); }}>
                <option value="PORTION">Porción (peso estimado)</option>
                <option value="UNIT">Unidad (chorizo, provoleta)</option>
                <option value="PACKAGE">Paquete / bolsa</option>
              </select>
            </Field>
            <Field label="Etiqueta de la unidad" hint='Ej: "porción", "unidad", "bolsa 4 kg".'><input className="input-field" value={v.unitLabel} onChange={(e) => set("unitLabel", e.target.value)} /></Field>
            {isPortion ? (
              <>
                <Field label="Peso mínimo por porción (g)"><input className="input-field" type="number" value={v.portionMinGrams} onChange={(e) => set("portionMinGrams", e.target.value)} /></Field>
                <Field label="Peso máximo por porción (g)"><input className="input-field" type="number" value={v.portionMaxGrams} onChange={(e) => set("portionMaxGrams", e.target.value)} /></Field>
                <Field label="Peso de referencia para el precio (g)" hint="Se usa para calcular el precio estimado de una porción."><input className="input-field" type="number" value={v.portionRefGrams} onChange={(e) => set("portionRefGrams", e.target.value)} /></Field>
              </>
            ) : (
              <Field label="Peso aproximado por unidad (g)" hint="Opcional. Lo usa la calculadora para estimar carne total."><input className="input-field" type="number" value={v.unitGrams} onChange={(e) => set("unitGrams", e.target.value)} /></Field>
            )}
            <Field label="Cantidad mínima"><input className="input-field" type="number" min={1} value={v.minQuantity} onChange={(e) => set("minQuantity", e.target.value)} /></Field>
            <Field label="Sugerido por persona (calculadora)" hint="Ej: chorizo 1, morcilla 0,5, provoleta 0,25. Vacío si no aplica."><input className="input-field" type="number" step="0.05" value={v.suggestedPerPerson} onChange={(e) => set("suggestedPerPerson", e.target.value)} /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-xl uppercase">Precio</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Modo de precio">
              <select className="input-field" value={v.priceMode} onChange={(e) => set("priceMode", e.target.value)}>
                <option value="PER_KG">Por kilo (precio estimado por porción)</option>
                <option value="FIXED">Precio fijo por {v.unitLabel || "unidad"}</option>
              </select>
            </Field>
            {perKg ? (
              <Field label="Precio por kilo ($)"><input className="input-field" type="number" value={v.pricePerKg} onChange={(e) => set("pricePerKg", e.target.value)} /></Field>
            ) : (
              <Field label={`Precio por ${v.unitLabel || "unidad"} ($)`}><input className="input-field" type="number" value={v.fixedPrice} onChange={(e) => set("fixedPrice", e.target.value)} /></Field>
            )}
          </div>
          <p className="mt-3 text-sm">
            Precio que verá el cliente: <strong>{formatPrice(preview)}</strong> / {v.unitLabel || "unidad"}
            {perKg && <span className="text-brand-ash"> (estimado, se confirma al pesar)</span>}
          </p>
        </section>
      </div>

      <aside className="h-fit space-y-3 lg:sticky lg:top-6">
        <Toggle label="Disponible" hint="Si está desactivado no se muestra en la web." checked={v.active} onChange={(b) => set("active", b)} />
        <Toggle label="Destacado" hint="Aparece en el inicio como recomendado." checked={v.featured} onChange={(b) => set("featured", b)} />
        <Toggle label="Recomendable" hint="La calculadora y el presupuesto pueden sugerirlo." checked={v.recommendable} onChange={(b) => set("recommendable", b)} />
        {error && <Notice tone="error">{error}</Notice>}
        <button type="submit" disabled={saving} className="btn btn-primary w-full">{saving ? "Guardando…" : "Guardar producto"}</button>
        {v.id && <button type="button" onClick={remove} className="btn btn-outline w-full">Eliminar</button>}
      </aside>
    </form>
  );
}
