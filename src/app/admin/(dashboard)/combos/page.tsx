import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminCombosPage() {
  const combos = await prisma.combo.findMany({ include: { items: { include: { product: true } } }, orderBy: [{ order: "asc" }, { name: "asc" }] });
  return (
    <div>
      <AdminPageHeader title="Combos" subtitle={`${combos.length} combos`} action={<Link href="/admin/combos/nuevo" className="btn btn-primary btn-sm">+ Nuevo combo</Link>} />
      <div className="grid gap-4 md:grid-cols-2">
        {combos.map((c) => (
          <Link key={c.id} href={`/admin/combos/${c.id}`} className={`rounded-2xl border border-brand-line bg-white p-5 transition-shadow hover:shadow-md ${c.active ? "" : "opacity-50"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl uppercase">{c.name}</h2>
                <p className="text-xs text-brand-ash">{c.pricing === "PER_PERSON" ? `Por persona · desde ${c.persons}` : `${c.persons} personas`}{c.featured ? " · destacado" : ""}{c.active ? "" : " · inactivo"}</p>
              </div>
              <p className="font-display text-2xl">{formatPrice(c.price)}{c.pricing === "PER_PERSON" && <span className="text-xs text-brand-ash"> /pers.</span>}</p>
            </div>
            <ul className="mt-3 text-sm text-brand-smoke">
              {c.items.map((it) => <li key={it.id}>· {it.quantity} {it.product.unitLabel} de {it.product.name}</li>)}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
}
