import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { CHANNEL_LABELS } from "@/lib/order-types";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const CHANNELS = Object.keys(CHANNEL_LABELS);

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ canal?: string; cobro?: string }>;
}) {
  const params = await searchParams;
  const channel = params.canal && CHANNELS.includes(params.canal) ? params.canal : undefined;
  const onlyToCollect = params.cobro === "pendiente";

  const where: Prisma.OrderWhereInput = {};
  if (channel) where.channel = channel as Prisma.OrderWhereInput["channel"];
  if (onlyToCollect) {
    where.status = "PENDING";
    where.channel = channel ? where.channel : { not: "WEB" };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const sold = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "PENDING");
  const soldTotal = sold.reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === "PENDING" && o.channel !== "WEB");
  const pendingTotal = pending.reduce((sum, o) => sum + o.total, 0);

  const filterLink = (next: { canal?: string; cobro?: string }) => {
    const q = new URLSearchParams();
    const canal = "canal" in next ? next.canal : channel;
    const cobro = "cobro" in next ? next.cobro : onlyToCollect ? "pendiente" : undefined;
    if (canal) q.set("canal", canal);
    if (cobro) q.set("cobro", cobro);
    const s = q.toString();
    return `/admin/ventas${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-brand-ink">Ventas</h1>
        <Link href="/admin/ventas/nueva" className="btn-primary">
          + Registrar venta
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={filterLink({ canal: undefined })}
          className={`rounded-full border px-3 py-1.5 ${!channel ? "border-brand-ink bg-brand-ink text-white" : "border-brand-line bg-white"}`}
        >
          Todos los canales
        </Link>
        {CHANNELS.map((c) => (
          <Link
            key={c}
            href={filterLink({ canal: c })}
            className={`rounded-full border px-3 py-1.5 ${channel === c ? "border-brand-ink bg-brand-ink text-white" : "border-brand-line bg-white"}`}
          >
            {CHANNEL_LABELS[c]}
          </Link>
        ))}
        <Link
          href={filterLink({ cobro: onlyToCollect ? undefined : "pendiente" })}
          className={`ml-auto rounded-full border px-3 py-1.5 ${onlyToCollect ? "border-amber-600 bg-amber-100 text-amber-800" : "border-brand-line bg-white"}`}
        >
          Solo a cobrar
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-line bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Ventas listadas</p>
          <p className="font-serif text-xl text-brand-ink">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-brand-line bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Cobrado</p>
          <p className="font-serif text-xl text-brand-ink">{formatPrice(soldTotal)}</p>
        </div>
        <div className="rounded-2xl border border-brand-line bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">A cobrar</p>
          <p className="font-serif text-xl text-amber-700">{formatPrice(pendingTotal)}</p>
        </div>
      </div>

      <AdminOrdersTable orders={orders} />
    </div>
  );
}
