"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hourlyRate, overheadPerUnit, type CostSettingsInput } from "@/lib/costing";
import { formatPrice } from "@/lib/format";

type Field = {
  key: keyof CostSettingsInput;
  label: string;
  help: string;
  step?: string;
  prefix?: string;
  suffix?: string;
};

const FIELDS: Field[] = [
  {
    key: "ownerMonthlySalary",
    label: "Lo que querés ganar por mes",
    help: "Tu sueldo. Si no te lo ponés, tu tiempo vale $0 en los costos.",
    prefix: "$",
  },
  {
    key: "employeeDailyRate",
    label: "Jornal de la empleada",
    help: "Lo que cobra por día trabajado.",
    prefix: "$",
  },
  {
    key: "employeeDaysPerWeek",
    label: "Días por semana que viene",
    help: "Promedio. Si viene 3 o 4 días, poné 3,5.",
    step: "0.5",
  },
  {
    key: "productiveHoursPerMonth",
    label: "Horas de confección del taller por mes",
    help: "Entre vos y la empleada, horas reales cosiendo (sin fotos, mensajes ni compras).",
    suffix: "hs",
  },
  {
    key: "fixedMonthlyCosts",
    label: "Gastos fijos del mes",
    help: "Community manager, luz, máquinas, packaging, publicidad, bolsas de envío.",
    prefix: "$",
  },
  {
    key: "estimatedMonthlyUnits",
    label: "Productos que hacés por mes",
    help: "Aproximado. Sirve para repartir los gastos fijos entre todo lo que producís.",
    suffix: "u.",
  },
  {
    key: "wholesaleMarginPercent",
    label: "Ganancia mayorista",
    help: "Porcentaje sobre el costo para el precio sugerido mayorista.",
    suffix: "%",
  },
  {
    key: "retailMultiplier",
    label: "Factor minorista",
    help: "El minorista sugerido es el mayorista multiplicado por esto (1,8 a 2 es lo habitual).",
    step: "0.1",
    suffix: "×",
  },
  {
    key: "mpFeePercent",
    label: "Comisión de Mercado Pago",
    help: "Para saber cuánto te queda neto cuando pagan con tarjeta.",
    step: "0.1",
    suffix: "%",
  },
];

export function CostSettingsForm({ settings }: { settings: CostSettingsInput }) {
  const router = useRouter();
  const [values, setValues] = useState<CostSettingsInput>(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rate = hourlyRate(values);
  const overhead = overheadPerUnit(values);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cost-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "No se pudo guardar");
        return;
      }
      setMessage("Guardado. Todos los costos se recalcularon.");
      router.refresh();
    } catch {
      setMessage("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-brand-line bg-white p-5">
      <div>
        <h2 className="font-serif text-lg text-brand-ink">Parámetros del taller</h2>
        <p className="text-xs text-brand-ink-soft">
          Se cargan una vez y se ajustan cuando cambia algo (aumento de la empleada, nuevo gasto fijo).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="text-sm">
            <span className="mb-1 block font-medium text-brand-ink">{f.label}</span>
            <span className="flex items-center gap-1.5">
              {f.prefix && <span className="text-brand-ink-soft">{f.prefix}</span>}
              <input
                type="number"
                min={0}
                step={f.step ?? "1"}
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: Number(e.target.value) }))}
                className="input-field"
              />
              {f.suffix && <span className="text-brand-ink-soft">{f.suffix}</span>}
            </span>
            <span className="mt-1 block text-xs text-brand-ink-soft">{f.help}</span>
          </label>
        ))}
      </div>

      <div className="grid gap-3 rounded-xl bg-brand-sage/10 p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Valor de la hora del taller</p>
          <p className="font-serif text-xl text-brand-ink">{formatPrice(Math.round(rate))} / hora</p>
          <p className="text-xs text-brand-ink-soft">
            (tu sueldo + empleada) ÷ horas productivas. Un producto de 30 min cuesta{" "}
            {formatPrice(Math.round(rate / 2))} de mano de obra.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Gastos fijos por producto</p>
          <p className="font-serif text-xl text-brand-ink">{formatPrice(Math.round(overhead))}</p>
          <p className="text-xs text-brand-ink-soft">
            Cada producto que hacés tiene que absorber esto para que los gastos del mes se paguen.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Guardando..." : "Guardar parámetros"}
        </button>
        {message && <span className="text-sm text-brand-ink-soft">{message}</span>}
      </div>
    </form>
  );
}
