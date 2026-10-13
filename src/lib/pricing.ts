import type { PriceMode, SaleUnit } from "@/generated/prisma/enums";

export type PricedProduct = {
  saleUnit: SaleUnit;
  priceMode: PriceMode;
  pricePerKg: number | null;
  fixedPrice: number | null;
  portionMinGrams: number | null;
  portionMaxGrams: number | null;
  portionRefGrams: number | null;
  unitGrams: number | null;
  unitLabel: string;
  minQuantity: number;
};

/** Redondea a los $10 mas cercanos para evitar centavos raros en precios por kg. */
export function roundPrice(value: number) {
  return Math.round(value / 10) * 10;
}

/** Gramos usados como referencia de precio para una unidad de venta. */
export function referenceGrams(p: PricedProduct): number | null {
  if (p.saleUnit === "PORTION") return p.portionRefGrams ?? null;
  return p.unitGrams ?? null;
}

/** Precio de una porcion / unidad / paquete en pesos. */
export function unitPrice(p: PricedProduct): number {
  if (p.priceMode === "FIXED") return p.fixedPrice ?? 0;
  const grams = referenceGrams(p);
  if (!p.pricePerKg || !grams) return 0;
  return roundPrice((p.pricePerKg * grams) / 1000);
}

/** El precio depende del peso final: se confirma por WhatsApp. */
export function isEstimated(p: PricedProduct): boolean {
  return p.priceMode === "PER_KG";
}

export type WeightProduct = Pick<PricedProduct, "saleUnit" | "portionMinGrams" | "portionMaxGrams" | "portionRefGrams" | "unitGrams">;

export function estimatedWeight(p: WeightProduct, quantity: number) {
  if (p.saleUnit === "PORTION") {
    const min = p.portionMinGrams ?? p.portionRefGrams;
    const max = p.portionMaxGrams ?? p.portionRefGrams;
    if (!min || !max) return null;
    return { minG: min * quantity, maxG: max * quantity };
  }
  if (p.unitGrams) {
    return { minG: p.unitGrams * quantity, maxG: p.unitGrams * quantity };
  }
  return null;
}

export function formatGrams(grams: number) {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg.toLocaleString("es-AR", { maximumFractionDigits: 2 })} kg`;
  }
  return `${Math.round(grams)} g`;
}

export function formatWeightRange(minG: number, maxG: number) {
  if (minG === maxG) return `aprox. ${formatGrams(minG)}`;
  return `aprox. ${formatGrams(minG)} a ${formatGrams(maxG)}`;
}

/** Pluraliza la etiqueta de unidad ("porcion" -> "porciones", "bolsa 4 kg" -> "bolsas 4 kg"). */
export function pluralUnit(label: string, quantity: number) {
  if (quantity === 1) return label;
  const [first, ...rest] = label.split(" ");
  let plural: string;
  if (/ión$/i.test(first)) plural = first.replace(/ión$/i, "iones");
  else if (/[aeiouáéíóú]$/i.test(first)) plural = `${first}s`;
  else plural = `${first}es`;
  return [plural, ...rest].join(" ");
}

export function lineDetail(p: PricedProduct, quantity: number) {
  const w = estimatedWeight(p, quantity);
  const base = `${quantity} ${pluralUnit(p.unitLabel, quantity)}`;
  if (w && p.saleUnit === "PORTION") return `${base} (${formatWeightRange(w.minG, w.maxG)})`;
  return base;
}
