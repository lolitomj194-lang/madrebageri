import { prisma } from "@/lib/prisma";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

export const revalidate = 0;

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl text-brand-ink mb-6">Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-brand-ink/60">Todavia no hay pedidos.</p>
      ) : (
        <AdminOrdersTable orders={orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() }))} />
      )}
    </div>
  );
}
