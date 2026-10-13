import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/format";
import { whatsappLink, formatArPhone } from "@/lib/whatsapp";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, select: { phone: true, customerName: true, total: true, finalTotal: true, status: true, createdAt: true } });
  const map = new Map<string, { name: string; count: number; total: number; last: Date; cancelled: number }>();
  for (const o of orders) {
    const entry = map.get(o.phone) ?? { name: o.customerName, count: 0, total: 0, last: o.createdAt, cancelled: 0 };
    entry.count += 1;
    if (o.status === "CANCELADO") entry.cancelled += 1;
    else entry.total += o.finalTotal ?? o.total;
    if (o.createdAt > entry.last) entry.last = o.createdAt;
    map.set(o.phone, entry);
  }
  const customers = [...map.entries()].sort((a, b) => b[1].last.getTime() - a[1].last.getTime());

  return (
    <div>
      <AdminPageHeader title="Clientes" subtitle={`${customers.length} clientes (agrupados por WhatsApp). No requieren registro.`} />
      <div className="overflow-x-auto rounded-2xl border border-brand-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brand-cream text-left text-xs uppercase tracking-wider text-brand-ash">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">Total (no cancelados)</th>
              <th className="px-4 py-3">Último pedido</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {customers.map(([phone, c]) => (
              <tr key={phone}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3"><a href={whatsappLink(phone)} target="_blank" rel="noopener noreferrer" className="text-brand-whatsapp hover:underline">{formatArPhone(phone)}</a></td>
                <td className="px-4 py-3">{c.count}{c.cancelled > 0 && <span className="text-xs text-brand-ash"> ({c.cancelled} cancelados)</span>}</td>
                <td className="px-4 py-3">{formatPrice(c.total)}</td>
                <td className="px-4 py-3 text-brand-ash">{formatDateTime(c.last)}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/pedidos?telefono=${phone}`} className="text-xs font-semibold uppercase tracking-wider text-brand-ember hover:underline">Ver pedidos</Link></td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-brand-ash">Todavía no hay clientes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
