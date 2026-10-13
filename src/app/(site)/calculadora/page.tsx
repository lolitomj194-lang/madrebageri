import type { Metadata } from "next";
import { CalculatorTool } from "@/components/CalculatorTool";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Calculadora de asado · ¿Cuánta carne por persona?",
  description: "Calculá cuántas porciones de cada corte necesitás según cantidad de personas, niños y apetito. Agregá todo al carrito y pedí por WhatsApp.",
};

export default function CalculatorPage() {
  return (
    <div>
      <section className="bg-grill text-brand-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow text-brand-ember-light">Calculadora inteligente</p>
            <h1 className="section-title mt-2 text-5xl sm:text-6xl">¿Cuánta carne necesito?</h1>
            <p className="mt-4 max-w-2xl text-brand-cream/75">
              Respondé unas preguntas y te recomendamos cortes y porciones con reglas claras: gramos por persona, menos para los niños, y las achuras y embutidos descuentan del total.
            </p>
          </Reveal>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CalculatorTool />
      </div>
    </div>
  );
}
