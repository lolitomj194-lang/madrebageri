import type { OrderStatus, DeliveryMethod } from "@/generated/prisma/enums";

export const ORDER_STATUS: { value: OrderStatus; label: string; description: string; tone: string }[] = [
  { value: "SOLICITADA", label: "Solicitud recibida", description: "Recibimos tu solicitud. Todavía no está confirmada.", tone: "bg-slate-100 text-slate-700" },
  { value: "PENDIENTE_CONTACTO", label: "Pendiente de contacto", description: "Te vamos a escribir por WhatsApp para confirmar.", tone: "bg-amber-100 text-amber-800" },
  { value: "PENDIENTE_CONFIRMACION", label: "Pendiente de confirmación", description: "Estamos esperando tu confirmación por WhatsApp.", tone: "bg-amber-100 text-amber-800" },
  { value: "CONFIRMADO", label: "Confirmado", description: "Pedido confirmado con precio final y entrega acordada.", tone: "bg-emerald-100 text-emerald-800" },
  { value: "EN_PREPARACION", label: "En preparación", description: "Estamos preparando tus cortes.", tone: "bg-blue-100 text-blue-800" },
  { value: "LISTO_PARA_RETIRAR", label: "Listo para retirar", description: "Tu pedido te espera en el local.", tone: "bg-indigo-100 text-indigo-800" },
  { value: "EN_REPARTO", label: "En reparto", description: "Tu pedido está en camino.", tone: "bg-indigo-100 text-indigo-800" },
  { value: "ENTREGADO", label: "Entregado", description: "¡Que lo disfrutes! Gracias por elegirnos.", tone: "bg-emerald-200 text-emerald-900" },
  { value: "CANCELADO", label: "Cancelado", description: "El pedido fue cancelado.", tone: "bg-red-100 text-red-800" },
];

export function statusInfo(status: OrderStatus) {
  return ORDER_STATUS.find((s) => s.value === status) ?? ORDER_STATUS[0];
}

/** Orden de progreso para la linea de tiempo del seguimiento (segun modalidad). */
export function statusTimeline(method: DeliveryMethod): OrderStatus[] {
  const base: OrderStatus[] = ["SOLICITADA", "CONFIRMADO", "EN_PREPARACION"];
  if (method === "RETIRO") return [...base, "LISTO_PARA_RETIRAR", "ENTREGADO"];
  return [...base, "EN_REPARTO", "ENTREGADO"];
}

export const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  EXPRESS: "Delivery express",
  PROGRAMADO: "Delivery programado",
  RETIRO: "Retiro por local",
};

export const ACTIVE_STATUSES: OrderStatus[] = [
  "SOLICITADA",
  "PENDIENTE_CONTACTO",
  "PENDIENTE_CONFIRMACION",
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO_PARA_RETIRAR",
  "EN_REPARTO",
];
