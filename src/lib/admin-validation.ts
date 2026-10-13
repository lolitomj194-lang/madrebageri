import type { AsadoRole, SaleUnit, PriceMode, Tier, ComboPricing, CouponType } from "@/generated/prisma/enums";
import { slugify } from "@/lib/slugify";

export const ROLES: AsadoRole[] = ["CARNE", "ACHURA", "EMBUTIDO", "EXTRA", "ACCESORIO", "FUEGO"];
export const SALE_UNITS: SaleUnit[] = ["PORTION", "UNIT", "PACKAGE"];
export const PRICE_MODES: PriceMode[] = ["PER_KG", "FIXED"];
export const TIERS: Tier[] = ["ECONOMICO", "CLASICO", "PREMIUM"];

export class ValidationError extends Error {}

function str(v: unknown, max = 500) {
  const s = String(v ?? "").trim();
  return s.length ? s.slice(0, max) : null;
}
function int(v: unknown) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : null;
}
function num(v: unknown) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function bool(v: unknown, fallback = false) {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
}
function oneOf<T extends string>(v: unknown, list: T[], fallback: T): T {
  return list.includes(v as T) ? (v as T) : fallback;
}

export function parseProduct(body: Record<string, unknown>) {
  const name = str(body.name, 120);
  if (!name) throw new ValidationError("El nombre es obligatorio.");
  const categoryId = str(body.categoryId, 60);
  if (!categoryId) throw new ValidationError("Elegí una categoría.");
  const saleUnit = oneOf(body.saleUnit, SALE_UNITS, "PORTION");
  const priceMode = oneOf(body.priceMode, PRICE_MODES, "PER_KG");
  const pricePerKg = int(body.pricePerKg);
  const fixedPrice = int(body.fixedPrice);
  const portionMinGrams = int(body.portionMinGrams);
  const portionMaxGrams = int(body.portionMaxGrams);
  const portionRefGrams = int(body.portionRefGrams);
  const unitGrams = int(body.unitGrams);

  if (priceMode === "PER_KG") {
    if (!pricePerKg || pricePerKg <= 0) throw new ValidationError("Ingresá el precio por kilo.");
    if (saleUnit === "PORTION" && (!portionRefGrams || portionRefGrams <= 0)) throw new ValidationError("Ingresá el peso de referencia de la porción.");
    if (saleUnit !== "PORTION" && (!unitGrams || unitGrams <= 0)) throw new ValidationError("Para precio por kilo en unidades, ingresá el peso por unidad.");
  } else if (!fixedPrice || fixedPrice <= 0) {
    throw new ValidationError("Ingresá el precio por unidad de venta.");
  }
  if (saleUnit === "PORTION") {
    if (!portionMinGrams || !portionMaxGrams || portionMinGrams <= 0 || portionMaxGrams < portionMinGrams) {
      throw new ValidationError("El rango de peso por porción debe ser válido (mínimo ≤ máximo).");
    }
    if (portionRefGrams && (portionRefGrams < portionMinGrams || portionRefGrams > portionMaxGrams)) {
      throw new ValidationError("El peso de referencia debe estar dentro del rango mínimo-máximo.");
    }
  }
  const minQuantity = Math.max(1, int(body.minQuantity) ?? 1);
  const suggestedPerPerson = num(body.suggestedPerPerson);
  const slugBase = str(body.slug, 120) ?? name;

  return {
    name,
    slug: slugify(slugBase),
    description: str(body.description, 1000),
    imageUrl: str(body.imageUrl, 600),
    categoryId,
    role: oneOf(body.role, ROLES, "CARNE"),
    tier: oneOf(body.tier, TIERS, "CLASICO"),
    saleUnit,
    priceMode,
    pricePerKg: priceMode === "PER_KG" ? pricePerKg : pricePerKg ?? null,
    fixedPrice: priceMode === "FIXED" ? fixedPrice : null,
    portionMinGrams: saleUnit === "PORTION" ? portionMinGrams : null,
    portionMaxGrams: saleUnit === "PORTION" ? portionMaxGrams : null,
    portionRefGrams: saleUnit === "PORTION" ? portionRefGrams ?? Math.round(((portionMinGrams ?? 0) + (portionMaxGrams ?? 0)) / 2) : null,
    unitGrams: saleUnit === "PORTION" ? null : unitGrams,
    unitLabel: str(body.unitLabel, 40) ?? (saleUnit === "PORTION" ? "porción" : saleUnit === "UNIT" ? "unidad" : "bolsa"),
    suggestedPerPerson: suggestedPerPerson && suggestedPerPerson > 0 ? suggestedPerPerson : null,
    minQuantity,
    featured: bool(body.featured),
    active: bool(body.active, true),
    recommendable: bool(body.recommendable, true),
    order: int(body.order) ?? 0,
  };
}

