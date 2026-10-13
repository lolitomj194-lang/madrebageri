"use client";

import { useState } from "react";
import { apiFetch } from "@/components/admin/ui";

export function TestEmailButton() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function send() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await apiFetch<{ to: string; provider: string }>("/api/admin/test-email", { method: "POST" });
      setMsg(`Correo de prueba enviado a ${r.to} (vía ${r.provider}). Revisá la bandeja y el spam.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-2">
      <button type="button" onClick={send} disabled={busy} className="btn btn-outline btn-sm">{busy ? "Enviando…" : "Enviar correo de prueba"}</button>
      {msg && <p className="mt-2 text-xs text-brand-smoke">{msg}</p>}
    </div>
  );
}
