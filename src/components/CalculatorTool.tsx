"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/QuantityStepper";
import { PlanEditor } from "@/components/PlanEditor";
import Link from "next/link";
import { formatGrams } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import type { Plan, Appetite, Level } from "@/lib/calculator";

const APPETITES: { value: Appetite; label: string; text: string }[] = [
  { value: "poco", label: "Comen poco", text: "Menos cantidad por persona" },
  { value: "normal", label: "Normal", text: "La porción clásica" },
  { value: "abundante", label: "Abundante", text: "Para que sobre" },
];
const LEVELS: { value: Level; label: string; text: string }[] = [
  { value: "economico", label: "Económico", text: "Cortes rendidores" },
  { value: "clasico", label: "Clásico", text: "Vacío, tira, costilla" },
  { value: "premium", label: "Premium", text: "Entraña, bife, ojo de bife" },
];

export function CalculatorTool({ levelsEnabled = false }: { levelsEnabled?: boolean }) {
  const [persons, setPersons] = useState(6);
  const [children, setChildren] = useState(0);
  const [appetite, setAppetite] = useState<Appetite>("normal");
  const [level, setLevel] = useState<Level>("clasico");
  const [includeAchuras, setIncludeAchuras] = useState(true);
  const [includeEmbutidos, setIncludeEmbutidos] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function calculate(ev?: React.FormEvent) {
    ev?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persons, children, appetite, level, includeAchuras, includeEmbutidos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlan(data.plan);
      setTimeout(() => document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo calcular.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      <form onSubmit={calculate} className="h-fit space-y-6 rounded-2xl border border-brand-line bg-white p-6 lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <label className="font-medium">¿Para cuántas personas?</label>
          <QuantityStepper value={persons} onChange={(v) => { setPersons(v); if (children > v) setChildren(v); }} min={1} max={200} label="Personas" />
        </div>
        <div className="flex items-center justify-between">
          <label className="font-medium">¿Cuántos son niños?</label>
          <QuantityStepper value={children} onChange={setChildren} min={0} max={persons} label="Niños" />
        </div>

        <fieldset>
          <legend className="label">¿Cómo comen?</legend>
          <div className="grid grid-cols-3 gap-2">
            {APPETITES.map((a) => (
              <label key={a.value} className={`option-card ${appetite === a.value ? "option-card-active" : ""}`}>
                <input type="radio" name="appetite" className="sr-only" checked={appetite === a.value} onChange={() => setAppetite(a.value)} />
                <span className="text-sm font-semibold">{a.label}</span>
                <span className="text-[11px] text-brand-ash">{a.text}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {levelsEnabled && (
        <fieldset>
          <legend className="label">¿Qué tipo de asado?</legend>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <label key={l.value} className={`option-card ${level === l.value ? "option-card-active" : ""}`}>
                <input type="radio" name="level" className="sr-only" checked={level === l.value} onChange={() => setLevel(l.value)} />
                <span className="text-sm font-semibold">{l.label}</span>
                <span className="text-[11px] text-brand-ash">{l.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-3 rounded-xl border border-brand-line px-4 py-3 text-sm">
            <input type="checkbox" checked={includeAchuras} onChange={(e) => setIncludeAchuras(e.target.checked)} className="h-4 w-4 accent-brand-ember" />
            Incluir achuras (mollejas, chinchulines, riñones)
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-brand-line px-4 py-3 text-sm">
            <input type="checkbox" checked={includeEmbutidos} onChange={(e) => setIncludeEmbutidos(e.target.checked)} className="h-4 w-4 accent-brand-ember" />
            Incluir chorizos y morcillas
          </label>
        </div>

        {error && <p className="text-sm text-brand-ember">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Calculando…" : "Calcular mi asado"}
        </button>
      </form>

      <div id="resultado" className="scroll-mt-24">
        {!plan ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-brand-line p-8 text-center">
            <p className="font-display text-2xl uppercase text-brand-carbon">Tu recomendación aparece acá</p>
            <p className="mt-2 max-w-sm text-sm text-brand-ash">
              Calculamos cuántas porciones de cada corte necesitás según cuántos son, cómo comen y qué tipo de asado querés.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-brand-carbon p-5 text-brand-cream">
              <p className="eyebrow text-brand-ember-light">Recomendación para {persons} persona{persons > 1 ? "s" : ""}</p>
              <p className="mt-2 text-sm text-brand-cream/80">
                Objetivo: aprox. <strong>{formatGrams(plan.targetMeatGrams)}</strong> de carne en total ({formatGrams(Math.round(plan.targetMeatGrams / Math.max(1, plan.eaters)))} por comensal equivalente).
                Repartido entre cortes principales{includeAchuras ? ", achuras" : ""}{includeEmbutidos ? " y embutidos" : ""}.
              </p>
              {plan.notes.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-brand-cream/60">
                  {plan.notes.map((n, i) => <li key={i}>· {n}</li>)}
                </ul>
              )}
            </div>
            {plan.reference && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-line bg-white px-5 py-4 text-sm">
                <p>
                  Referencia: el <strong>{plan.reference.label}</strong> para {plan.reference.persons} personas sale{" "}
                  <strong>{formatPrice(plan.reference.price)}</strong> con aprox. {formatGrams(plan.reference.grams)} de carne.
                  {plan.reference.applied ? " Ajustamos la recomendación para que no quede por debajo." : ""}
                </p>
                <Link href="/combos" className="btn btn-outline btn-sm">Ver el combo</Link>
              </div>
            )}
            <PlanEditor
              lines={plan.lines.filter((l) => !l.optional)}
              extraLines={plan.lines.filter((l) => l.optional)}
              footer={plan.estimated ? <p className="mt-2 text-[11px] text-brand-ash">Los cortes por kilo tienen precio estimado; el importe final se confirma por WhatsApp.</p> : null}
            />
            <p className="text-xs text-brand-ash">Podés cambiar cantidades o quitar productos antes de agregar todo al carrito.</p>
          </div>
        )}
      </div>
    </div>
  );
}