export function parseCombo(body: Record<string, unknown>) {
  const name = str(body.name, 120);
  if (!name) throw new ValidationError("El nombre es obligatorio.");
  const pricing = oneOf(body.pricing, ["FIXED", "PER_PERSON", "SCALABLE"] as ComboPricing[], "FIXED");
  const price = int(body.price);
  if (!price || price <= 0) throw new ValidationError("Ingresá el precio.");
  const persons = Math.max(1, int(body.persons) ?? 1);
  const maxPersons = int(body.maxPersons);
  if (maxPersons !== null && maxPersons < persons) throw new ValidationError("El máximo de personas no puede ser menor al mínimo.");
  const extraPersonPrice = int(body.extraPersonPrice);
  if (pricing === "SCALABLE" && (extraPersonPrice === null || extraPersonPrice < 0)) {
    throw new ValidationError("Ingresá el recargo por persona adicional (puede ser 0).");
  }
  const rawItems = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
  const items = rawItems
    .map((it, order) => ({
      productId: str(it.productId, 60),
      quantity: num(it.quantity),
      inGrams: bool(it.inGrams),
      perExtraPerson: pricing === "SCALABLE" ? Math.max(0, num(it.perExtraPerson) ?? 0) : 0,
      note: str(it.note, 120),
      order,
    }))
    .filter(
      (it): it is { productId: string; quantity: number; inGrams: boolean; perExtraPerson: number; note: string | null; order: number } =>
        Boolean(it.productId) && it.quantity !== null && it.quantity > 0
    );
  if (items.length === 0) throw new ValidationError("Agregá al menos un producto al combo.");
  const compareAtPrice = int(body.compareAtPrice);
  return {
    name,
    slug: slugify(str(body.slug, 120) ?? name),
    description: str(body.description, 1000),
    imageUrl: str(body.imageUrl, 600),
    pricing,
    price,
    extraPersonPrice: pricing === "SCALABLE" ? extraPersonPrice : null,
    compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : null,
    persons,
    maxPersons: pricing === "FIXED" ? null : maxPersons,
    badge: str(body.badge, 40),
    featured: bool(body.featured),
    active: bool(body.active, true),
    order: int(body.order) ?? 0,
    items,
  };
}

export function parseZone(body: Record<string, unknown>) {
  const name = str(body.name, 80);
  if (!name) throw new ValidationError("El nombre de la zona es obligatorio.");
  const freeShippingFrom = int(body.freeShippingFrom);
  return {
    name,
    neighborhoods: str(body.neighborhoods, 500),
    fee: Math.max(0, int(body.fee) ?? 0),
    minOrder: Math.max(0, int(body.minOrder) ?? 0),
    freeShippingFrom: freeShippingFrom && freeShippingFrom > 0 ? freeShippingFrom : null,
    active: bool(body.active, true),
    order: int(body.order) ?? 0,
  };
}

