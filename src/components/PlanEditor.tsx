"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { estimatedWeight, formatWeightRange, formatGrams, pluralUnit } from "@/lib/pricing";
import { QuantityStepper } from "@/components/QuantityStepper";
import { productToCartLine } from "@/components/ProductCard";
import type { PlanLine } from "@/lib/calculator";

type EditableLine = PlanLine & { enabled: boolean };

/** Lista editable de una propuesta (calculadora o presupuesto) con boton para agregar todo al carrito. */
export function PlanEditor({
  lines,
  extraLines = [],
  footer,
  onTotalsChange,
}: {
  lines: PlanLine[];
  extraLines?: PlanLine[];
  footer?: React.ReactNode;
  onTotalsChange?: (totals: { price: number; minG: number; maxG: number }) => void;
}) {
  const [state, setState] = useState<EditableLine[]>(() => [...lines, ...extraLines].map((l) => ({ ...l, enabled: true })));
  // Si llega una propuesta nueva, se reinicia la edicion (ajuste de estado durante el render).
  const [source, setSource] = useState({ lines, extraLines });
  if (source.lines !== lines || source.extraLines !== extraLines) {
    setSource({ lines, extraLines });
    setState([...lines, ...extraLines].map((l) => ({ ...l, enabled: true })));
  }
  const addMany = useCartStore((s) => s.addMany);
  const [added, setAdded] = useState(false);

  const active = state.filter((l) => l.enabled);
  const price = active.reduce((s, l) => s + l.product.unitPrice * l.quantity, 0);
  const meat = active.filter((l) => ["CARNE", "ACHURA", "EMBUTIDO"].includes(l.product.role));
  const minG = meat.reduce((s, l) => s + (estimatedWeight(l.product, l.quantity)?.minG ?? 0), 0);
  const maxG = meat.reduce((s, l) => s + (estimatedWeight(l.product, l.quantity)?.maxG ?? 0), 0);
  const estimated = active.some((l) => l.product.estimated);

  useEffect(() => {
    onTotalsChange?.({ price, minG, maxG });
  }, [price, minG, maxG, onTotalsChange]);

  function update(idx: number, patch: Partial<EditableLine>) {
    setState((s) => s.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function addAll() {
    addMany(active.map((l) => ({ line: productToCartLine(l.product), quantity: l.quantity })));
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  if (state.length === 0) return null;

  return (
    <div className="rounded-2xl border border-brand-line bg-white">
      <ul className="divide-y divide-brand-line">
        {state.map((l, idx) => {
          const w = estimatedWeight(l.product, l.quantity);
          return (
            <li key={l.product.id} className={`flex gap-3 p-4 ${l.enabled ? "" : "opacity-50"}`}>
              <div className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-carbon sm:block">
                {l.product.imageUrl && <Image src={l.product.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg uppercase leading-tight text-brand-carbon">
                      {l.product.name}
                      {l.optional && <span className="ml-2 text-[10px] font-sans tracking-wider text-brand-ash">OPCIONAL</span>}
                    </p>
                    <p className="text-xs text-brand-ash">
                      {l.reason}
                      {l.targetGrams ? ` · objetivo ${formatGrams(l.targetGrams)}` : ""}
                    </p>
                  </div>
                  <label className="flex items-center gap-1 text-xs text-brand-ash">
                    <input type="checkbox" checked={l.enabled} onChange={(e) => update(idx, { enabled: e.target.checked })} className="accent-brand-ember" />
                    Incluir
                  </label>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <QuantityStepper value={l.quantity} onChange={(q) => update(idx, { quantity: q })} min={l.product.minQuantity} size="sm" label={`Cantidad de ${l.product.name}`} />
                  <div className="text-right text-sm">
                    <p className="font-semibold">{formatPrice(l.product.unitPrice * l.quantity)}</p>
                    <p className="text-[11px] text-brand-ash">
                      {l.quantity} {pluralUnit(l.product.unitLabel, l.quantity)}
                      {w ? ` · ${formatWeightRange(w.minG, w.maxG)}` : ""}
                      {l.product.estimated ? " · est." : ""}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-brand-line bg-brand-cream p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="text-sm">
            <p className="text-brand-ash">Carne total estimada</p>
            <p className="font-semibold">{maxG > 0 ? formatWeightRange(minG, maxG) : "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-brand-ash">Precio {estimated ? "estimado" : ""}</p>
            <p className="font-display text-3xl leading-none text-brand-carbon">{formatPrice(price)}</p>
          </div>
        </div>
        {footer}
        <button type="button" onClick={addAll} disabled={active.length === 0} className={`btn mt-4 w-full ${added ? "btn-dark" : "btn-primary"}`}>
          {added ? "¡Agregado al carrito!" : "Agregar todo al carrito"}
        </button>
      </div>
    </div>
  );
}
