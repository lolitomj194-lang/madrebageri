"use client";

import { useEffect, useState } from "react";
import { QuantityStepper } from "@/components/QuantityStepper";
import { PlanEditor } from "@/components/PlanEditor";
import { formatPrice } from "@/lib/format";
import type { BudgetResult, BudgetPreference } from "@/lib/calculator";

const PREFS: { value: BudgetPreference; label: string; text: string }[] = [
  { value: "economico", label: "Económico", text: "Máximo rendimiento" },
  { value: "equilibrado", label: "Equilibrado", text: "Clásicos y rendidores" },
  { value: "premium", label: "Premium", text: "Lo mejor que entre" },
];

type Zone = { id: string; name: string; fee: number };

export function BudgetTool({ levelsEnabled = false }: { levelsEnabled?: boolean }) {
  const [budget, setBudget] = useState("60000");
  const [persons, setPersons] = useState(6);
  const [preference, setPreference] = useState<BudgetPreference>("equilibrado");
  const [includeAccessories, setIncludeAccessories] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/delivery/options")
      .then((r) => r.json())
      .then((d) => setZones(d.zones ?? []))
      .catch(() => {});
  }, []);

  async function run(ev?: React.FormEvent) {
    ev?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: Number(budget.replace(/\D/g, "")), persons, preference, includeAccessories, zoneId: zoneId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setTimeout(() => document.getElementById("propuesta")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo armar la propuesta.");
    } finally {
      setLoading(false);
    }
  }

  const budgetNumber = Number(budget.replace(/\D/g, "")) || 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      <form onSubmit={run} className="h-fit space-y-6 rounded-2xl border border-brand-line bg-white p-6 lg:sticky lg:top-24">
        <div>
          <label className="label" htmlFor="budget">Presupuesto disponible (ARS)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ash">$</span>
            <input
              id="budget"
              className="input-field pl-8 font-display text-2xl"
              inputMode="numeric"
              value={budgetNumber ? budgetNumber.toLocaleString("es-AR") : ""}
              onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))}
              placeholder="60.000"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="font-medium">¿Para cuántas personas?</label>
          <QuantityStepper value={persons} onChange={setPersons} min={1} max={200} label="Personas" />
        </div>

        {levelsEnabled && (
        <fieldset>
          <legend className="label">Preferencia</legend>
          <div className="grid grid-cols-3 gap-2">
            {PREFS.map((p) => (
              <label key={p.value} className={`option-card ${preference === p.value ? "option-card-active" : ""}`}>
                <input type="radio" name="pref" className="sr-only" checked={preference === p.value} onChange={() => setPreference(p.value)} />
                <span className="text-sm font-semibold">{p.label}</span>
                <span className="text-[11px] text-brand-ash">{p.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
        )}

        <label className="flex items-center gap-3 rounded-xl border border-brand-line px-4 py-3 text-sm">
          <input type="checkbox" checked={includeAccessories} onChange={(e) => setIncludeAccessories(e.target.checked)} className="h-4 w-4 accent-brand-ember" />
          Incluir carbón o leña dentro del presupuesto
        </label>

        <div>
          <label className="label" htmlFor="zone">Descontar envío (opcional)</label>
          <select id="zone" className="input-field" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            <option value="">No descontar envío / retiro por local</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name} · envío {formatPrice(z.fee)}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-brand-ember">{error}</p>}
        <button type="submit" disabled={loading || budgetNumber <= 0} className="btn btn-primary w-full">
          {loading ? "Armando…" : "Armar mi asado"}
        </button>
      </form>

      <div id="propuesta" className="scroll-mt-24">
        {!result ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-brand-line p-8 text-center">
            <p className="font-display text-2xl uppercase text-brand-carbon">Tu propuesta aparece acá</p>
            <p className="mt-2 max-w-sm text-sm text-brand-ash">Ejemplo: “Tengo $60.000 para 6 personas”. Armamos la mejor combinación con los precios actuales del catálogo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-2xl p-5 ${result.ok ? "bg-brand-carbon text-brand-cream" : "bg-amber-50 text-amber-900 border border-amber-200"}`}>
              <p className={`eyebrow ${result.ok ? "text-brand-ember-light" : "text-amber-700"}`}>
                {result.ok ? (result.adjusted ? "Propuesta ajustada al presupuesto" : "Entra en tu presupuesto") : "El presupuesto no alcanza"}
              </p>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <div><span className="block text-xs opacity-70">Presupuesto</span><strong>{formatPrice(budgetNumber)}</strong></div>
                <div><span className="block text-xs opacity-70">Para comida</span><strong>{formatPrice(Math.max(0, result.foodBudget))}</strong></div>
                <div><span className="block text-xs opacity-70">Carne por persona</span><strong>{result.gramsPerPerson} g aprox.</strong></div>
              </div>
              {(result.deliveryFee > 0 || result.accessoriesCost > 0) && (
                <p className="mt-2 text-xs opacity-75">
                  Se reservaron {result.deliveryFee > 0 ? `${formatPrice(result.deliveryFee)} de envío` : ""}{result.deliveryFee > 0 && result.accessoriesCost > 0 ? " y " : ""}
                  {result.accessoriesCost > 0 ? `${formatPrice(result.accessoriesCost)} en accesorios` : ""}.
                </p>
              )}
              {result.warnings.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs">
                  {result.warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}
                </ul>
              )}
              {result.alternatives.length > 0 && (
                <div className="mt-3 text-xs">
                  <p className="font-semibold">Alternativas:</p>
                  <ul className="mt-1 space-y-1">{result.alternatives.map((a, i) => <li key={i}>· {a}</li>)}</ul>
                </div>
              )}
            </div>

            {result.plan && result.plan.lines.length > 0 && (
              <>
                {!result.ok && (
                  <p className="text-xs text-amber-800">
                    Abajo mostramos el asado mínimo recomendado para {persons} personas (cuesta {formatPrice(result.foodCost)}), para que compares. No lo presentamos como suficiente dentro de tu presupuesto.
                  </p>
                )}
                <PlanEditor
                  lines={result.plan.lines.filter((l) => !l.optional)}
                  extraLines={[...result.plan.lines.filter((l) => l.optional), ...result.accessories]}
                  footer={
                    <p className="mt-2 text-[11px] text-brand-ash">
                      {result.deliveryFee > 0 ? `Más ${formatPrice(result.deliveryFee)} de envío. ` : ""}
                      {result.plan.estimated ? "Los cortes por kilo tienen precio estimado; se confirma por WhatsApp." : ""}
                    </p>
                  }
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
