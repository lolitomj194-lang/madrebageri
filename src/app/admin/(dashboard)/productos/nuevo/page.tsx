import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCurrentAdmin } from "@/lib/current-admin";
import { getCostSettings } from "@/lib/cost-settings";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const admin = await getCurrentAdmin();
  const isOwner = admin?.role !== "STAFF";

  const [categories, materials, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    isOwner ? prisma.material.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
    isOwner ? getCostSettings() : Promise.resolve(undefined),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl text-brand-ink">Nuevo producto</h1>
      <ProductForm categories={categories} materialOptions={materials} costSettings={settings} />
    </div>
  );
}
