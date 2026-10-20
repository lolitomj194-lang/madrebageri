import { prisma } from "@/lib/prisma";
import { CustomersManager } from "@/components/admin/CustomersManager";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        where: { status: { not: "CANCELLED" } },
        select: { total: true, status: true, channel: true, createdAt: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const rows = customers.map((c) => {
    const totalBought = c.orders.reduce((sum, o) => sum + o.total, 0);
    const owed = c.orders
      .filter((o) => o.status === "PENDING" && o.channel !== "WEB")
      .reduce((sum, o) => sum + o.total, 0);
    const lastOrderAt = c.orders.reduce<Date | null>(
      (latest, o) => (!latest || o.createdAt > latest ? o.createdAt : latest),
      null
    );
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      city: c.city,
      isWholesale: c.isWholesale,
      notes: c.notes,
      ordersCount: c.orders.length,
      totalBought,
      owed,
      lastOrderAt,
    };
  });

  const totalOwed = rows.reduce((sum, r) => sum + r.owed, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-brand-ink">Clientes</h1>
          <p className="text-sm text-brand-ink-soft">
            Locales mayoristas y clientes frecuentes, con su historial y lo que tienen pendiente de pago.
          </p>
        </div>
        {totalOwed > 0 && (
          <p className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800">
            Te deben en total: ${totalOwed.toLocaleString("es-AR")}
          </p>
        )}
      </div>
      <CustomersManager customers={rows} />
    </div>
  );
}
