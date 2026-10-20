import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCurrentAdmin } from "@/lib/current-admin";
import { getCostSettings } from "@/lib/cost-settings";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  const isOwner = admin?.role !== "STAFF";

  const [categories, product, materials, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
        materials: true,
      },
    }),
    isOwner ? prisma.material.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
    isOwner ? getCostSettings() : Promise.resolve(undefined),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl text-brand-ink">Editar: {product.name}</h1>
      <ProductForm
        categories={categories}
        product={product}
        materialOptions={materials}
        costSettings={settings}
      />
    </div>
  );
}
