import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
      },
    }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl text-brand-ink">Editar: {product.name}</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
