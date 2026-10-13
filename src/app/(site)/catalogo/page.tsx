import Link from "next/link";
import type { Metadata } from "next";
import { getActiveProducts, getCategories, toClientProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Armá tu asado · Cortes por porción",
  description: "Elegí vacío, costilla, tira de asado, entraña, achuras y embutidos por porción. Delivery de carne en Paraná.",
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [products, categories] = await Promise.all([getActiveProducts(), getCategories()]);
  const visibleCategories = categories.filter((c) => products.some((p) => p.categoryId === c.id));
  const current = visibleCategories.find((c) => c.slug === categoria) ?? null;
  const groups = (current ? [current] : visibleCategories).map((c) => ({
    category: c,
    products: products.filter((p) => p.categoryId === c.id),
  }));

  return (
    <div>
      <section className="bg-grill text-brand-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow text-brand-ember-light">Armá tu propio asado</p>
            <h1 className="section-title mt-2 text-5xl sm:text-6xl">Elegí tus cortes por porción</h1>
            <p className="mt-4 max-w-2xl text-brand-cream/75">
              Nada de kilos ni gramos: elegís cuántas porciones querés de cada corte y calculamos el peso estimado. Si preferís, la{" "}
              <Link href="/calculadora" className="underline decoration-brand-ember underline-offset-4">calculadora</Link> te arma el asado según cuántos son.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="sticky top-[68px] z-20 border-b border-brand-line bg-brand-cream/95 backdrop-blur">
        <div className="scroll-x mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/catalogo" className={`chip ${!current ? "chip-active" : ""}`}>Todo</Link>
          {visibleCategories.map((c) => (
            <Link key={c.id} href={`/catalogo?categoria=${c.slug}`} className={`chip ${current?.id === c.id ? "chip-active" : ""}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {groups.length === 0 && <p className="text-brand-ash">No hay productos disponibles por el momento.</p>}
        {groups.map(({ category, products }) => (
          <section key={category.id} id={category.slug} className="mb-14 scroll-mt-32">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="section-title text-3xl text-brand-carbon sm:text-4xl">{category.name}</h2>
                {category.description && <p className="mt-1 text-sm text-brand-ash">{category.description}</p>}
              </div>
              <span className="text-xs uppercase tracking-wider text-brand-ash">{products.length} productos</span>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={toClientProduct(p)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
