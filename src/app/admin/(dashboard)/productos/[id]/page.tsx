import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([prisma.product.findUnique({ where: { id } }), prisma.category.findMany({ orderBy: { order: "asc" } })]);
  if (!product) notFound();
  const s = (v: number | null) => (v === null ? "" : String(v));
  const initial: ProductFormValues = {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    imageUrl: product.imageUrl ?? "",
    categoryId: product.categoryId,
    role: product.role,
    tier: product.tier,
    saleUnit: product.saleUnit,
    priceMode: product.priceMode,
    pricePerKg: s(product.pricePerKg),
    fixedPrice: s(product.fixedPrice),
    portionMinGrams: s(product.portionMinGrams),
    portionMaxGrams: s(product.portionMaxGrams),
    portionRefGrams: s(product.portionRefGrams),
    unitGrams: s(product.unitGrams),
    unitLabel: product.unitLabel,
    suggestedPerPerson: s(product.suggestedPerPerson),
    minQuantity: String(product.minQuantity),
    featured: product.featured,
    active: product.active,
    recommendable: product.recommendable,
    order: String(product.order),
  };
  return (
    <div>
      <AdminPageHeader title={product.name} subtitle="Editar producto" />
      <ProductForm initial={initial} categories={categories} />
    </div>
  );
}
