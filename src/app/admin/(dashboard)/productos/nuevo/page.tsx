import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-2xl text-brand-ink mb-6">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
