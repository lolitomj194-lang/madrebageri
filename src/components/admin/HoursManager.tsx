"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, Notice } from "@/components/admin/ui";
import { DAY_NAMES } from "@/lib/hours";

export type HourRow = { dayOfWeek: number; open: boolean; openTime: string; closeTime: string; slotMinutes: number; slotCapacity: number };
export type ClosedRow = { id: string; date: string; reason: string | null };

export function HoursManager({ hours, closed }: { hours: HourRow[]; closed: ClosedRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<HourRow[]>([1, 2, 3, 4, 5, 6, 0].map((d) => hours.find((h) => h.dayOfWeek === d) ?? { dayOfWeek: d, open: false, openTime: "18:00", closeTime: "23:00", slotMinutes: 60, slotCapacity: 6 }));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  function update(dow: number, patch: Partial<HourRow>) {
    setRows((r) => r.map((h) => (h.dayOfWeek === dow ? { ...h, ...patch } : h)));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await apiFetch("/api/admin/hours", { method: "PUT", body: JSON.stringify({ hours: rows }) });
      setMsg({ tone: "success", text: "Horarios guardados." });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Error" });
    } finally {
      setSaving(false);
    }
  }

  async function addClosed(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch("/api/admin/closed-dates", { method: "POST", body: JSON.stringify({ date: newDate, reason: newReason }) });
      setNewDate("");
      setNewReason("");
      router.refresh();
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Error" });
    }
  }

  async function removeClosed(id: string) {
    await apiFetch("/api/admin/closed-dates", { method: "DELETE", body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-brand-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brand-cream text-left text-xs uppercase tracking-wider text-brand-ash">
            <tr>
              <th className="px-4 py-3">Día</th>
              <th className="px-4 py-3">Abierto</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3">Hasta</th>
              <th className="px-4 py-3">Franja (min)</th>
              <th className="px-4 py-3">Cupo por franja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {rows.map((h) => (
              <tr key={h.dayOfWeek} className={h.open ? "" : "opacity-60"}>
                <td className="px-4 py-2 font-medium">{DAY_NAMES[h.dayOfWeek]}</td>
                <td className="px-4 py-2"><input type="checkbox" checked={h.open} onChange={(e) => update(h.dayOfWeek, { open: e.target.checked })} className="h-4 w-4 accent-brand-ember" /></td>
                <td className="px-4 py-2"><input type="time" className="input-field max-w-[120px]" value={h.openTime} onChange={(e) => update(h.dayOfWeek, { openTime: e.target.value })} disabled={!h.open} /></td>
                <td className="px-4 py-2"><input type="time" className="input-field max-w-[120px]" value={h.closeTime} onChange={(e) => update(h.dayOfWeek, { closeTime: e.target.value })} disabled={!h.open} /></td>
                <td className="px-4 py-2"><input type="number" min={15} step={15} className="input-field max-w-[90px]" value={h.slotMinutes} onChange={(e) => update(h.dayOfWeek, { slotMinutes: Number(e.target.value) })} disabled={!h.open} /></td>
                <td className="px-4 py-2"><input type="number" min={1} className="input-field max-w-[90px]" value={h.slotCapacity} onChange={(e) => update(h.dayOfWeek, { slotCapacity: Number(e.target.value) })} disabled={!h.open} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between gap-3 border-t border-brand-line p-4">
          <p className="text-xs text-brand-ash">Las franjas se generan automáticamente entre apertura y cierre. El cupo limita los pedidos programados por franja.</p>
          <button type="button" onClick={save} disabled={saving} className="btn btn-dark btn-sm">{saving ? "Guardando…" : "Guardar horarios"}</button>
        </div>
      </div>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <div className="rounded-2xl border border-brand-line bg-white p-5">
        <h2 className="font-display text-lg uppercase">Cierres excepcionales y feriados</h2>
        <ul className="mt-3 divide-y divide-brand-line text-sm">
          {closed.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2">
              <span>{c.date}{c.reason ? ` · ${c.reason}` : ""}</span>
              <button type="button" className="text-xs text-brand-ember underline" onClick={() => removeClosed(c.id)}>Quitar</button>
            </li>
          ))}
          {closed.length === 0 && <li className="py-2 text-brand-ash">Sin cierres cargados.</li>}
        </ul>
        <form onSubmit={addClosed} className="mt-3 flex flex-wrap gap-2">
          <input type="date" className="input-field max-w-[180px]" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
          <input className="input-field max-w-xs" placeholder="Motivo (opcional)" value={newReason} onChange={(e) => setNewReason(e.target.value)} />
          <button type="submit" className="btn btn-outline btn-sm">Agregar cierre</button>
        </form>
      </div>
    </div>
  );
}
