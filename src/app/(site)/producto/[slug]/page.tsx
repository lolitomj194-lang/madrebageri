import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 0;

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ProductDetailClient
        productId={product.id}
        slug={product.slug}
        name={product.name}
        basePrice={product.basePrice}
        cashPrice={product.cashPrice}
        images={product.images}
        variants={product.variants}
      />

      {product.description && (
        <div className="mt-16 max-w-3xl border-t border-brand-line pt-8">
          <h2 className="font-serif text-xl text-brand-ink mb-3">Descripcion</h2>
          <p className="text-brand-ink/70 leading-relaxed">{product.description}</p>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16 border-t border-brand-line pt-10">
          <h2 className="font-serif text-2xl text-brand-ink mb-6">Tambien te puede interesar</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
