import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPreferenceClient } from "@/lib/mercadopago";
import { computeUnitPrice } from "@/lib/pricing";
import type { CreateOrderRequest } from "@/lib/order-types";

export async function POST(req: NextRequest) {
  let body: CreateOrderRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.customerName?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
  }
  if (!body.items?.length) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }
  if (
    body.shippingMethod === "ENVIO_NACIONAL" &&
    (!body.address?.trim() || !body.city?.trim() || !body.province?.trim())
  ) {
    return NextResponse.json(
      { error: "Dirección, localidad y provincia son obligatorias para el envío" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Cantidad total por producto (todas las telas juntas) para decidir
      // si corresponde precio mayorista.
      const qtyByProduct = new Map<string, number>();
      for (const item of body.items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new Error("Cantidad inválida");
        }
        qtyByProduct.set(
          item.productId,
          (qtyByProduct.get(item.productId) ?? 0) + item.quantity
        );
      }

      const isCashPayment =
        body.paymentMethod === "TRANSFERENCIA" || body.paymentMethod === "EFECTIVO";

      let total = 0;
      let orderHasWholesale = false;
      const itemsData: {
        productId: string;
        variantId: string;
        productName: string;
        variantLabel: string;
        quantity: number;
        unitPrice: number;
        isWholesale: boolean;
      }[] = [];

      for (const item of body.items) {
        const variant = await tx.variant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });
        if (!variant || variant.productId !== item.productId || !variant.active) {
          throw new Error("Alguna tela del carrito ya no está disponible");
        }
        if (!variant.product.active) {
          throw new Error(`${variant.product.name} ya no está disponible`);
        }

        const { unitPrice, isWholesale } = computeUnitPrice(
          variant.product,
          variant.priceDelta,
          qtyByProduct.get(item.productId) ?? item.quantity,
          isCashPayment
        );
        orderHasWholesale = orderHasWholesale || isWholesale;
        total += unitPrice * item.quantity;
        itemsData.push({
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          variantLabel: variant.name,
          quantity: item.quantity,
          unitPrice,
          isWholesale,
        });

        // Descuento de stock atomico: si otro pedido lo gano, falla.
        const updated = await tx.variant.updateMany({
          where: { id: variant.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(
            `Sin stock suficiente de ${variant.product.name} (${variant.name})`
          );
        }
      }

      return tx.order.create({
        data: {
          customerName: body.customerName.trim(),
          phone: body.phone.trim(),
          email: body.email?.trim() || null,
          address: body.address?.trim() || null,
          city: body.city?.trim() || null,
          province: body.province?.trim() || null,
          postalCode: body.postalCode?.trim() || null,
          shippingMethod: body.shippingMethod,
          paymentMethod: body.paymentMethod,
          notes: body.notes?.trim() || null,
          isWholesale: orderHasWholesale,
          total,
          items: { create: itemsData },
        },
        include: { items: true },
      });
    });

    if (body.paymentMethod === "MERCADOPAGO") {
      const preferenceClient = getPreferenceClient();
      if (!preferenceClient) {
        return NextResponse.json(
          { error: "Mercado Pago no está configurado todavía. Elegí otro medio de pago." },
          { status: 503 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const preference = await preferenceClient.create({
        body: {
          items: order.items.map((item) => ({
            id: item.id,
            title: `${item.productName}${item.variantLabel ? ` - ${item.variantLabel}` : ""}`,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            currency_id: "ARS",
          })),
          external_reference: order.id,
          back_urls: {
            success: `${baseUrl}/pedido-confirmado/${order.id}`,
            pending: `${baseUrl}/pedido-confirmado/${order.id}`,
            failure: `${baseUrl}/checkout`,
          },
          auto_return: "approved",
          notification_url: `${baseUrl}/api/mercadopago/webhook`,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { mpPreferenceId: preference.id },
      });

      return NextResponse.json({ orderId: order.id, redirectUrl: preference.init_point });
    }

    return NextResponse.json({ orderId: order.id, redirectUrl: `/pedido-confirmado/${order.id}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo crear el pedido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
