import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getProductBySlug, toClientProduct } from "@/lib/catalog";
import { getBusinessSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { formatGrams } from "@/lib/pricing";
import { ProductCard } from "@/components/ProductCard";
import { ProductBuyBox } from "@/components/ProductBuyBox";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} · ${product.category.name}`,
    description: product.description ?? `${product.name} por porción con delivery en Paraná.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();
  const [related, settings] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
      include: { category: true },
      orderBy: { order: "asc" },
      take: 4,
    }),
    getBusinessSettings(),
  ]);
  const client = toClientProduct(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-xs uppercase tracking-wider text-brand-ash" aria-label="Migas de pan">
        <Link href="/catalogo" className="hover:text-brand-carbon">Catálogo</Link> ·{" "}
        <Link href={`/catalogo?categoria=${product.category.slug}`} className="hover:text-brand-carbon">{product.category.name}</Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-brand-carbon">
          {product.imageUrl && <Image src={product.imageUrl} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />}
        </div>

        <div>
          <div className="flex gap-2">
            {product.tier === "PREMIUM" && <span className="badge bg-brand-carbon text-brand-cream">Premium</span>}
            {product.featured && <span className="badge bg-brand-ember text-brand-cream">Recomendado</span>}
          </div>
          <h1 className="section-title mt-3 text-5xl text-brand-carbon sm:text-6xl">{product.name}</h1>
          {product.description && <p className="mt-4 text-brand-smoke/85">{product.description}</p>}

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-brand-cream-dark/70 p-5 text-sm">
            {product.saleUnit === "PORTION" && product.portionMinGrams && product.portionMaxGrams && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-brand-ash">Porción individual</dt>
                <dd className="mt-1 font-semibold">{formatGrams(product.portionMinGrams)} a {formatGrams(product.portionMaxGrams)}</dd>
              </div>
            )}
            {product.unitGrams && product.saleUnit !== "PORTION" && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-brand-ash">Peso por unidad</dt>
                <dd className="mt-1 font-semibold">aprox. {formatGrams(product.unitGrams)}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wider text-brand-ash">Precio por {product.unitLabel}</dt>
              <dd className="mt-1 font-semibold">
                {formatPrice(client.unitPrice)} {client.estimated && <span className="font-normal text-brand-ash">(estimado)</span>}
              </dd>
            </div>
            {product.pricePerKg && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-brand-ash">Precio por kilo</dt>
                <dd className="mt-1 font-semibold">{formatPrice(product.pricePerKg)}</dd>
              </div>
            )}
            {product.minQuantity > 1 && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-brand-ash">Cantidad mínima</dt>
                <dd className="mt-1 font-semibold">{product.minQuantity} {product.unitLabel}s</dd>
              </div>
            )}
          </dl>

          <ProductBuyBox product={client} />

          {client.estimated && <p className="mt-4 text-xs leading-snug text-brand-ash">{settings.estimateNotice}</p>}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title text-3xl text-brand-carbon">También en {product.category.name.toLowerCase()}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={toClientProduct(p)} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
