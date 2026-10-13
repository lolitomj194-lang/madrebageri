import type { Metadata } from "next";
import { BudgetTool } from "@/components/BudgetTool";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Armá tu asado según tu presupuesto",
  description: "Decinos cuánto querés gastar y para cuántas personas: te proponemos la mejor combinación de cortes con los precios actuales.",
};

export default function BudgetPage() {
  return (
    <div>
      <section className="bg-grill text-brand-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow text-brand-ember-light">Asado por presupuesto</p>
            <h1 className="section-title mt-2 text-5xl sm:text-6xl">Decinos cuánto y para cuántos</h1>
            <p className="mt-4 max-w-2xl text-brand-cream/75">
              Armamos una propuesta con los precios reales del catálogo. Si el presupuesto no alcanza para las cantidades mínimas recomendadas, te lo decimos y te mostramos alternativas.
            </p>
          </Reveal>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <BudgetTool />
      </div>
    </div>
  );
}
