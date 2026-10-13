import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unitPrice, isEstimated } from "@/lib/pricing";

/**
 * Devuelve las lineas de un pedido anterior con precios y disponibilidad ACTUALES,
 * listas para cargar en el carrito. Solo accesible con el token del pedido.
 */
export async function GET(_req: NextRequest, { params }: { params: { token: string } | Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.order.findUnique({ where: { publicToken: token }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  const productIds = order.items.map((i) => i.productId).filter((x): x is string => Boolean(x));
  const comboIds = order.items.map((i) => i.comboId).filter((x): x is string => Boolean(x));
  const [products, combos] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: productIds } } }),
    prisma.combo.findMany({ where: { id: { in: comboIds } } }),
  ]);

  const lines: unknown[] = [];
  const unavailable: string[] = [];
  for (const it of order.items) {
    if (it.productId) {
      const p = products.find((x) => x.id === it.productId);
      if (!p || !p.active) {
        unavailable.push(it.name);
        continue;
      }
      lines.push({
        line: {
          key: `product:${p.id}`,
          kind: "product",
          id: p.id,
          slug: p.slug,
          name: p.name,
          image: p.imageUrl,
          unitLabel: p.unitLabel,
          unitPrice: unitPrice(p),
          minQuantity: p.minQuantity,
          estimated: isEstimated(p),
          portionMinGrams: p.saleUnit === "PORTION" ? p.portionMinGrams : p.unitGrams,
          portionMaxGrams: p.saleUnit === "PORTION" ? p.portionMaxGrams : p.unitGrams,
          role: p.role,
        },
        quantity: Math.max(it.quantity, p.minQuantity),
      });
    } else if (it.comboId) {
      const c = combos.find((x) => x.id === it.comboId);
      if (!c || !c.active) {
        unavailable.push(it.name);
        continue;
      }
      const perPerson = c.pricing === "PER_PERSON";
      lines.push({
        line: {
          key: `combo:${c.id}`,
          kind: "combo",
          id: c.id,
          slug: c.slug,
          name: c.name,
          image: c.imageUrl,
          unitLabel: perPerson ? "persona" : "combo",
          unitPrice: c.price,
          minQuantity: perPerson ? c.persons : 1,
          estimated: false,
          role: "COMBO",
          summary: it.detail,
        },
        quantity: perPerson ? Math.max(it.quantity, c.persons) : it.quantity,
      });
    }
  }
  return NextResponse.json({ lines, unavailable });
}
