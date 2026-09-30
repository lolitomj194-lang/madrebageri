import Link from "next/link";
import { getCatalog, getCategories, type CatalogFilters } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";

export const dynamic = "force-dynamic";

export const metadata = { title: "Catálogo" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string; orden?: string }>;
}) {
  const params = await searchParams;
  const sort = (params.orden ?? "relevancia") as CatalogFilters["sort"];

  const [categories, products] = await Promise.all([
    getCategories(),
    getCatalog({
      categorySlug: params.categoria,
      search: params.buscar,
      sort,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.categoria);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl text-brand-ink">
        {activeCategory ? activeCategory.name : "Catálogo"}
      </h1>
      <p className="mt-1 text-sm text-brand-ink-soft">
        Las telas mostradas son las disponibles hoy y van rotando.
      </p>

      {/* Filtros de categoria */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/catalogo"
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            !params.categoria
              ? "border-brand-terracotta bg-brand-terracotta text-white"
              : "border-brand-line bg-white text-brand-ink hover:border-brand-terracotta"
          }`}
        >
          Todo
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalogo?categoria=${cat.slug}`}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              params.categoria === cat.slug
                ? "border-brand-terracotta bg-brand-terracotta text-white"
                : "border-brand-line bg-white text-brand-ink hover:border-brand-terracotta"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Busqueda y orden */}
      <form
        method="get"
        action="/catalogo"
        className="mt-4 flex flex-wrap items-center gap-3 text-sm"
      >
        {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
        <input
          type="search"
          name="buscar"
          defaultValue={params.buscar ?? ""}
          placeholder="Buscar producto..."
          className="input-field max-w-60"
        />
        <label htmlFor="orden" className="text-brand-ink-soft">
          Ordenar:
        </label>
        <SortSelect defaultValue={sort ?? "relevancia"} />
        <button type="submit" className="rounded-full border border-brand-line bg-white px-4 py-2 font-medium hover:border-brand-terracotta">
          Aplicar
        </button>
      </form>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-brand-ink-soft">
          No encontramos productos con esos filtros.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
