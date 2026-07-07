import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getFerrariProducts, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 0;

export default async function Home() {
  const [featured, ferrari, categories] = await Promise.all([
    getFeaturedProducts(),
    getFerrariProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-ink text-brand-cream">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="https://placehold.co/1600x900/0b0b0c/c9a227?text=Ray-Ban+x+Scuderia+Ferrari"
            alt="Ray-Ban x Scuderia Ferrari"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-40">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-brand-gold-light">
              Distribuidor autorizado Ray-Ban · Parana
            </p>
            <h1 className="mt-6 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              La coleccion <span className="text-brand-gold">Scuderia Ferrari</span> llego a Parana
            </h1>
            <p className="mt-6 max-w-xl text-brand-cream/80">
              Anteojos de sol Ray-Ban 100% originales. Retira en zona Hipodromo o
              recibi tu pedido en cualquier punto del pais.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/catalogo?coleccion=Ferrari"
                className="rounded-full bg-brand-ferrari px-8 py-3 text-sm uppercase tracking-wide text-white transition-transform hover:scale-105"
              >
                Ver coleccion Ferrari
              </Link>
              <Link
                href="/catalogo"
                className="rounded-full border border-brand-gold px-8 py-3 text-sm uppercase tracking-wide text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink"
              >
                Ver todo el catalogo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Categories strip */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-serif text-2xl text-brand-ink">Buscar por forma</h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 0.05}>
              <Link
                href={`/catalogo?categoria=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-brand-line bg-white px-4 py-6 text-center transition-all hover:-translate-y-1 hover:border-brand-gold hover:shadow-lg"
              >
                <span className="text-sm font-medium text-brand-ink group-hover:text-brand-gold">
                  {cat.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Ferrari collection */}
      {ferrari.length > 0 && (
        <section className="bg-brand-ink py-16 text-brand-cream">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-ferrari">Edicion especial</p>
                  <h2 className="mt-2 font-serif text-3xl">Coleccion Scuderia Ferrari</h2>
                </div>
                <Link href="/catalogo?coleccion=Ferrari" className="hidden text-sm uppercase tracking-wide text-brand-gold hover:underline sm:block">
                  Ver todo
                </Link>
              </div>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ferrari.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 0.07}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-serif text-3xl text-brand-ink">Destacados</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-brand-line bg-brand-cream py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
          <div>
            <p className="font-serif text-lg text-brand-ink">100% Originales</p>
            <p className="mt-1 text-sm text-brand-ink/60">Distribuidor autorizado Ray-Ban</p>
          </div>
          <div>
            <p className="font-serif text-lg text-brand-ink">Envios a todo el pais</p>
            <p className="mt-1 text-sm text-brand-ink/60">Coordinamos el envio con vos</p>
          </div>
          <div>
            <p className="font-serif text-lg text-brand-ink">Retiro en Parana</p>
            <p className="mt-1 text-sm text-brand-ink/60">Zona Hipodromo</p>
          </div>
        </div>
      </section>
    </div>
  );
}
