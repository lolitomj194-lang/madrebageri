import { prisma } from "@/lib/prisma";
import { ManualSaleForm } from "@/components/admin/ManualSaleForm";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const [products, customers] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        price: true,
        cashPrice: true,
        wholesalePrice: true,
        wholesaleMinQty: true,
        variants: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, stock: true, priceDelta: true, active: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      select: { id: true, name: true, phone: true, isWholesale: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl text-brand-ink">Registrar venta</h1>
        <p className="text-sm text-brand-ink-soft">
          Para ventas por Instagram, a locales, conocidos o en ferias. Las de la web se registran solas.
        </p>
      </div>
      <ManualSaleForm products={products} customers={customers} />
    </div>
  );
}
