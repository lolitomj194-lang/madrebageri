import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { site, instagramLink, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-brand-line bg-brand-cream">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:py-24">
          <Reveal>
            <p className="rounded-full border border-brand-terracotta/40 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-terracotta">
              Hecho a mano · Envíos a todo el país
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="max-w-2xl font-serif text-4xl leading-tight text-brand-ink sm:text-6xl">
              Telas que cambian, piezas únicas para tu casa
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="max-w-xl text-lg text-brand-ink-soft">
              Almohadones, blanquería, carteras y materos confeccionados
              artesanalmente. El stock de telas va rotando: lo que ves hoy,
              mañana puede no estar.
            </p>
          </Reveal>
          <Reveal delay={240} className="flex flex-wrap gap-3">
            <Link href="/catalogo" className="btn-primary">
              Ver catálogo
            </Link>
            <Link href="/mayorista" className="btn-secondary">
              Comprar por mayor
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Categorias */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 font-serif text-2xl text-brand-ink">Categorías</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.slug}`}
                className="rounded-full border border-brand-line bg-white px-5 py-2.5 text-sm font-medium text-brand-ink transition-colors hover:border-brand-terracotta hover:text-brand-terracotta"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-serif text-2xl text-brand-ink">Destacados</h2>
            <Link href="/catalogo" className="text-sm font-medium text-brand-terracotta hover:underline">
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="border-y border-brand-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3">
          {[
            {
              title: "1 · Elegí modelo y tela",
              text: "Cada producto muestra las telas disponibles hoy, con foto real. ¿Querés otra? Consultanos por WhatsApp.",
            },
            {
              title: "2 · Pagá como prefieras",
              text: "Mercado Pago (tarjeta o cuotas), transferencia o efectivo. Con transferencia hay descuento.",
            },
            {
              title: "3 · Lo recibís donde estés",
              text: "Enviamos a todo el país por correo. El costo se coordina por WhatsApp según destino y tamaño del paquete.",
            },
          ].map((step) => (
            <div key={step.title} className="space-y-2">
              <h3 className="font-serif text-lg text-brand-terracotta">{step.title}</h3>
              <p className="text-sm leading-relaxed text-brand-ink-soft">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mayorista */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col items-start gap-5 rounded-3xl bg-brand-sage/15 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-xl space-y-2">
            <h2 className="font-serif text-2xl text-brand-ink">
              ¿Tenés un local o revendés?
            </h2>
            <p className="text-sm leading-relaxed text-brand-ink-soft">
              Comprá por mayor con precios especiales por cantidad, combinando
              telas del mismo producto. Ideal para tiendas de deco, regalerías y
              revendedoras de todo el país.
            </p>
          </div>
          <Link href="/mayorista" className="btn-primary shrink-0">
            Conocer precios mayoristas
          </Link>
        </div>
      </section>

      {/* Instagram */}
      <section className="border-t border-brand-line bg-brand-cream">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="font-serif text-2xl text-brand-ink">
            Las telas nuevas se muestran primero en Instagram
          </h2>
          <p className="max-w-lg text-sm text-brand-ink-soft">
            Seguinos en @{site.instagram} para ver los ingresos de tela apenas
            llegan, o escribinos directo por WhatsApp.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={instagramLink()} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Ir a Instagram
            </a>
            <a
              href={whatsappLink(`Hola ${site.name}! Quiero ver las telas disponibles.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