export function parseCoupon(body: Record<string, unknown>) {
  const code = str(body.code, 40)?.toUpperCase().replace(/\s+/g, "");
  if (!code) throw new ValidationError("El código es obligatorio.");
  const type = oneOf(body.type, ["PERCENT", "FIXED"] as CouponType[], "PERCENT");
  const value = int(body.value);
  if (!value || value <= 0) throw new ValidationError("Ingresá el valor del descuento.");
  if (type === "PERCENT" && value > 100) throw new ValidationError("El porcentaje no puede superar 100.");
  const toDate = (v: unknown) => {
    const s = str(v, 30);
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const maxUses = int(body.maxUses);
  return {
    code,
    description: str(body.description, 200),
    type,
    value,
    minTotal: Math.max(0, int(body.minTotal) ?? 0),
    validFrom: toDate(body.validFrom),
    validTo: toDate(body.validTo),
    maxUses: maxUses && maxUses > 0 ? maxUses : null,
    active: bool(body.active, true),
  };
}

export function parseHour(body: Record<string, unknown>) {
  const dayOfWeek = int(body.dayOfWeek);
  if (dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6) throw new ValidationError("Día inválido.");
  const time = (v: unknown, fallback: string) => {
    const s = str(v, 5) ?? fallback;
    return /^\d{2}:\d{2}$/.test(s) ? s : fallback;
  };
  return {
    dayOfWeek,
    open: bool(body.open),
    openTime: time(body.openTime, "18:00"),
    closeTime: time(body.closeTime, "23:00"),
    slotMinutes: Math.max(15, int(body.slotMinutes) ?? 60),
    slotCapacity: Math.max(1, int(body.slotCapacity) ?? 6),
  };
}

export function parseBusinessSettings(body: Record<string, unknown>) {
  const whatsappDigits = String(body.whatsapp ?? "").replace(/\D/g, "");
  const notificationEmail = (str(body.notificationEmail, 160) ?? "").toLowerCase();
  if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
    throw new ValidationError("El correo de avisos no es válido.");
  }
  return {
    name: str(body.name, 80) ?? "ENTRE CORTES",
    notificationEmail,
    slogan: str(body.slogan, 160) ?? "",
    slogan2: str(body.slogan2, 160) ?? "",
    whatsapp: whatsappDigits,
    address: str(body.address, 200) ?? "",
    city: str(body.city, 80) ?? "Paraná, Entre Ríos",
    instagram: str(body.instagram, 80),
    facebook: str(body.facebook, 200),
    logoUrl: str(body.logoUrl, 600),
    heroImageUrl: str(body.heroImageUrl, 600),
    expressEnabled: bool(body.expressEnabled, true),
    scheduledEnabled: bool(body.scheduledEnabled, true),
    pickupEnabled: bool(body.pickupEnabled, true),
    expressTargetMinutes: Math.max(10, int(body.expressTargetMinutes) ?? 60),
    prepTimeMinutes: Math.max(0, int(body.prepTimeMinutes) ?? 30),
    scheduleDaysAhead: Math.min(30, Math.max(0, int(body.scheduleDaysAhead) ?? 7)),
    estimateNotice: str(body.estimateNotice, 500) ?? "",
    policies: str(body.policies, 4000),
  };
}

export function parseCalculatorSettings(body: Record<string, unknown>) {
  const f = (v: unknown, fallback: number, min: number, max: number) => Math.min(max, Math.max(min, num(v) ?? fallback));
  return {
    gramsPerAdult: Math.round(f(body.gramsPerAdult, 450, 100, 1500)),
    childFactor: f(body.childFactor, 0.5, 0, 1),
    lightFactor: f(body.lightFactor, 0.8, 0.3, 1),
    heavyFactor: f(body.heavyFactor, 1.25, 1, 2),
    achuraSharePercent: Math.round(f(body.achuraSharePercent, 15, 0, 60)),
    embutidoDiscountGrams: Math.round(f(body.embutidoDiscountGrams, 80, 0, 300)),
    cutsUpTo4: Math.round(f(body.cutsUpTo4, 2, 1, 6)),
    cutsUpTo10: Math.round(f(body.cutsUpTo10, 3, 1, 6)),
    cutsOver10: Math.round(f(body.cutsOver10, 4, 1, 8)),
    minGramsPerPerson: Math.round(f(body.minGramsPerPerson, 300, 100, 1000)),
    suggestExtras: bool(body.suggestExtras, true),
  };
}
