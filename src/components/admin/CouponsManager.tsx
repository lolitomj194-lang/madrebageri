"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, Field, Notice, Toggle } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";

export type CouponRow = {
  id: string; code: string; description: string | null; type: "PERCENT" | "FIXED"; value: number; minTotal: number;
  validFrom: string | null; validTo: string | null; maxUses: number | null; usedCount: number; active: boolean;
};
type Draft = { code: string; description: string; type: "PERCENT" | "FIXED"; value: string; minTotal: string; validFrom: string; validTo: string; maxUses: string; active: boolean };
const empty: Draft = { code: "", description: "", type: "PERCENT", value: "", minTotal: "0", validFrom: "", validTo: "", maxUses: "", active: true };
const toDraft = (c: CouponRow): Draft => ({
  code: c.code, description: c.description ?? "", type: c.type, value: String(c.value), minTotal: String(c.minTotal),
  validFrom: c.validFrom ? c.validFrom.slice(0, 10) : "", validTo: c.validTo ? c.validTo.slice(0, 10) : "", maxUses: c.maxUses ? String(c.maxUses) : "", active: c.active,
});

function CouponForm({ draft, onChange, onSubmit, onCancel, submitLabel }: { draft: Draft; onChange: (d: Draft) => void; onSubmit: () => void; onCancel?: () => void; submitLabel: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Código"><input className="input-field uppercase" value={draft.code} onChange={(e) => onChange({ ...draft, code: e.target.value.toUpperCase() })} /></Field>
      <Field label="Descripción" className="lg:col-span-3"><input className="input-field" value={draft.description} onChange={(e) => onChange({ ...draft, description: e.target.value })} /></Field>
      <Field label="Tipo">
        <select className="input-field" value={draft.type} onChange={(e) => onChange({ ...draft, type: e.target.value as "PERCENT" | "FIXED" })}>
          <option value="PERCENT">Porcentaje</option>
          <option value="FIXED">Monto fijo</option>
        </select>
      </Field>
      <Field label={draft.type === "PERCENT" ? "Porcentaje (%)" : "Monto ($)"}><input className="input-field" type="number" value={draft.value} onChange={(e) => onChange({ ...draft, value: e.target.value })} /></Field>
      <Field label="Compra mínima ($)"><input className="input-field" type="number" value={draft.minTotal} onChange={(e) => onChange({ ...draft, minTotal: e.target.value })} /></Field>
      <Field label="Usos máximos" hint="Vacío = ilimitado."><input className="input-field" type="number" value={draft.maxUses} onChange={(e) => onChange({ ...draft, maxUses: e.target.value })} /></Field>
      <Field label="Vigente desde"><input className="input-field" type="date" value={draft.validFrom} onChange={(e) => onChange({ ...draft, validFrom: e.target.value })} /></Field>
      <Field label="Vigente hasta"><input className="input-field" type="date" value={draft.validTo} onChange={(e) => onChange({ ...draft, validTo: e.target.value })} /></Field>
      <div className="sm:col-span-2"><Toggle label="Cupón activo" checked={draft.active} onChange={(b) => onChange({ ...draft, active: b })} /></div>
      <div className="flex items-end gap-2 lg:col-span-4">
        <button type="button" className="btn btn-dark btn-sm" onClick={onSubmit}>{submitLabel}</button>
        {onCancel && <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>Cancelar</button>}
      </div>
    </div>
  );
}

export function CouponsManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(empty);
  const [editing, setEditing] = useState<{ id: string; draft: Draft } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="space-y-6">
      {error && <Notice tone="error">{error}</Notice>}
      <div className="space-y-3">
        {coupons.map((c) => (
          <div key={c.id} className={`rounded-2xl border border-brand-line bg-white p-5 ${c.active ? "" : "opacity-60"}`}>
            {editing?.id === c.id ? (
              <CouponForm draft={editing.draft} onChange={(d) => setEditing({ id: c.id, draft: d })} submitLabel="Guardar" onCancel={() => setEditing(null)}
                onSubmit={() => run(async () => { await apiFetch(`/api/admin/coupons/${c.id}`, { method: "PUT", body: JSON.stringify(editing.draft) }); setEditing(null); })} />
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg uppercase">{c.code} {!c.active && <span className="badge bg-slate-100 text-slate-600">Inactivo</span>}</p>
                  <p className="text-sm">{c.type === "PERCENT" ? `${c.value}% de descuento` : `${formatPrice(c.value)} de descuento`}{c.minTotal > 0 ? ` · mínimo ${formatPrice(c.minTotal)}` : ""}</p>
                  <p className="text-xs text-brand-ash">
                    {c.description}{c.description ? " · " : ""}Usos: {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                    {c.validFrom ? ` · desde ${c.validFrom.slice(0, 10)}` : ""}{c.validTo ? ` · hasta ${c.validTo.slice(0, 10)}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing({ id: c.id, draft: toDraft(c) })}>Editar</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => confirm(`¿Eliminar el cupón ${c.code}?`) && run(() => apiFetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" }))}>Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {coupons.length === 0 && <p className="text-sm text-brand-ash">No hay cupones.</p>}
      </div>
      <div className="rounded-2xl border border-dashed border-brand-line bg-white p-5">
        <h2 className="mb-3 font-display text-lg uppercase">Nuevo cupón</h2>
        <CouponForm draft={draft} onChange={setDraft} submitLabel="Crear cupón" onSubmit={() => run(async () => { await apiFetch("/api/admin/coupons", { method: "POST", body: JSON.stringify(draft) }); setDraft(empty); })} />
      </div>
    </div>
  );
}
