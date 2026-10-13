"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, Field, ImageField, Notice, Toggle } from "@/components/admin/ui";
import { TestEmailButton } from "@/components/admin/TestEmailButton";
import type { BusinessSettings, CalculatorSettings } from "@/lib/settings";

function useSave(url: string) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  async function save(body: unknown) {
    setSaving(true);
    setMsg(null);
    try {
      await apiFetch(url, { method: "PUT", body: JSON.stringify(body) });
      setMsg({ tone: "success", text: "Guardado." });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Error" });
    } finally {
      setSaving(false);
    }
  }
  return { save, saving, msg };
}

export function BusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  const [v, setV] = useState({
    name: settings.name, slogan: settings.slogan, slogan2: settings.slogan2, whatsapp: settings.whatsapp, notificationEmail: settings.notificationEmail, address: settings.address, city: settings.city,
    instagram: settings.instagram ?? "", facebook: settings.facebook ?? "", logoUrl: settings.logoUrl ?? "", heroImageUrl: settings.heroImageUrl ?? "",
    estimateNotice: settings.estimateNotice, policies: settings.policies ?? "",
    expressEnabled: settings.expressEnabled, scheduledEnabled: settings.scheduledEnabled, pickupEnabled: settings.pickupEnabled,
    expressTargetMinutes: settings.expressTargetMinutes, prepTimeMinutes: settings.prepTimeMinutes, scheduleDaysAhead: settings.scheduleDaysAhead,
  });
  const { save, saving, msg } = useSave("/api/admin/settings");
  const set = (k: keyof typeof v, val: string) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(v); }} className="rounded-2xl border border-brand-line bg-white p-5">
      <h2 className="font-display text-xl uppercase">Datos comerciales</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre comercial"><input className="input-field" value={v.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="WhatsApp comercial" hint="Celular argentino con código de área (ej: 343 5123456). Acá llegan los pedidos."><input className="input-field" value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="343 5123456" /></Field>
        <div className="sm:col-span-2">
          <Field label="Correo para avisos de pedidos" hint="Cada nueva solicitud se envía completa a esta casilla. Requiere un proveedor de correo configurado en el servidor (ver README).">
            <input className="input-field" type="email" value={v.notificationEmail} onChange={(e) => set("notificationEmail", e.target.value)} placeholder="pedidos@tunegocio.com" />
          </Field>
          <TestEmailButton />
        </div>
        <Field label="Slogan principal"><input className="input-field" value={v.slogan} onChange={(e) => set("slogan", e.target.value)} /></Field>
        <Field label="Slogan secundario"><input className="input-field" value={v.slogan2} onChange={(e) => set("slogan2", e.target.value)} /></Field>
        <Field label="Dirección del local" hint="Se muestra para retiro por local."><input className="input-field" value={v.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="Ciudad"><input className="input-field" value={v.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Instagram (usuario)"><input className="input-field" value={v.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="entrecortes" /></Field>
        <Field label="Facebook (URL o usuario)"><input className="input-field" value={v.facebook} onChange={(e) => set("facebook", e.target.value)} /></Field>
        <div><ImageField label="Logo (opcional)" value={v.logoUrl} onChange={(u) => set("logoUrl", u)} /></div>
        <div><ImageField label="Imagen principal del inicio" value={v.heroImageUrl} onChange={(u) => set("heroImageUrl", u)} /></div>
        <Field label="Aviso de precios estimados" className="sm:col-span-2"><textarea className="input-field min-h-[70px]" value={v.estimateNotice} onChange={(e) => set("estimateNotice", e.target.value)} /></Field>
        <Field label="Políticas comerciales (opcional)" hint="Texto libre: cambios, cancelaciones, formas de pago acordadas por WhatsApp, etc." className="sm:col-span-2"><textarea className="input-field min-h-[100px]" value={v.policies} onChange={(e) => set("policies", e.target.value)} /></Field>
      </div>
      {msg && <div className="mt-3"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      <button type="submit" disabled={saving} className="btn btn-dark btn-sm mt-4">{saving ? "Guardando…" : "Guardar"}</button>
    </form>
  );
}

export function CalculatorSettingsForm({ settings }: { settings: CalculatorSettings }) {
  const [v, setV] = useState({
    gramsPerAdult: String(settings.gramsPerAdult), childFactor: String(settings.childFactor), lightFactor: String(settings.lightFactor), heavyFactor: String(settings.heavyFactor),
    achuraSharePercent: String(settings.achuraSharePercent), embutidoDiscountGrams: String(settings.embutidoDiscountGrams),
    cutsUpTo4: String(settings.cutsUpTo4), cutsUpTo10: String(settings.cutsUpTo10), cutsOver10: String(settings.cutsOver10),
    minGramsPerPerson: String(settings.minGramsPerPerson), suggestExtras: settings.suggestExtras,
  });
  const { save, saving, msg } = useSave("/api/admin/calculator");
  const set = (k: keyof typeof v, val: string) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(v); }} className="rounded-2xl border border-brand-line bg-white p-5">
      <h2 className="font-display text-xl uppercase">Reglas de la calculadora y del presupuesto</h2>
      <p className="mt-1 text-xs text-brand-ash">Estas reglas definen las recomendaciones. Los productos participan según su rol, nivel, “recomendable” y “sugerido por persona”.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Gramos de carne por adulto" hint="Apetito normal, sin contar hueso."><input className="input-field" type="number" value={v.gramsPerAdult} onChange={(e) => set("gramsPerAdult", e.target.value)} /></Field>
        <Field label="Factor niños" hint="0,5 = la mitad de un adulto."><input className="input-field" type="number" step="0.05" value={v.childFactor} onChange={(e) => set("childFactor", e.target.value)} /></Field>
        <Field label="Factor “comen poco”"><input className="input-field" type="number" step="0.05" value={v.lightFactor} onChange={(e) => set("lightFactor", e.target.value)} /></Field>
        <Field label="Factor “abundante”"><input className="input-field" type="number" step="0.05" value={v.heavyFactor} onChange={(e) => set("heavyFactor", e.target.value)} /></Field>
        <Field label="% del total para achuras"><input className="input-field" type="number" value={v.achuraSharePercent} onChange={(e) => set("achuraSharePercent", e.target.value)} /></Field>
        <Field label="Gramos que descuenta cada embutido"><input className="input-field" type="number" value={v.embutidoDiscountGrams} onChange={(e) => set("embutidoDiscountGrams", e.target.value)} /></Field>
        <Field label="Cortes distintos hasta 4 personas"><input className="input-field" type="number" value={v.cutsUpTo4} onChange={(e) => set("cutsUpTo4", e.target.value)} /></Field>
        <Field label="Cortes distintos hasta 10 personas"><input className="input-field" type="number" value={v.cutsUpTo10} onChange={(e) => set("cutsUpTo10", e.target.value)} /></Field>
        <Field label="Cortes distintos más de 10 personas"><input className="input-field" type="number" value={v.cutsOver10} onChange={(e) => set("cutsOver10", e.target.value)} /></Field>
        <Field label="Mínimo aceptable por persona (g)" hint="Por debajo, el presupuesto se marca como insuficiente."><input className="input-field" type="number" value={v.minGramsPerPerson} onChange={(e) => set("minGramsPerPerson", e.target.value)} /></Field>
        <div className="sm:col-span-2"><Toggle label="Sugerir extras (provoleta, etc.)" hint="Productos con rol EXTRA y cantidad sugerida por persona." checked={v.suggestExtras} onChange={(b) => setV((s) => ({ ...s, suggestExtras: b }))} /></div>
      </div>
      {msg && <div className="mt-3"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      <button type="submit" disabled={saving} className="btn btn-dark btn-sm mt-4">{saving ? "Guardando…" : "Guardar reglas"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const { save, saving, msg } = useSave("/api/admin/password");
  return (
    <form onSubmit={(e) => { e.preventDefault(); save({ currentPassword: current, newPassword: next }); setCurrent(""); setNext(""); }} className="rounded-2xl border border-brand-line bg-white p-5">
      <h2 className="font-display text-xl uppercase">Contraseña del panel</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Contraseña actual"><input className="input-field" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /></Field>
        <Field label="Nueva contraseña" hint="Mínimo 8 caracteres."><input className="input-field" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></Field>
      </div>
      {msg && <div className="mt-3"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      <button type="submit" disabled={saving || !current || next.length < 8} className="btn btn-dark btn-sm mt-4">Cambiar contraseña</button>
    </form>
  );
}
