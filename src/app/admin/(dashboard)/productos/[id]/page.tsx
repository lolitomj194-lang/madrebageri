import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } }, variants: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl text-brand-ink mb-6">Editar producto</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          collection: product.collection ?? "Classic",
          basePrice: product.basePrice,
          categoryId: product.categoryId,
          featured: product.featured,
          active: product.active,
          images: product.images.map((i) => ({ url: i.url })),
          variants: product.variants.map((v) => ({
            colorName: v.colorName,
            colorHex: v.colorHex,
            lensColor: v.lensColor ?? "",
            sku: v.sku,
            stock: v.stock,
            priceDelta: v.priceDelta,
          })),
        }}
      />
    </div>
  );
}
