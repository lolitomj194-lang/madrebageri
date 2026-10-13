import { prisma } from "@/lib/prisma";
import { ProductForm, emptyProduct } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <AdminPageHeader title="Nuevo producto" />
      <ProductForm initial={{ ...emptyProduct, categoryId: categories[0]?.id ?? "", role: categories[0]?.role ?? "CARNE" }} categories={categories} />
    </div>
  );
}
