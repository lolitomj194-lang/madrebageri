import type { Metadata } from "next";
import Link from "next/link";
import { getActiveCombos, toClientCombo } from "@/lib/catalog";
import { ComboCard } from "@/components/ComboCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Combos de asado prearmados",
  description: "Combos de asado económico, clásico, premium, para dos, familiar y de amigos con delivery en Paraná.",
};

export default async function CombosPage() {
  const combos = await getActiveCombos();
  return (
    <div>
      <section className="bg-grill text-brand-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow text-brand-ember-light">Combos prearmados</p>
            <h1 className="section-title mt-2 text-5xl sm:text-6xl">Asados listos para la parrilla</h1>
            <p className="mt-4 max-w-2xl text-brand-cream/75">
              Combos pensados para distintas cantidades de comensales. Algunos se arman por persona: elegí cuántos son y el precio se calcula solo.
            </p>
          </Reveal>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {combos.length === 0 ? (
          <p className="text-brand-ash">Todavía no hay combos cargados. Podés <Link href="/catalogo" className="underline">armar tu asado</Link> por porciones.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {combos.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 0.06}>
                <ComboCard combo={toClientCombo(c)} />
              </Reveal>
            ))}
          </div>
        )}
        <div className="mt-12 rounded-2xl bg-brand-cream-dark/70 p-6 text-center">
          <p className="font-display text-2xl uppercase text-brand-carbon">¿Ninguno te cierra?</p>
          <p className="mt-1 text-sm text-brand-ash">Armá tu asado a medida por porciones o dejá que la calculadora lo haga por vos.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/catalogo" className="btn btn-primary btn-sm">Armá tu asado</Link>
            <Link href="/calculadora" className="btn btn-outline btn-sm">Calculadora</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
