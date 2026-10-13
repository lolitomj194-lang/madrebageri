"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { estimatedWeight, formatWeightRange, pluralUnit } from "@/lib/pricing";
import { QuantityStepper } from "@/components/QuantityStepper";
import { productToCartLine } from "@/components/ProductCard";
import type { ClientProduct } from "@/lib/catalog";

export function ProductBuyBox({ product }: { product: ClientProduct }) {
  const [qty, setQty] = useState(product.minQuantity);
  const [added, setAdded] = useState(false);
  const addLine = useCartStore((s) => s.addLine);
  const weight = estimatedWeight(product, qty);

  function add() {
    addLine(productToCartLine(product), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="mt-6 rounded-2xl border border-brand-line bg-white p-5">
      <p className="label">¿Cuántas {pluralUnit(product.unitLabel, 2)}?</p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <QuantityStepper value={qty} onChange={setQty} min={product.minQuantity} />
        <div className="text-right">
          <p className="font-display text-3xl leading-none text-brand-carbon">{formatPrice(product.unitPrice * qty)}</p>
          {weight && product.saleUnit === "PORTION" && (
            <p className="mt-1 text-xs text-brand-ash">Peso estimado: {formatWeightRange(weight.minG, weight.maxG)}</p>
          )}
          {product.estimated && <p className="text-[11px] text-brand-ash">Subtotal estimado</p>}
        </div>
      </div>
      <button type="button" onClick={add} className={`btn mt-5 w-full ${added ? "btn-dark" : "btn-primary"}`}>
        {added ? "¡Agregado a tu asado!" : "Agregar al asado"}
      </button>
    </div>
  );
}
