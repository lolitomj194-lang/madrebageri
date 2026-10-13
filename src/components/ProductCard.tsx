"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { formatGrams, formatWeightRange, estimatedWeight, pluralUnit } from "@/lib/pricing";
import { QuantityStepper } from "@/components/QuantityStepper";
import type { ClientProduct } from "@/lib/catalog";

export function productToCartLine(p: ClientProduct) {
  return {
    key: `product:${p.id}`,
    kind: "product" as const,
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.imageUrl,
    unitLabel: p.unitLabel,
    unitPrice: p.unitPrice,
    minQuantity: p.minQuantity,
    estimated: p.estimated,
    portionMinGrams: p.saleUnit === "PORTION" ? p.portionMinGrams : p.unitGrams,
    portionMaxGrams: p.saleUnit === "PORTION" ? p.portionMaxGrams : p.unitGrams,
    role: p.role,
  };
}

export function PortionInfo({ product, className = "" }: { product: ClientProduct; className?: string }) {
  if (product.saleUnit === "PORTION" && product.portionMinGrams && product.portionMaxGrams) {
    return (
      <p className={`text-xs text-brand-ash ${className}`}>
        Porción individual estimada: {formatGrams(product.portionMinGrams)} a {formatGrams(product.portionMaxGrams)}
      </p>
    );
  }
  if (product.unitGrams) {
    return <p className={`text-xs text-brand-ash ${className}`}>Unidad de aprox. {formatGrams(product.unitGrams)}</p>;
  }
  return null;
}

export function ProductCard({ product, compact = false }: { product: ClientProduct; compact?: boolean }) {
  const [qty, setQty] = useState(product.minQuantity);
  const [added, setAdded] = useState(false);
  const addLine = useCartStore((s) => s.addLine);
  const weight = estimatedWeight(product, qty);
  const subtotal = product.unitPrice * qty;

  function add() {
    addLine(productToCartLine(product), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="card flex h-full flex-col">
      <Link href={`/producto/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-brand-carbon">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : null}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.tier === "PREMIUM" && <span className="badge bg-brand-carbon/80 text-brand-cream">Premium</span>}
          {product.featured && <span className="badge bg-brand-ember text-brand-cream">Recomendado</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-ash">{product.category.name}</p>
        <h3 className="mt-1 font-display text-2xl uppercase leading-none text-brand-carbon">
          <Link href={`/producto/${product.slug}`}>{product.name}</Link>
        </h3>
        {!compact && product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-brand-smoke/80">{product.description}</p>
        )}
        <PortionInfo product={product} className="mt-2" />

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-2xl text-brand-carbon">{formatPrice(product.unitPrice)}</span>
          <span className="text-xs text-brand-ash">/ {product.unitLabel}</span>
        </div>
        {product.estimated && product.pricePerKg && (
          <p className="text-[11px] text-brand-ash">
            Estimado · {formatPrice(product.pricePerKg)}/kg · se confirma al pesar
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <QuantityStepper value={qty} onChange={setQty} min={product.minQuantity} label={`Cantidad de ${pluralUnit(product.unitLabel, 2)}`} />
          <div className="text-right">
            <p className="font-display text-lg leading-none text-brand-carbon">{formatPrice(subtotal)}</p>
            {weight && product.saleUnit === "PORTION" && (
              <p className="text-[11px] text-brand-ash">{formatWeightRange(weight.minG, weight.maxG)}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={add}
          className={`btn mt-4 w-full ${added ? "btn-dark" : "btn-primary"}`}
          aria-live="polite"
        >
          {added ? "¡Agregado!" : product.role === "FUEGO" || product.role === "ACCESORIO" ? "Agregar" : "Agregar al asado"}
        </button>
      </div>
    </article>
  );
}
