import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl text-brand-ink">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
