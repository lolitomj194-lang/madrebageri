import Link from "next/link";
import { getCatalog, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";
import clsx from "clsx";

export const revalidate = 0;

const COLLECTIONS = ["Ferrari", "Signature", "Classic"];

type SearchParams = {
  categoria?: string;
  coleccion?: string;
  buscar?: string;
  orden?: "relevancia" | "precio-asc" | "precio-desc" | "nuevo";
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getCatalog({
      categorySlug: params.categoria,
      collection: params.coleccion,
      search: params.buscar,
      sort: params.orden,
    }),
  ]);

  const buildHref = (overrides: Partial<SearchParams>) => {
    const next = { ...params, ...overrides };
    const qs = new URLSearchParams(
      Object.entries(next).filter(([, v]) => v) as [string, string][]
    ).toString();
    return qs ? `/catalogo?${qs}` : "/catalogo";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 border-b border-brand-line pb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-ink/50">Catalogo</p>
        <h1 className="font-serif text-3xl text-brand-ink">
          {params.coleccion ? `Coleccion ${params.coleccion}` : "Todos los anteojos"}
        </h1>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-8">
          <form action="/catalogo" className="flex gap-2">
            {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
            {params.coleccion && <input type="hidden" name="coleccion" value={params.coleccion} />}
            <input
              type="text"
              name="buscar"
              defaultValue={params.buscar}
              placeholder="Buscar modelo..."
              className="w-full rounded-full border border-brand-line px-4 py-2 text-sm focus:border-brand-gold focus:outline-none"
            />
          </form>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-ink/50 mb-3">Forma</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={buildHref({ categoria: undefined })}
                  className={clsx(
                    "hover:text-brand-gold",
                    !params.categoria ? "font-semibold text-brand-ink" : "text-brand-ink/70"
                  )}
                >
                  Todas
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={buildHref({ categoria: cat.slug })}
                    className={clsx(
                      "hover:text-brand-gold",
                      params.categoria === cat.slug ? "font-semibold text-brand-ink" : "text-brand-ink/70"
                    )}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-ink/50 mb-3">Coleccion</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={buildHref({ coleccion: undefined })}
                  className={clsx(
                    "hover:text-brand-gold",
                    !params.coleccion ? "font-semibold text-brand-ink" : "text-brand-ink/70"
                  )}
                >
                  Todas
                </Link>
              </li>
              {COLLECTIONS.map((c) => (
                <li key={c}>
                  <Link
                    href={buildHref({ coleccion: c })}
                    className={clsx(
                      "hover:text-brand-gold",
                      params.coleccion === c ? "font-semibold text-brand-ink" : "text-brand-ink/70"
                    )}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-brand-ink/60">{products.length} productos</p>
            <form action="/catalogo" className="flex items-center gap-2 text-sm">
              {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
              {params.coleccion && <input type="hidden" name="coleccion" value={params.coleccion} />}
              {params.buscar && <input type="hidden" name="buscar" value={params.buscar} />}
              <label htmlFor="orden" className="text-brand-ink/60">
                Ordenar:
              </label>
              <SortSelect defaultValue={params.orden ?? "relevancia"} />
            </form>
          </div>

          {products.length === 0 ? (
            <p className="text-brand-ink/60">No encontramos productos con esos filtros.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
