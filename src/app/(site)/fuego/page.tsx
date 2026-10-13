import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toClientProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Todo para el fuego · Leña, carbón y accesorios",
  description: "Leña, carbón, prendefácil, sal parrillera, chimichurri y salsa criolla a domicilio en Paraná.",
};

export default async function FirePage() {
  const products = await prisma.product.findMany({
    where: { active: true, role: { in: ["FUEGO", "ACCESORIO", "EXTRA"] } },
    include: { category: true },
    orderBy: [{ role: "asc" }, { order: "asc" }],
  });
  const fire = products.filter((p) => p.role === "FUEGO");
  const rest = products.filter((p) => p.role !== "FUEGO");

  return (
    <div>
      <section className="bg-grill text-brand-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow text-brand-ember-light">Todo para el fuego</p>
            <h1 className="section-title mt-2 text-5xl sm:text-6xl">Que no falte nada para prender</h1>
            <p className="mt-4 max-w-2xl text-brand-cream/75">Leña, carbón, prendefácil, sal y salsas. Lo sumás al mismo pedido y llega junto con la carne.</p>
          </Reveal>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {fire.length > 0 && (
          <section className="mb-14">
            <h2 className="section-title text-3xl text-brand-carbon">Para el fuego</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {fire.map((p) => <ProductCard key={p.id} product={toClientProduct(p)} />)}
            </div>
          </section>
        )}
        {rest.length > 0 && (
          <section>
            <h2 className="section-title text-3xl text-brand-carbon">Condimentos, salsas y extras</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {rest.map((p) => <ProductCard key={p.id} product={toClientProduct(p)} />)}
            </div>
          </section>
        )}
        {products.length === 0 && <p className="text-brand-ash">No hay accesorios cargados todavía.</p>}
      </div>
    </div>
  );
}
