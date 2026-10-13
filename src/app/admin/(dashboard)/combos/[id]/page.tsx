import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { unitPrice } from "@/lib/pricing";
import { ComboForm, type ComboFormValues } from "@/components/admin/ComboForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function EditComboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [combo, products] = await Promise.all([
    prisma.combo.findUnique({ where: { id }, include: { items: { orderBy: { order: "asc" } } } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!combo) notFound();
  const initial: ComboFormValues = {
    id: combo.id,
    name: combo.name,
    description: combo.description ?? "",
    imageUrl: combo.imageUrl ?? "",
    pricing: combo.pricing,
    price: String(combo.price),
    extraPersonPrice: combo.extraPersonPrice === null ? "" : String(combo.extraPersonPrice),
    compareAtPrice: combo.compareAtPrice ? String(combo.compareAtPrice) : "",
    persons: String(combo.persons),
    maxPersons: combo.maxPersons ? String(combo.maxPersons) : "",
    badge: combo.badge ?? "",
    featured: combo.featured,
    active: combo.active,
    order: String(combo.order),
    items: combo.items.map((it) => ({ productId: it.productId, quantity: String(it.quantity), inGrams: it.inGrams, perExtraPerson: String(it.perExtraPerson), note: it.note ?? "" })),
  };
  return (
    <div>
      <AdminPageHeader title={combo.name} subtitle="Editar combo" />
      <ComboForm initial={initial} products={products.map((p) => ({ id: p.id, name: p.name, unitLabel: p.unitLabel, unitPrice: unitPrice(p), pricePerKg: p.pricePerKg, saleUnit: p.saleUnit }))} />
    </div>
  );
}
