import { formatPrice, formatOrderNumber, formatIsoDate } from "@/lib/format";
import { DELIVERY_LABEL } from "@/lib/order-status";
import type { DeliveryMethod } from "@/generated/prisma/enums";

export type MessageOrder = {
  number: number;
  customerName: string;
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

export function buildWhatsappMessage(order: MessageOrder, businessName: string, trackingUrl?: string) {
  const lines: string[] = [];
  lines.push(`Hola ${businessName}. Quiero solicitar el pedido #${formatOrderNumber(order.number)}.`);
  lines.push(`Nombre: ${order.customerName}.`);
  lines.push(`Modalidad: ${DELIVERY_LABEL[order.deliveryMethod]}.`);
  if (order.deliveryMethod !== "RETIRO") {
    const addr = [order.address, order.neighborhood].filter(Boolean).join(", ");
    if (addr) lines.push(`Dirección: ${addr}.`);
    if (order.zoneName) lines.push(`Zona: ${order.zoneName}.`);
    if (order.reference) lines.push(`Referencias: ${order.reference}.`);
    if (order.mapsLink) lines.push(`Ubicación: ${order.mapsLink}`);
  }
  if (order.deliveryMethod === "EXPRESS") {
    lines.push("Entrega: lo antes posible.");
  } else if (order.requestedDate) {
    lines.push(`${order.deliveryMethod === "RETIRO" ? "Retiro" : "Entrega"}: ${formatIsoDate(order.requestedDate)}${order.timeSlot ? `, ${order.timeSlot} hs` : ""}.`);
  }
  lines.push("");
  lines.push("PRODUCTOS:");
  for (const it of order.items) {
    const detail = it.detail ?? `${it.quantity} ${it.unitLabel}`;
    lines.push(`- ${detail} de ${it.name}: ${formatPrice(it.lineTotal)}${it.estimated ? " (estimado)" : ""}`);
  }
  lines.push("");
  lines.push(`Subtotal estimado: ${formatPrice(order.subtotal)}.`);
  if (order.discount > 0) lines.push(`Descuento${order.couponCode ? ` (${order.couponCode})` : ""}: -${formatPrice(order.discount)}.`);
  if (order.deliveryMethod !== "RETIRO") lines.push(`Envío: ${order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : "sin cargo"}.`);
  lines.push(`Total estimado: ${formatPrice(order.total)}.`);
  if (order.notes) {
    lines.push("");
    lines.push(`Observaciones: ${order.notes}`);
  }
  if (trackingUrl) {
    lines.push("");
    lines.push(`Seguimiento: ${trackingUrl}`);
  }
  lines.push("");
  lines.push("Quedo a la espera de confirmación de disponibilidad, precio final y entrega.");
  return lines.join("\n");
}
