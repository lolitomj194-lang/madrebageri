import { NextResponse } from "next/server";
import { getBusinessSettings } from "@/lib/settings";
import { sendEmail, emailProvider } from "@/lib/email";

/** Envia un correo de prueba a la direccion de avisos configurada. */
export async function POST() {
  const settings = await getBusinessSettings();
  if (!settings.notificationEmail) {
    return NextResponse.json({ error: "Primero cargá y guardá el correo de avisos." }, { status: 400 });
  }
  if (!emailProvider()) {
    return NextResponse.json(
      { error: "No hay proveedor de correo configurado. Agregá RESEND_API_KEY o SMTP_HOST/SMTP_USER/SMTP_PASS en las variables de entorno del servidor (ver README)." },
      { status: 503 }
    );
  }
  const result = await sendEmail({
    to: settings.notificationEmail,
    subject: `${settings.name} · correo de prueba`,
    text: `Este es un correo de prueba de ${settings.name}. Si lo recibiste, los avisos de nuevos pedidos van a llegar a esta casilla.`,
    html: `<p>Este es un correo de prueba de <strong>${settings.name}</strong>.</p><p>Si lo recibiste, los avisos de nuevos pedidos van a llegar a esta casilla.</p>`,
  });
  if (!result.sent) return NextResponse.json({ error: result.reason }, { status: 502 });
  return NextResponse.json({ ok: true, provider: result.provider, to: settings.notificationEmail });
}
