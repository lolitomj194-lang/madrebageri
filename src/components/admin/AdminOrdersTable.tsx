"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS, SHIPPING_LABELS } from "@/lib/order-types";

type OrderRow = {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  shippingMethod: string;
  paymentMethod: string;
  status: string;
  isWholesale: boolean;
  total: number;
  notes: string | null;
  createdAt: string | Date;
  items: {
    id: string;
    productName: string;
    variantLabel: string | null;
    quantity: number;
    unitPrice: number;
    isWholesale: boolean;
  }[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  PREPARING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-brand-sage/20 text-brand-sage-dark",
  CANCELLED: "bg-red-100 text-red-700",
};

export function AdminOrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: string) {
    if (
      status === "CANCELLED" &&
      !confirm("¿Cancelar el pedido? El stock reservado vuelve a estar disponible.")
    ) {
      return;
    }
    setBusy(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "No se pudo actualizar");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-brand-line bg-white p-8 text-center text-sm text-brand-ink-soft">
        Todavía no hay pedidos.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isOpen = expanded === order.id;
        const shortId = order.id.slice(-6).toUpperCase();
        return (
          <div key={order.id} className="rounded-2xl border border-brand-line bg-white">
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left"
            >
              <span className="font-mono text-xs text-brand-ink-soft">#{shortId}</span>
              <span className="font-semibold text-brand-ink">{order.customerName}</span>
              {order.isWholesale && (
                <span className="rounded-full bg-brand-sage/15 px-2 py-0.5 text-xs font-semibold text-brand-sage-dark">
                  Mayorista
                </span>
              )}
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] ?? ""}`}
              >
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="ml-auto font-semibold text-brand-ink">{formatPrice(order.total)}</span>
              <span className="text-xs text-brand-ink-soft">
                {new Date(order.createdAt).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </button>

            {isOpen && (
              <div className="space-y-4 border-t border-brand-line px-4 py-4 text-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-semibold text-brand-ink">Cliente</p>
                    <p>{order.customerName}</p>
                    <p>
                      <a
                        href={`https://wa.me/${order.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-terracotta underline"
                      >
                        {order.phone}
                      </a>
                    </p>
                    {order.email && <p>{order.email}</p>}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-brand-ink">Entrega y pago</p>
                    <p>{SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod}</p>
                    {order.address && (
                      <p>
                        {order.address}, {order.city}, {order.province}
                        {order.postalCode && ` (CP ${order.postalCode})`}
                      </p>
                    )}
                    <p>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1 font-semibold text-brand-ink">Productos</p>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-2">
                        <span>
                          {item.quantity}× {item.productName}
                          {item.variantLabel && (
                            <span className="text-brand-ink-soft"> ({item.variantLabel})</span>
                          )}
                          {item.isWholesale && (
                            <span className="ml-1 text-xs text-brand-sage-dark">mayorista</span>
                          )}
                        </span>
                        <span className="shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.notes && (
                  <div>
                    <p className="font-semibold text-brand-ink">Notas</p>
                    <p className="whitespace-pre-line text-brand-ink-soft">{order.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-brand-line pt-3">
                  <span className="text-xs text-brand-ink-soft">Cambiar estado:</span>
                  {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(order.id, status)}
                      disabled={busy === order.id || order.status === status}
                      className={`rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-40 ${
                        order.status === status
                          ? "border-brand-ink bg-brand-ink text-white"
                          : "border-brand-line hover:border-brand-terracotta"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
