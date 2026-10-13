import nodemailer from "nodemailer";

/**
 * Envio de correos. Se usa el primer proveedor configurado:
 *  1) Resend:  RESEND_API_KEY  (+ EMAIL_FROM opcional, por defecto onboarding@resend.dev)
 *  2) SMTP:    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (+ EMAIL_FROM opcional). Sirve para Gmail con
 *              "contrasena de aplicacion" (smtp.gmail.com, puerto 465).
 * Si no hay ninguno configurado, no se envia nada y se informa el motivo.
 */
export type EmailMessage = { to: string; subject: string; text: string; html?: string; replyTo?: string };
export type EmailResult = { sent: true; provider: "resend" | "smtp" } | { sent: false; reason: string };

export function emailProvider(): "resend" | "smtp" | null {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  return null;
}

function fromAddress(provider: "resend" | "smtp") {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  if (provider === "resend") return "ENTRE CORTES <onboarding@resend.dev>";
  return `ENTRE CORTES <${process.env.SMTP_USER}>`;
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const provider = emailProvider();
  if (!provider) {
    return { sent: false, reason: "No hay proveedor de correo configurado (RESEND_API_KEY o SMTP_HOST/SMTP_USER/SMTP_PASS)." };
  }
  if (!message.to) return { sent: false, reason: "Sin destinatario." };

  if (provider === "resend") {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress("resend"),
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { sent: false, reason: `Resend respondió ${res.status}: ${body.slice(0, 300)}` };
    }
    return { sent: true, provider: "resend" };
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  try {
    await transport.sendMail({
      from: fromAddress("smtp"),
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
    });
    return { sent: true, provider: "smtp" };
  } catch (err) {
    return { sent: false, reason: `SMTP: ${err instanceof Error ? err.message : String(err)}` };
  }
}
