"use client";

import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { formatWeightRange, pluralUnit } from "@/lib/pricing";
import { QuantityStepper } from "@/components/QuantityStepper";
import type { ClientCombo } from "@/lib/catalog";

function fmtQty(q: number) {
  return Number.isInteger(q) ? String(q) : q.toLocaleString("es-AR", { maximumFractionDigits: 1 });
}

export function comboLines(combo: ClientCombo, persons: number) {
  const mult = combo.pricing === "PER_PERSON" ? persons : 1;
  return combo.items.map((it) => {
    const qty = it.quantity * mult;
    const label = pluralUnit(it.unitLabel, qty);
    const weight =
      it.saleUnit === "PORTION" && it.portionMinGrams && it.portionMaxGrams
        ? formatWeightRange(it.portionMinGrams * qty, it.portionMaxGrams * qty)
        : null;
    return { text: `${fmtQty(qty)} ${label} de ${it.name}`, weight, note: it.note };
  });
}

export function comboTotal(combo: ClientCombo, persons: number) {
  return combo.pricing === "PER_PERSON" ? combo.price * persons : combo.price;
}

export function ComboCard({ combo }: { combo: ClientCombo }) {
  const [persons, setPersons] = useState(combo.persons);
  const [added, setAdded] = useState(false);
  const addLine = useCartStore((s) => s.addLine);
  const total = comboTotal(combo, persons);
  const lines = comboLines(combo, persons);

  function add() {
    const perPerson = combo.pricing === "PER_PERSON";
    addLine(
      {
        key: `combo:${combo.id}`,
        kind: "combo",
        id: combo.id,
        slug: combo.slug,
        name: combo.name,
        image: combo.imageUrl,
        unitLabel: perPerson ? "persona" : "combo",
        unitPrice: combo.price,
        minQuantity: perPerson ? combo.persons : 1,
        estimated: false,
        role: "COMBO",
        summary: lines.map((l) => l.text).join(", "),
      },
      perPerson ? persons : 1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="card flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-carbon">
        {combo.imageUrl && (
          <Image src={combo.imageUrl} alt={combo.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {combo.badge && <span className="badge bg-brand-ember text-brand-cream">{combo.badge}</span>}
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-brand-carbon/80 px-3 py-1 text-xs font-semibold text-brand-cream backdrop-blur">
          {combo.pricing === "PER_PERSON" ? `Desde ${combo.persons} personas` : `${combo.persons} personas aprox.`}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl uppercase leading-none text-brand-carbon">{combo.name}</h3>
        {combo.description && <p className="mt-2 text-sm text-brand-smoke/80">{combo.description}</p>}

        <ul className="mt-4 space-y-1.5 text-sm">
          {lines.map((l, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-ember" />
              <span>
                <span className="text-brand-carbon">{l.text}</span>
                {l.weight && <span className="text-brand-ash"> · {l.weight}</span>}
                {l.note && <span className="text-brand-ash"> · {l.note}</span>}
              </span>
            </li>
          ))}
        </ul>

        {combo.pricing === "PER_PERSON" && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-cream px-4 py-3">
            <span className="text-sm font-medium">¿Para cuántas personas?</span>
            <QuantityStepper value={persons} onChange={setPersons} min={combo.persons} max={combo.maxPersons ?? 50} size="sm" label="Personas" />
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              {combo.compareAtPrice && combo.compareAtPrice > total && combo.pricing === "FIXED" && (
                <p className="text-sm text-brand-ash line-through">{formatPrice(combo.compareAtPrice)}</p>
              )}
              <p className="font-display text-3xl leading-none text-brand-carbon">{formatPrice(total)}</p>
              {combo.pricing === "PER_PERSON" && (
                <p className="text-xs text-brand-ash">{formatPrice(combo.price)} por persona · {persons} personas</p>
              )}
            </div>
            <button type="button" onClick={add} className={`btn ${added ? "btn-dark" : "btn-primary"}`} aria-live="polite">
              {added ? "¡Agregado!" : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
