"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  customerName: string;
  phone: string;
  total: number;
  status: string;
  paymentMethod: string;
  shippingMethod: string;
  createdAt: string;
  items: { productName: string; variantLabel: string | null; quantity: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PREPARING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PREPARING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-zinc-200 text-zinc-600",
};

export function AdminOrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    if (res.ok) router.refresh();
    else alert("No se pudo actualizar el estado");
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-brand-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-brand-ink">
                #{order.id.slice(-8).toUpperCase()} · {order.customerName}
              </p>
              <p className="text-xs text-brand-ink/50">
                {order.phone} · {new Date(order.createdAt).toLocaleString("es-AR")}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>

          <ul className="mt-3 space-y-1 text-sm text-brand-ink/70">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.productName} {item.variantLabel ? `(${item.variantLabel})` : ""} x{item.quantity}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-3">
            <div className="text-sm text-brand-ink/60">
              {order.paymentMethod} · {order.shippingMethod === "ENVIO" ? "Envio" : "Retiro en local"} ·{" "}
              <span className="font-semibold text-brand-ink">{formatPrice(order.total)}</span>
            </div>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              disabled={updatingId === order.id}
              className="input-field text-sm"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
