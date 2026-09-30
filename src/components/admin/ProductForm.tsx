"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageUploadButton } from "@/components/admin/ImageUploadButton";
import type { ProductInput, VariantInput } from "@/lib/product-input";

type Category = { id: string; name: string };

type ExistingProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cashPrice: number | null;
  wholesalePrice: number | null;
  wholesaleMinQty: number | null;
  categoryId: string;
  featured: boolean;
  active: boolean;
  images: { url: string }[];
  variants: {
    id: string;
    name: string;
    imageUrl: string | null;
    stock: number;
    priceDelta: number;
    active: boolean;
  }[];
};

type FormVariant = VariantInput & { key: string };

let keyCounter = 0;
function nextKey() {
  return `v${++keyCounter}`;
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: ExistingProduct;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [cashPrice, setCashPrice] = useState(product?.cashPrice != null ? String(product.cashPrice) : "");
  const [wholesalePrice, setWholesalePrice] = useState(
    product?.wholesalePrice != null ? String(product.wholesalePrice) : ""
  );
  const [wholesaleMinQty, setWholesaleMinQty] = useState(
    product?.wholesaleMinQty != null ? String(product.wholesaleMinQty) : ""
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) ?? []);
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [variants, setVariants] = useState<FormVariant[]>(
    product?.variants.map((v) => ({
      key: nextKey(),
      id: v.id,
      name: v.name,
      imageUrl: v.imageUrl,
      stock: v.stock,
      priceDelta: v.priceDelta,
      active: v.active,
    })) ?? [{ key: nextKey(), name: "", imageUrl: null, stock: 1, priceDelta: 0, active: true }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateVariant(key: string, patch: Partial<FormVariant>) {
    setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body: ProductInput = {
      name,
      description: description || undefined,
      price: Number(price),
      cashPrice: cashPrice ? Number(cashPrice) : null,
      wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
      wholesaleMinQty: wholesaleMinQty ? Number(wholesaleMinQty) : null,
      categoryId,
      featured,
      active,
      images: images.map((url) => ({ url })),
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        imageUrl: v.imageUrl,
        active: v.active,
        stock: Number(v.stock) || 0,
        priceDelta: Number(v.priceDelta) || 0,
      })),
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar");
        setSaving(false);
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    } catch {
      setError("Error de conexión");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Datos basicos */}
      <section className="space-y-3 rounded-2xl border border-brand-line bg-white p-5">
        <h2 className="font-serif text-lg text-brand-ink">Datos del producto</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nombre (ej: Almohadón 40x40 con cierre) *"
          className="input-field"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="input-field"
        >
          <option value="">Elegir categoría *</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Descripción: medidas, materiales, qué incluye..."
          className="input-field resize-none"
        />
        <div className="flex flex-wrap gap-5 pt-1 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Destacado en la portada
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Publicado en la tienda
          </label>
        </div>
      </section>

      {/* Precios */}
      <section className="space-y-3 rounded-2xl border border-brand-line bg-white p-5">
        <h2 className="font-serif text-lg text-brand-ink">Precios</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-brand-ink-soft">Precio de lista (tarjeta / Mercado Pago) *</span>
            <input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="18000"
              className="input-field"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-brand-ink-soft">Precio efectivo / transferencia (opcional)</span>
            <input
              type="number"
              min={1}
              value={cashPrice}
              onChange={(e) => setCashPrice(e.target.value)}
              placeholder="16500"
              className="input-field"
            />
          </label>
        </div>
        <div className="rounded-xl bg-brand-sage/10 p-4">
          <p className="mb-2 text-sm font-medium text-brand-ink">Venta mayorista (opcional)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-brand-ink-soft">Precio mayorista por unidad</span>
              <input
                type="number"
                min={1}
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="13500"
                className="input-field"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-brand-ink-soft">Cantidad mínima (unidades)</span>
              <input
                type="number"
                min={2}
                value={wholesaleMinQty}
                onChange={(e) => setWholesaleMinQty(e.target.value)}
                placeholder="10"
                className="input-field"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-brand-ink-soft">
            Al llegar a la cantidad mínima (sumando todas las telas del producto), el
            carrito aplica solo el precio mayorista.
          </p>
        </div>
      </section>

      {/* Fotos generales */}
      <section className="space-y-3 rounded-2xl border border-brand-line bg-white p-5">
        <h2 className="font-serif text-lg text-brand-ink">Fotos del producto</h2>
        <p className="text-xs text-brand-ink-soft">
          Fotos generales del modelo. Cada tela puede tener además su propia foto más abajo.
        </p>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative">
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-brand-line">
                  <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                  aria-label="Quitar foto"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-ink text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <ImageUploadButton onUploaded={(url) => setImages((imgs) => [...imgs, url])} />
          <span className="text-xs text-brand-ink-soft">o pegá una URL:</span>
          <input
            value={imageUrlDraft}
            onChange={(e) => setImageUrlDraft(e.target.value)}
            placeholder="https://..."
            className="input-field max-w-56"
          />
          <button
            type="button"
            onClick={() => {
              if (imageUrlDraft.trim()) {
                setImages((imgs) => [...imgs, imageUrlDraft.trim()]);
                setImageUrlDraft("");
              }
            }}
            className="rounded-full border border-brand-line bg-white px-3 py-2 text-sm hover:border-brand-terracotta"
          >
            Agregar
          </button>
        </div>
      </section>

      {/* Telas */}
      <section className="space-y-4 rounded-2xl border border-brand-line bg-white p-5">
        <div>
          <h2 className="font-serif text-lg text-brand-ink">Telas / diseños disponibles</h2>
          <p className="text-xs text-brand-ink-soft">
            Cada tela tiene su foto y su stock. Cuando se agota, poné el stock en 0 o
            desmarcá &quot;visible&quot;: el producto sigue publicado con el resto.
          </p>
        </div>

        {variants.map((variant, index) => (
          <div key={variant.key} className="space-y-3 rounded-xl border border-brand-line p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
                Tela {index + 1}
              </span>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => setVariants((vs) => vs.filter((v) => v.key !== variant.key))}
                  className="text-xs text-red-600 underline"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-start gap-4">
              <div className="space-y-2">
                {variant.imageUrl ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-brand-line">
                    <Image src={variant.imageUrl} alt="" fill sizes="96px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => updateVariant(variant.key, { imageUrl: null })}
                      aria-label="Quitar foto"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-ink/80 text-xs text-white"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-brand-line text-xs text-brand-ink-soft">
                    Sin foto
                  </div>
                )}
                <ImageUploadButton
                  label="Foto de la tela"
                  onUploaded={(url) => updateVariant(variant.key, { imageUrl: url })}
                />
              </div>

              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <label className="text-sm sm:col-span-2">
                  <span className="mb-1 block text-brand-ink-soft">Nombre de la tela *</span>
                  <input
                    value={variant.name}
                    onChange={(e) => updateVariant(variant.key, { name: e.target.value })}
                    required
                    placeholder="Ej: Floral terracota"
                    className="input-field"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-brand-ink-soft">Stock (unidades)</span>
                  <input
                    type="number"
                    min={0}
                    value={variant.stock}
                    onChange={(e) => updateVariant(variant.key, { stock: Number(e.target.value) })}
                    className="input-field"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-brand-ink-soft">Ajuste de precio (opcional)</span>
                  <input
                    type="number"
                    value={variant.priceDelta ?? 0}
                    onChange={(e) => updateVariant(variant.key, { priceDelta: Number(e.target.value) })}
                    placeholder="0"
                    className="input-field"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={variant.active ?? true}
                    onChange={(e) => updateVariant(variant.key, { active: e.target.checked })}
                  />
                  Visible en la tienda
                </label>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setVariants((vs) => [
              ...vs,
              { key: nextKey(), name: "", imageUrl: null, stock: 1, priceDelta: 0, active: true },
            ])
          }
          className="btn-secondary"
        >
          + Agregar tela
        </button>
      </section>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
        <button type="button" onClick={() => router.push("/admin/productos")} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
