"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

type Variant = {
  colorName: string;
  colorHex: string;
  lensColor: string;
  sku: string;
  stock: number;
  priceDelta: number;
};

type InitialData = {
  id?: string;
  name: string;
  description: string;
  collection: string;
  basePrice: number;
  cashPrice: number | null;
  categoryId: string;
  featured: boolean;
  active: boolean;
  images: { url: string }[];
  variants: Variant[];
};

const COLLECTIONS = ["Ferrari", "Signature", "Classic"];

const emptyVariant = (): Variant => ({
  colorName: "",
  colorHex: "#111111",
  lensColor: "",
  sku: "",
  stock: 0,
  priceDelta: 0,
});

export function ProductForm({ categories, initial }: { categories: Category[]; initial?: InitialData }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [collection, setCollection] = useState(initial?.collection ?? "Classic");
  const [basePrice, setBasePrice] = useState(initial?.basePrice ?? 0);
  const [cashPrice, setCashPrice] = useState(initial?.cashPrice != null ? String(initial.cashPrice) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [images, setImages] = useState<string[]>(initial?.images.map((i) => i.url) ?? [""]);
  const [variants, setVariants] = useState<Variant[]>(initial?.variants.length ? initial.variants : [emptyVariant()]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateVariant(index: number, patch: Partial<Variant>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateImage(index: number, value: string) {
    setImages((prev) => prev.map((url, i) => (i === index ? value : url)));
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanImages = images.filter((url) => url.trim());
    const cleanVariants = variants.filter((v) => v.colorName.trim());

    if (!cleanVariants.length) {
      setError("Agrega al menos una variante de color");
      return;
    }
    if (cleanVariants.some((v) => !v.sku.trim())) {
      setError("Todas las variantes necesitan un SKU");
      return;
    }

    setLoading(true);
    const payload = {
      name,
      description,
      collection,
      basePrice: Number(basePrice),
      cashPrice: cashPrice.trim() === "" ? null : Number(cashPrice),
      categoryId,
      featured,
      active,
      images: cleanImages.map((url) => ({ url })),
      variants: cleanVariants,
    };

    const res = await fetch(isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar el producto");
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-brand-line bg-white p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-[0.2em] text-brand-ink/50">Datos generales</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            required
            placeholder="Nombre del producto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field sm:col-span-2"
          />
          <textarea
            placeholder="Descripcion"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field sm:col-span-2"
            rows={3}
          />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={collection} onChange={(e) => setCollection(e.target.value)} className="input-field">
            {COLLECTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div>
            <input
              type="number"
              required
              min={0}
              placeholder="Precio tarjeta/Mercado Pago (ARS)"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="input-field w-full"
            />
            <p className="mt-1 text-xs text-brand-ink/50">Precio que se muestra por defecto en la tienda</p>
          </div>
          <div>
            <input
              type="number"
              min={0}
              placeholder="Precio efectivo/transferencia (opcional)"
              value={cashPrice}
              onChange={(e) => setCashPrice(e.target.value)}
              className="input-field w-full"
            />
            <p className="mt-1 text-xs text-brand-ink/50">Dejar vacio si es el mismo precio que tarjeta</p>
          </div>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Destacado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Activo (visible en la tienda)
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.2em] text-brand-ink/50">Imagenes (URL)</h2>
          <button type="button" onClick={() => setImages((p) => [...p, ""])} className="text-sm text-brand-gold hover:underline">
            + Agregar imagen
          </button>
        </div>
        <p className="text-xs text-brand-ink/50">
          Pega la URL de cada foto (por ejemplo subida a Cloudinary, Imgur o Google Drive publico).
        </p>
        <div className="space-y-2">
          {images.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="https://..."
                value={url}
                onChange={(e) => updateImage(i, e.target.value)}
                className="input-field flex-1"
              />
              <button type="button" onClick={() => removeImage(i)} className="text-brand-ferrari text-sm px-2">
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.2em] text-brand-ink/50">Variantes de color y stock</h2>
          <button
            type="button"
            onClick={() => setVariants((p) => [...p, emptyVariant()])}
            className="text-sm text-brand-gold hover:underline"
          >
            + Agregar variante
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 rounded-xl border border-brand-line p-4 sm:grid-cols-6">
              <input
                placeholder="Color (ej. Negro)"
                value={v.colorName}
                onChange={(e) => updateVariant(i, { colorName: e.target.value })}
                className="input-field sm:col-span-2"
              />
              <input
                type="color"
                value={v.colorHex}
                onChange={(e) => updateVariant(i, { colorHex: e.target.value })}
                className="h-10 w-full rounded border border-brand-line"
              />
              <input
                placeholder="Lente (opcional)"
                value={v.lensColor}
                onChange={(e) => updateVariant(i, { lensColor: e.target.value })}
                className="input-field sm:col-span-2"
              />
              <input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
                className="input-field"
              />
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Ajuste precio (+/-)"
                value={v.priceDelta}
                onChange={(e) => updateVariant(i, { priceDelta: Number(e.target.value) })}
                className="input-field"
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="text-brand-ferrari text-sm sm:col-span-6 text-left"
              >
                Quitar variante
              </button>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-brand-ferrari">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-brand-ink px-10 py-3 text-sm uppercase tracking-wide text-brand-cream hover:bg-brand-gold hover:text-brand-ink transition-colors disabled:opacity-50"
      >
        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
