import { prisma } from "@/lib/prisma";
import { unitPrice } from "@/lib/pricing";
import { ComboForm, emptyCombo } from "@/components/admin/ComboForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function NewComboPage() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  return (
    <div>
      <AdminPageHeader title="Nuevo combo" />
      <ComboForm initial={emptyCombo} products={products.map((p) => ({ id: p.id, name: p.name, unitLabel: p.unitLabel, unitPrice: unitPrice(p), pricePerKg: p.pricePerKg, saleUnit: p.saleUnit }))} />
    </div>
  );
}
