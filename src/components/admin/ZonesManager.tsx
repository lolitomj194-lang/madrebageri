"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, Field, Notice, Toggle } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";

export type ZoneRow = { id: string; name: string; neighborhoods: string | null; fee: number; minOrder: number; freeShippingFrom: number | null; active: boolean; order: number };

type Draft = { name: string; neighborhoods: string; fee: string; minOrder: string; freeShippingFrom: string; active: boolean; order: string };
const empty: Draft = { name: "", neighborhoods: "", fee: "0", minOrder: "0", freeShippingFrom: "", active: true, order: "0" };

function toDraft(z: ZoneRow): Draft {
  return { name: z.name, neighborhoods: z.neighborhoods ?? "", fee: String(z.fee), minOrder: String(z.minOrder), freeShippingFrom: z.freeShippingFrom ? String(z.freeShippingFrom) : "", active: z.active, order: String(z.order) };
}

function ZoneForm({ draft, onChange, onSubmit, onCancel, submitLabel }: { draft: Draft; onChange: (d: Draft) => void; onSubmit: () => void; onCancel?: () => void; submitLabel: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Nombre de la zona"><input className="input-field" value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} /></Field>
      <Field label="Barrios (separados por coma)" className="sm:col-span-2"><input className="input-field" value={draft.neighborhoods} onChange={(e) => onChange({ ...draft, neighborhoods: e.target.value })} /></Field>
      <Field label="Costo de envío ($)"><input className="input-field" type="number" value={draft.fee} onChange={(e) => onChange({ ...draft, fee: e.target.value })} /></Field>
      <Field label="Compra mínima ($)"><input className="input-field" type="number" value={draft.minOrder} onChange={(e) => onChange({ ...draft, minOrder: e.target.value })} /></Field>
      <Field label="Envío gratis desde ($)" hint="Vacío = nunca."><input className="input-field" type="number" value={draft.freeShippingFrom} onChange={(e) => onChange({ ...draft, freeShippingFrom: e.target.value })} /></Field>
      <Field label="Orden"><input className="input-field" type="number" value={draft.order} onChange={(e) => onChange({ ...draft, order: e.target.value })} /></Field>
      <div className="sm:col-span-2"><Toggle label="Zona habilitada" hint="Desactivala temporalmente si no estás repartiendo ahí." checked={draft.active} onChange={(b) => onChange({ ...draft, active: b })} /></div>
      <div className="flex items-end gap-2 lg:col-span-3">
        <button type="button" className="btn btn-dark btn-sm" onClick={onSubmit}>{submitLabel}</button>
        {onCancel && <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>Cancelar</button>}
      </div>
    </div>
  );
}

export function ZonesManager({ zones }: { zones: ZoneRow[] }) {
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
        {zones.map((z) => (
          <div key={z.id} className={`rounded-2xl border border-brand-line bg-white p-5 ${z.active ? "" : "opacity-60"}`}>
            {editing?.id === z.id ? (
              <ZoneForm
                draft={editing.draft}
                onChange={(d) => setEditing({ id: z.id, draft: d })}
                submitLabel="Guardar"
                onCancel={() => setEditing(null)}
                onSubmit={() => run(async () => { await apiFetch(`/api/admin/zones/${z.id}`, { method: "PUT", body: JSON.stringify(editing.draft) }); setEditing(null); })}
              />
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg uppercase">{z.name} {!z.active && <span className="badge bg-slate-100 text-slate-600">Deshabilitada</span>}</p>
                  {z.neighborhoods && <p className="text-xs text-brand-ash">{z.neighborhoods}</p>}
                  <p className="mt-1 text-sm">
                    Envío {formatPrice(z.fee)} · mínimo {formatPrice(z.minOrder)}{z.freeShippingFrom ? ` · gratis desde ${formatPrice(z.freeShippingFrom)}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing({ id: z.id, draft: toDraft(z) })}>Editar</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => confirm(`¿Eliminar la zona ${z.name}?`) && run(() => apiFetch(`/api/admin/zones/${z.id}`, { method: "DELETE" }))}>Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {zones.length === 0 && <p className="text-sm text-brand-ash">No hay zonas cargadas. Sin zonas activas solo se podrá elegir retiro por local.</p>}
      </div>
      <div className="rounded-2xl border border-dashed border-brand-line bg-white p-5">
        <h2 className="mb-3 font-display text-lg uppercase">Nueva zona</h2>
        <ZoneForm draft={draft} onChange={setDraft} submitLabel="Agregar zona" onSubmit={() => run(async () => { await apiFetch("/api/admin/zones", { method: "POST", body: JSON.stringify(draft) }); setDraft(empty); })} />
      </div>
    </div>
  );
}
