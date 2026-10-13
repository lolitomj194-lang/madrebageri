import { formatPrice, formatOrderNumber, formatDateTime, formatIsoDate } from "@/lib/format";
import { DELIVERY_LABEL } from "@/lib/order-status";
import { formatArPhone, whatsappLink } from "@/lib/whatsapp";
import type { DeliveryMethod } from "@/generated/prisma/enums";

export type EmailOrder = {
  id: string;
  number: number;
  publicToken: string;
  createdAt: Date;
  customerName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address: string | null;
  neighborhood: string | null;
  reference: string | null;
  mapsLink: string | null;
  zoneName?: string | null;
  requestedDate: string | null;
  timeSlot: string | null;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode: string | null;
  total: number;
  items: { name: string; detail: string | null; quantity: number; unitLabel: string; lineTotal: number; estimated: boolean }[];
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Asunto, texto plano y HTML del aviso interno de nueva solicitud. */
export function buildOrderEmail(order: EmailOrder, businessName: string, baseUrl: string) {
  const num = formatOrderNumber(order.number);
  const adminUrl = `${baseUrl}/admin/pedidos/${order.id}`;
  const trackingUrl = `${baseUrl}/pedido/${order.publicToken}`;
  const chatUrl = whatsappLink(order.phone);
  const subject = `Nuevo pedido #${num} · ${order.customerName} · ${formatPrice(order.total)} (${DELIVERY_LABEL[order.deliveryMethod]})`;

  const delivery: string[] = [DELIVERY_LABEL[order.deliveryMethod]];
  if (order.deliveryMethod !== "RETIRO") {
    const addr = [order.address, order.neighborhood].filter(Boolean).join(", ");
    if (addr) delivery.push(`Dirección: ${addr}`);
    if (order.zoneName) delivery.push(`Zona: ${order.zoneName}`);
    if (order.reference) delivery.push(`Referencias: ${order.reference}`);
    if (order.mapsLink) delivery.push(`Ubicación: ${order.mapsLink}`);
  }
  if (order.deliveryMethod === "EXPRESS") delivery.push("Entrega: lo antes posible (sujeta a confirmación)");
  else if (order.requestedDate) delivery.push(`${order.deliveryMethod === "RETIRO" ? "Retiro" : "Entrega"}: ${formatIsoDate(order.requestedDate)}${order.timeSlot ? `, ${order.timeSlot} hs` : ""}`);

  const itemLines = order.items.map((it) => `- ${it.detail ?? `${it.quantity} ${it.unitLabel}`} de ${it.name}: ${formatPrice(it.lineTotal)}${it.estimated ? " (estimado)" : ""}`);
  const totals: string[] = [`Subtotal estimado: ${formatPrice(order.subtotal)}`];
  if (order.discount > 0) totals.push(`Descuento${order.couponCode ? ` (${order.couponCode})` : ""}: -${formatPrice(order.discount)}`);
  if (order.deliveryMethod !== "RETIRO") totals.push(`Envío: ${order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : "sin cargo"}`);
  totals.push(`TOTAL ESTIMADO: ${formatPrice(order.total)}`);

  const text = [
    `${businessName} — Nueva solicitud de pedido #${num}`,
    `Recibida el ${formatDateTime(order.createdAt)}`,
    "",
    `CLIENTE: ${order.customerName}`,
    `WhatsApp: ${formatArPhone(order.phone)} — ${chatUrl}`,
    "",
    "ENTREGA:",
    ...delivery.map((d) => `  ${d}`),
    "",
    "PRODUCTOS:",
    ...itemLines,
    "",
    ...totals,
    ...(order.notes ? ["", `Observaciones del cliente: ${order.notes}`] : []),
    "",
    `Gestionar en el panel: ${adminUrl}`,
    `Seguimiento del cliente: ${trackingUrl}`,
    "",
    "El pedido queda como SOLICITUD RECIBIDA hasta que lo confirmes con el cliente por WhatsApp.",
  ].join("\n");

  const row = (l: string, r: string, strong = false) =>
    `<tr><td style="padding:6px 0;color:#444">${esc(l)}</td><td style="padding:6px 0;text-align:right;${strong ? "font-weight:700;font-size:18px" : ""}">${esc(r)}</td></tr>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f8f5ef;font-family:Arial,Helvetica,sans-serif;color:#171717">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#171717;color:#f8f5ef;padding:20px 24px;border-radius:14px 14px 0 0">
      <div style="font-size:12px;letter-spacing:3px;color:#d9483b">${esc(businessName.toUpperCase())}</div>
      <div style="font-size:24px;font-weight:700;margin-top:4px">Nuevo pedido #${esc(num)}</div>
      <div style="font-size:13px;color:#bbb;margin-top:4px">Recibido el ${esc(formatDateTime(order.createdAt))} · ${esc(DELIVERY_LABEL[order.deliveryMethod])}</div>
    </div>
    <div style="background:#fff;padding:24px;border:1px solid #e4ddd0;border-top:0;border-radius:0 0 14px 14px">
      <h3 style="margin:0 0 6px;font-size:14px;letter-spacing:2px;color:#6b6762">CLIENTE</h3>
      <p style="margin:0 0 16px"><strong>${esc(order.customerName)}</strong><br>WhatsApp: <a href="${chatUrl}" style="color:#b83227">${esc(formatArPhone(order.phone))}</a></p>
      <h3 style="margin:0 0 6px;font-size:14px;letter-spacing:2px;color:#6b6762">ENTREGA</h3>
      <p style="margin:0 0 16px">${delivery.map(esc).join("<br>")}</p>
      <h3 style="margin:0 0 6px;font-size:14px;letter-spacing:2px;color:#6b6762">PRODUCTOS</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${order.items.map((it) => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee"><strong>${esc(it.name)}</strong><br><span style="color:#6b6762;font-size:12px">${esc(it.detail ?? `${it.quantity} ${it.unitLabel}`)}</span></td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${esc(formatPrice(it.lineTotal))}${it.estimated ? ' <span style="color:#6b6762;font-size:11px">est.</span>' : ""}</td></tr>`).join("")}
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px">
        ${row("Subtotal estimado", formatPrice(order.subtotal))}
        ${order.discount > 0 ? row(`Descuento${order.couponCode ? ` (${order.couponCode})` : ""}`, `-${formatPrice(order.discount)}`) : ""}
        ${order.deliveryMethod !== "RETIRO" ? row("Envío", order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : "sin cargo") : ""}
        ${row("Total estimado", formatPrice(order.total), true)}
      </table>
      ${order.notes ? `<p style="margin:16px 0 0;padding:12px;background:#f8f5ef;border-radius:10px;font-size:14px"><strong>Observaciones:</strong> ${esc(order.notes)}</p>` : ""}
      <div style="margin-top:24px">
        <a href="${adminUrl}" style="display:inline-block;background:#b83227;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:1px">GESTIONAR EN EL PANEL</a>
        &nbsp;
        <a href="${chatUrl}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:1px">ABRIR WHATSAPP</a>
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:#6b6762">El pedido queda como <strong>Solicitud recibida</strong> hasta que lo confirmes con el cliente. Seguimiento del cliente: <a href="${trackingUrl}" style="color:#b83227">${esc(trackingUrl)}</a></p>
    </div>
  </div></body></html>`;

  return { subject, text, html };
}
