import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPreferenceClient } from "@/lib/mercadopago";
import { createOrderWithStock } from "@/lib/orders";
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
    const order = await prisma.$transaction((tx) =>
      createOrderWithStock(tx, {
        customerName: body.customerName,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        province: body.province,
        postalCode: body.postalCode,
        shippingMethod: body.shippingMethod,
        paymentMethod: body.paymentMethod,
        channel: "WEB",
        notes: body.notes,
        // El precio lo decide siempre el servidor: se ignora cualquier
        // precio que venga del navegador.
        items: body.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      })
    );

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
