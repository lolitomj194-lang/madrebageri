import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getActiveCombos, toClientProduct, toClientCombo } from "@/lib/catalog";
import { getBusinessSettings, getOpeningHours, getActiveZones } from "@/lib/settings";
import { describeHours } from "@/lib/hours";
import { ProductCard } from "@/components/ProductCard";
import { ComboCard } from "@/components/ComboCard";
import { Reveal } from "@/components/Reveal";
import { formatPrice } from "@/lib/format";

export const revalidate = 0;

const STEPS = [
  { n: "01", title: "Elegí para cuántos", text: "Decinos cuántas personas son o usá la calculadora para que te recomendemos cantidades." },
  { n: "02", title: "Armá tu asado", text: "Sumá cortes por porción (no por kilo), combos listos, achuras y embutidos." },
  { n: "03", title: "Todo para el fuego", text: "Agregá leña, carbón, sal y salsas en el mismo pedido." },
  { n: "04", title: "Enviá por WhatsApp", text: "Completás tus datos y el pedido se envía por WhatsApp. Confirmamos precio final y entrega por chat." },
];

export default async function Home() {
  const [featured, combos, settings, hours, zones] = await Promise.all([
    getFeaturedProducts(8),
    getActiveCombos(),
    getBusinessSettings(),
    getOpeningHours(),
    getActiveZones(),
  ]);
  const featuredCombos = combos.filter((c) => c.featured).slice(0, 3);
  const promoCombos = combos.filter((c) => c.compareAtPrice || c.badge).slice(0, 3);
  const hoursRows = describeHours(hours);
  const heroImage = settings.heroImageUrl || "/img/hero.svg";

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-carbon text-brand-cream">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="Asado argentino en la parrilla" fill priority className="object-cover opacity-80" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-carbon via-brand-carbon/60 to-brand-carbon/20" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
          <Reveal>
            <p className="eyebrow text-brand-ember-light">Paraná, Entre Ríos · Miércoles a domingos</p>
            <h1 className="mt-5 max-w-4xl font-display text-6xl font-bold uppercase leading-[0.92] sm:text-7xl lg:text-8xl">
              Vos poné el fuego.
              <br />
              <span className="text-brand-ember-light">Nosotros, el asado.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-cream/80">
              {settings.slogan2} Cortes por porción, combos listos, achuras y todo para prender. Delivery express, programado o retiro por local.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/catalogo" className="btn btn-primary">Armá tu asado</Link>
              <Link href="/combos" className="btn btn-outline-light">Ver combos</Link>
              <Link href="/calculadora" className="btn btn-outline-light">Calculá tu asado</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <p className="eyebrow">Cómo funciona</p>
          <h2 className="section-title mt-2 text-4xl text-brand-carbon sm:text-5xl">Tu asado completo, sin ir a la carnicería</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="card h-full p-6">
                <span className="font-display text-4xl text-brand-ember">{s.n}</span>
                <h3 className="mt-3 font-display text-2xl uppercase leading-none text-brand-carbon">{s.title}</h3>
                <p className="mt-2 text-sm text-brand-smoke/80">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COMBOS DESTACADOS */}
      {featuredCombos.length > 0 && (
        <section className="bg-brand-cream-dark/60 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Combos destacados</p>
                  <h2 className="section-title mt-2 text-4xl text-brand-carbon sm:text-5xl">Listos para la parrilla</h2>
                </div>
                <Link href="/combos" className="btn btn-outline btn-sm">Ver todos los combos</Link>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {featuredCombos.map((c, i) => (
                <Reveal key={c.id} delay={i * 0.08}>
                  <ComboCard combo={toClientCombo(c)} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CORTES RECOMENDADOS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Cortes recomendados</p>
              <h2 className="section-title mt-2 text-4xl text-brand-carbon sm:text-5xl">Elegí por porciones, no por kilos</h2>
              <p className="mt-3 max-w-xl text-sm text-brand-smoke/80">
                Cada corte tiene una porción individual estimada. Vos decís cuántas porciones querés y nosotros calculamos el peso.
              </p>
            </div>
            <Link href="/catalogo" className="btn btn-outline btn-sm">Ver todo el catálogo</Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <ProductCard product={toClientProduct(p)} compact />
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROMOCIONES */}
      {promoCombos.length > 0 && (
        <section className="bg-grill py-16 text-brand-cream">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <p className="eyebrow text-brand-ember-light">Promociones</p>
              <h2 className="section-title mt-2 text-4xl sm:text-5xl">Ofertas de miércoles a domingo</h2>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {promoCombos.map((c, i) => (
                <Reveal key={c.id} delay={i * 0.08}>
                  <Link href="/combos" className="block rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
                    {c.badge && <span className="badge bg-brand-ember text-brand-cream">{c.badge}</span>}
                    <h3 className="mt-3 font-display text-2xl uppercase leading-none">{c.name}</h3>
                    <p className="mt-2 text-sm text-brand-cream/70">{c.description}</p>
                    <div className="mt-4 flex items-baseline gap-2">
                      {c.compareAtPrice && <span className="text-sm text-brand-cream/50 line-through">{formatPrice(c.compareAtPrice)}</span>}
                      <span className="font-display text-3xl">{formatPrice(c.price)}</span>
                      {c.pricing === "PER_PERSON" && <span className="text-xs text-brand-cream/60">por persona</span>}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DELIVERY + HORARIOS + COBERTURA */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        <Reveal className="lg:col-span-1">
          <div className="card h-full bg-brand-ember p-7 text-brand-cream">
            <p className="eyebrow text-brand-cream/70">Delivery express en Paraná</p>
            <h2 className="section-title mt-2 text-4xl">Lo pedís y lo llevamos</h2>
            <p className="mt-4 text-sm text-brand-cream/85">
              Entrega express con objetivo de aproximadamente {settings.expressTargetMinutes} minutos dentro del horario de atención, sujeta a confirmación y disponibilidad. También podés programar día y franja horaria, o retirar por el local sin costo de envío.
            </p>
            <Link href="/catalogo" className="btn btn-outline-light mt-6">Pedir ahora</Link>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="card h-full p-7">
            <p className="eyebrow">Horarios</p>
            <h2 className="section-title mt-2 text-3xl text-brand-carbon">Miércoles a domingos</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {hoursRows.map((h) => (
                <li key={h.name} className="flex justify-between border-b border-brand-line pb-1.5">
                  <span className={h.open ? "" : "text-brand-ash"}>{h.name}</span>
                  <span className={h.open ? "font-medium" : "text-brand-ash"}>{h.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="card h-full p-7">
            <p className="eyebrow">Cobertura</p>
            <h2 className="section-title mt-2 text-3xl text-brand-carbon">Zonas de reparto</h2>
            {zones.length === 0 ? (
              <p className="mt-4 text-sm text-brand-ash">Las zonas de reparto se configuran desde el panel.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {zones.map((z) => (
                  <li key={z.id}>
                    <div className="flex justify-between">
                      <span className="font-medium">{z.name}</span>
                      <span>{z.fee === 0 ? "Sin costo" : formatPrice(z.fee)}</span>
                    </div>
                    {z.neighborhoods && <p className="text-xs text-brand-ash">{z.neighborhoods}</p>}
                    {z.freeShippingFrom && <p className="text-xs text-brand-success">Envío gratis desde {formatPrice(z.freeShippingFrom)}</p>}
                  </li>
                ))}
              </ul>
            )}
            {settings.address && <p className="mt-4 text-xs text-brand-ash">Retiro por local: {settings.address}</p>}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
