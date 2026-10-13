import { prisma } from "@/lib/prisma";
import { unitPrice, isEstimated, pluralUnit } from "@/lib/pricing";
import type { Product, Category, Combo, ComboItem } from "@/generated/prisma/client";

export type ProductWithCategory = Product & { category: Category };
export type ComboWithItems = Combo & { items: (ComboItem & { product: ProductWithCategory })[] };

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export async function getActiveProducts() {
  return prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }, { name: "asc" }],
  });
}

export async function getFeaturedProducts(take = 6) {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    take,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include: { category: true } });
}

export async function getActiveCombos() {
  return prisma.combo.findMany({
    where: { active: true },
    include: { items: { include: { product: { include: { category: true } } }, orderBy: { order: "asc" } } },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

export async function getComboBySlug(slug: string) {
  return prisma.combo.findUnique({
    where: { slug },
    include: { items: { include: { product: { include: { category: true } } }, orderBy: { order: "asc" } } },
  });
}

/** Version serializable y segura de un producto para componentes cliente. */
export function toClientProduct(p: ProductWithCategory) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    role: p.role,
    tier: p.tier,
    saleUnit: p.saleUnit,
    priceMode: p.priceMode,
    pricePerKg: p.pricePerKg,
    fixedPrice: p.fixedPrice,
    unitLabel: p.unitLabel,
    unitPrice: unitPrice(p),
    estimated: isEstimated(p),
    portionMinGrams: p.portionMinGrams,
    portionMaxGrams: p.portionMaxGrams,
    portionRefGrams: p.portionRefGrams,
    unitGrams: p.unitGrams,
    minQuantity: p.minQuantity,
    suggestedPerPerson: p.suggestedPerPerson,
    recommendable: p.recommendable,
    featured: p.featured,
    category: { name: p.category.name, slug: p.category.slug, role: p.category.role },
  };
}

export type ClientProduct = ReturnType<typeof toClientProduct>;

/** Precio total de un combo para una cantidad de personas. */
export function comboPrice(combo: Pick<Combo, "pricing" | "price" | "persons">, persons?: number) {
  if (combo.pricing === "FIXED") return combo.price;
  return combo.price * Math.max(combo.persons, persons ?? combo.persons);
}

export function comboItemsSummary(combo: ComboWithItems, persons?: number) {
  const mult = combo.pricing === "PER_PERSON" ? Math.max(combo.persons, persons ?? combo.persons) : 1;
  return combo.items
    .map((it) => {
      const qty = it.quantity * mult;
      const q = Number.isInteger(qty) ? qty : qty.toFixed(1);
      return `${q} ${pluralUnit(it.product.unitLabel, qty)} de ${it.product.name}`;
    })
    .join(", ");
}

export function toClientCombo(c: ComboWithItems) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imageUrl: c.imageUrl,
    pricing: c.pricing,
    price: c.price,
    compareAtPrice: c.compareAtPrice,
    persons: c.persons,
    maxPersons: c.maxPersons,
    badge: c.badge,
    featured: c.featured,
    items: c.items.map((it) => ({
      productId: it.productId,
      name: it.product.name,
      quantity: it.quantity,
      unitLabel: it.product.unitLabel,
      note: it.note,
      portionMinGrams: it.product.portionMinGrams,
      portionMaxGrams: it.product.portionMaxGrams,
      saleUnit: it.product.saleUnit,
    })),
  };
}

export type ClientCombo = ReturnType<typeof toClientCombo>;
