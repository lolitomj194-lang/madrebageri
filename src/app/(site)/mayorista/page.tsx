import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { site, whatsappLink } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Venta mayorista" };

export default async function WholesalePage() {
  const products = await prisma.product.findMany({
    where: { active: true, wholesalePrice: { not: null }, wholesaleMinQty: { not: null } },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: { order: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl text-brand-ink sm:text-4xl">Venta mayorista</h1>
        <p className="mt-3 leading-relaxed text-brand-ink-soft">
          Si tenés un local, una regalería o revendés, comprá con precio
          mayorista directamente desde la tienda: no hace falta registro ni
          pedir lista de precios.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Se activa solo",
            text: "Al llegar a la cantidad mínima de un producto, el carrito aplica el precio mayorista automáticamente.",
          },
          {
            title: "Combiná telas",
            text: "La cantidad mínima es por producto, no por tela: podés armar tu pedido mezclando los diseños disponibles.",
          },
          {
            title: "Envíos a todo el país",
            text: "Despachamos por correo o transporte. El costo se coordina por WhatsApp según el volumen del pedido.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-brand-line bg-white p-5">
            <h2 className="font-serif text-lg text-brand-terracotta">{item.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-brand-ink-soft">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="mb-2 font-serif text-2xl text-brand-ink">
          Productos con precio mayorista
        </h2>
        {products.length === 0 ? (
          <p className="text-brand-ink-soft">
            Todavía no hay productos con precio mayorista cargado. Consultanos
            por WhatsApp.
          </p>
        ) : (
          <>
            <ul className="mb-6 space-y-1 text-sm text-brand-ink-soft">
              {products.map((p) => (
                <li key={p.id}>
                  <Link href={`/producto/${p.slug}`} className="font-medium text-brand-ink hover:text-brand-terracotta">
                    {p.name}
                  </Link>{" "}
                  — {formatPrice(p.wholesalePrice as number)} c/u llevando {p.wholesaleMinQty}+
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-12 rounded-3xl bg-brand-sage/15 p-8 text-center">
        <h2 className="font-serif text-xl text-brand-ink">
          ¿Pedidos grandes o productos personalizados?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-brand-ink-soft">
          Para cantidades mayores, telas específicas o producciones a pedido,
          escribinos y lo cotizamos juntos.
        </p>
        <a
          href={whatsappLink(`Hola ${site.name}! Quiero hacer una consulta mayorista.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
