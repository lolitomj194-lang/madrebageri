/**
 * Calculo de precio y contenido de combos. Sin dependencias de Prisma para poder usarse en el cliente.
 *
 * FIXED:      precio y cantidades cerradas (persons es informativo).
 * PER_PERSON: precio = price x personas; cantidades = quantity x personas (minimo persons).
 * SCALABLE:   base de `persons` personas a `price`; cada persona adicional suma `extraPersonPrice`
 *             y `perExtraPerson` de cada item (hasta maxPersons).
 */
import { formatGrams, formatWeightRange, pluralUnit } from "@/lib/pricing";

export type ComboPricingKind = "FIXED" | "PER_PERSON" | "SCALABLE";

export type ComboLike = {
  pricing: ComboPricingKind;
  price: number;
  extraPersonPrice: number | null;
  persons: number;
  maxPersons: number | null;
};

export type ComboItemLike = {
  name: string;
  unitLabel: string;
  quantity: number;
  inGrams: boolean;
  perExtraPerson: number;
  note?: string | null;
  saleUnit?: string;
  portionMinGrams?: number | null;
  portionMaxGrams?: number | null;
  unitGrams?: number | null;
};

export function comboAllowsPersons(combo: ComboLike) {
  if (combo.pricing === "PER_PERSON") return true;
  return combo.pricing === "SCALABLE" && (combo.extraPersonPrice ?? 0) > 0;
}

export function clampPersons(combo: ComboLike, persons: number | undefined) {
  const p = Math.max(combo.persons, Math.floor(persons ?? combo.persons));
  return combo.maxPersons ? Math.min(combo.maxPersons, p) : p;
}

export function comboTotal(combo: ComboLike, persons?: number) {
  if (combo.pricing === "FIXED") return combo.price;
  const p = clampPersons(combo, persons);
  if (combo.pricing === "PER_PERSON") return combo.price * p;
  return combo.price + (combo.extraPersonPrice ?? 0) * (p - combo.persons);
}

export function comboItemQuantity(combo: ComboLike, item: ComboItemLike, persons?: number) {
  if (combo.pricing === "FIXED") return item.quantity;
  const p = clampPersons(combo, persons);
  if (combo.pricing === "PER_PERSON") return item.quantity * p;
  return item.quantity + item.perExtraPerson * (p - combo.persons);
}

function fmtQty(q: number) {
  return Number.isInteger(q) ? String(q) : q.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

/** "1 kg de Costilla", "4 unidades de Chorizo", "0,5 porciones de Vacío". */
export function formatComboItem(item: ComboItemLike, qty: number) {
  if (item.inGrams) return `${formatGrams(qty)} de ${item.name}`;
  return `${fmtQty(qty)} ${pluralUnit(item.unitLabel, qty)} de ${item.name}`;
}

export function comboLines(combo: ComboLike, items: ComboItemLike[], persons?: number) {
  return items.map((it) => {
    const qty = comboItemQuantity(combo, it, persons);
    let weight: string | null = null;
    if (!it.inGrams && it.saleUnit === "PORTION" && it.portionMinGrams && it.portionMaxGrams) {
      weight = formatWeightRange(it.portionMinGrams * qty, it.portionMaxGrams * qty);
    }
    return { text: formatComboItem(it, qty), weight, note: it.note ?? null, qty };
  });
}

export function comboSummary(combo: ComboLike, items: ComboItemLike[], persons?: number) {
  return comboLines(combo, items, persons).map((l) => l.text).join(", ");
}

/** Gramos de carne aproximados de un combo (para informacion y calculadora). */
export function comboMeatGrams(combo: ComboLike, items: ComboItemLike[], persons?: number) {
  return items.reduce((sum, it) => {
    const qty = comboItemQuantity(combo, it, persons);
    if (it.inGrams) return sum + qty;
    if (it.saleUnit === "PORTION" && it.portionMinGrams && it.portionMaxGrams) return sum + ((it.portionMinGrams + it.portionMaxGrams) / 2) * qty;
    if (it.unitGrams) return sum + it.unitGrams * qty;
    return sum;
  }, 0);
}
