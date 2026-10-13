"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS, statusInfo } from "@/lib/order-status";
import { apiFetch } from "@/components/admin/ui";
import type { OrderStatus } from "@/generated/prisma/enums";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const info = statusInfo(status);

  async function change(next: string) {
    if (next === "CANCELADO" && !confirm("¿Marcar el pedido como cancelado?")) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/orders/${orderId}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={status}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${info.tone}`}
      aria-label="Cambiar estado"
    >
      {ORDER_STATUS.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
