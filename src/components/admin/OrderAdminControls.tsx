"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, Field, Notice, Toggle } from "@/components/admin/ui";

export function OrderAdminControls({
  orderId,
  finalTotal,
  paid,
  adminNotes,
}: {
  orderId: string;
  finalTotal: number | null;
  paid: boolean;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [total, setTotal] = useState(finalTotal === null ? "" : String(finalTotal));
  const [isPaid, setIsPaid] = useState(paid);
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await apiFetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ finalTotal: total === "" ? null : Number(total), paid: isPaid, adminNotes: notes }),
      });
      setMsg({ tone: "success", text: "Guardado." });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-brand-line bg-white p-5">
      <h2 className="font-display text-xl uppercase">Confirmación y cobro</h2>
      <Field label="Precio final confirmado ($)" hint="Cargalo cuando peses el pedido y lo acuerdes por WhatsApp.">
        <input className="input-field" type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="Sin confirmar" />
      </Field>
      <Toggle label="Cobro recibido" hint="Marcalo solo cuando el dinero esté efectivamente acreditado." checked={isPaid} onChange={setIsPaid} />
      <Field label="Notas internas">
        <textarea className="input-field min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <button type="button" onClick={save} disabled={saving} className="btn btn-dark w-full">{saving ? "Guardando…" : "Guardar"}</button>
    </div>
  );
}
