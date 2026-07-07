"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";

type Variant = {
  id: string;
  colorName: string;
  colorHex: string;
  lensColor: string | null;
  stock: number;
  priceDelta: number;
  imageUrl: string | null;
};

type Props = {
  productId: string;
  slug: string;
  name: string;
  basePrice: number;
  images: { url: string }[];
  variants: Variant[];
};

export function ProductDetailClient({ productId, slug, name, basePrice, images, variants }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0],
    [selectedVariantId, variants]
  );

  const price = basePrice + (selectedVariant?.priceDelta ?? 0);
  const mainImage = selectedVariant?.imageUrl ?? images[0]?.url ?? "https://placehold.co/800x600";
  const outOfStock = !selectedVariant || selectedVariant.stock <= 0;

  const handleAddToCart = () => {
    if (!selectedVariant || outOfStock) return;
    addItem({
      productId,
      variantId: selectedVariant.id,
      slug,
      name,
      variantLabel: `${selectedVariant.colorName}${selectedVariant.lensColor ? ` · lente ${selectedVariant.lensColor}` : ""}`,
      image: mainImage,
      unitPrice: price,
      maxStock: selectedVariant.stock,
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-cream">
        <Image src={mainImage} alt={name} fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" priority />
      </div>

      <div>
        <h1 className="font-serif text-3xl text-brand-ink">{name}</h1>
        <p className="mt-3 font-serif text-2xl text-brand-gold">{formatPrice(price)}</p>

        <div className="mt-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-brand-ink/50 mb-3">
            Color: {selectedVariant?.colorName}
          </h3>
          <div className="flex flex-wrap gap-3">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                aria-label={v.colorName}
                className={`relative h-10 w-10 rounded-full border-2 transition-all ${
                  selectedVariantId === v.id ? "border-brand-gold scale-110" : "border-brand-line"
                } ${v.stock <= 0 ? "opacity-30" : ""}`}
                style={{ backgroundColor: v.colorHex }}
                disabled={v.stock <= 0}
                title={v.stock <= 0 ? "Sin stock" : v.colorName}
              />
            ))}
          </div>
        </div>

        {selectedVariant?.lensColor && (
          <p className="mt-4 text-sm text-brand-ink/70">Lente: {selectedVariant.lensColor}</p>
        )}

        <p className={`mt-4 text-sm ${outOfStock ? "text-brand-ferrari" : "text-green-700"}`}>
          {outOfStock ? "Sin stock en este color" : `Stock disponible: ${selectedVariant?.stock}`}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-6 w-full rounded-full bg-brand-ink py-4 text-sm uppercase tracking-wide text-brand-cream transition-colors hover:bg-brand-gold hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-12"
        >
          {added ? "Agregado ✓" : "Agregar al carrito"}
        </button>

        <div className="mt-10 space-y-2 border-t border-brand-line pt-6 text-sm text-brand-ink/70">
          <p>Producto 100% original, distribuidor autorizado Ray-Ban.</p>
          <p>Envios a todo el pais o retiro en zona Hipodromo, Parana.</p>
        </div>
      </div>
    </div>
  );
}
