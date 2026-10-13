"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, Field, Notice, Toggle } from "@/components/admin/ui";
import type { BusinessSettings } from "@/lib/settings";

export function DeliverySettingsForm({ settings }: { settings: BusinessSettings }) {
  const router = useRouter();
  const [v, setV] = useState({
    expressEnabled: settings.expressEnabled,
    scheduledEnabled: settings.scheduledEnabled,
    pickupEnabled: settings.pickupEnabled,
    expressTargetMinutes: String(settings.expressTargetMinutes),
    prepTimeMinutes: String(settings.prepTimeMinutes),
    scheduleDaysAhead: String(settings.scheduleDaysAhead),
  });
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await apiFetch("/api/admin/settings", { method: "PATCH", body: JSON.stringify(v) });
      setMsg({ tone: "success", text: "Guardado." });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-line bg-white p-5">
      <h2 className="font-display text-lg uppercase">Modalidades de entrega</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Toggle label="Delivery express" hint="Solo dentro del horario de atención." checked={v.expressEnabled} onChange={(b) => setV({ ...v, expressEnabled: b })} />
        <Toggle label="Delivery programado" checked={v.scheduledEnabled} onChange={(b) => setV({ ...v, scheduledEnabled: b })} />
        <Toggle label="Retiro por local" checked={v.pickupEnabled} onChange={(b) => setV({ ...v, pickupEnabled: b })} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label="Objetivo express (min)" hint="Informativo, no garantizado."><input className="input-field" type="number" value={v.expressTargetMinutes} onChange={(e) => setV({ ...v, expressTargetMinutes: e.target.value })} /></Field>
        <Field label="Tiempo de preparación (min)" hint="Las franjas de hoy que empiecen antes se ocultan."><input className="input-field" type="number" value={v.prepTimeMinutes} onChange={(e) => setV({ ...v, prepTimeMinutes: e.target.value })} /></Field>
        <Field label="Días de anticipación" hint="Hasta cuántos días adelante se puede programar."><input className="input-field" type="number" value={v.scheduleDaysAhead} onChange={(e) => setV({ ...v, scheduleDaysAhead: e.target.value })} /></Field>
      </div>
      {msg && <div className="mt-3"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      <button type="button" onClick={save} disabled={saving} className="btn btn-dark btn-sm mt-4">{saving ? "Guardando…" : "Guardar"}</button>
    </div>
  );
}
