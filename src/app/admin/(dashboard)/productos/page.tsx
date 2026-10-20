import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminProductsTable, type ProductCostInfo } from "@/components/admin/AdminProductsTable";
import { BulkPriceUpdate } from "@/components/admin/BulkPriceUpdate";
import { CategoryQuickAdd } from "@/components/admin/CategoryQuickAdd";
import { getCurrentAdmin } from "@/lib/current-admin";
import { getCostSettings } from "@/lib/cost-settings";
import { computeCost, hasCostData, marginPercent } from "@/lib/costing";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const admin = await getCurrentAdmin();
  const isOwner = admin?.role !== "STAFF";

  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
        materials: { include: { material: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    isOwner ? getCostSettings() : Promise.resolve(null),
  ]);

  // Costo y margen por producto, solo para la duena.
  const costInfo: Record<string, ProductCostInfo> = {};
  if (settings) {
    for (const p of products) {
      if (!hasCostData(p)) continue;
      const cost = computeCost(p, settings);
      costInfo[p.id] = {
        totalCost: cost.totalCost,
        retailMargin: marginPercent(p.price, cost.totalCost),
        wholesaleMargin: p.wholesalePrice != null ? marginPercent(p.wholesalePrice, cost.totalCost) : null,
      };
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-brand-ink">Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Nuevo producto
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {isOwner ? <BulkPriceUpdate /> : <span />}
        <CategoryQuickAdd />
      </div>

      <AdminProductsTable products={products} costInfo={isOwner ? costInfo : undefined} />
    </div>
  );
}
