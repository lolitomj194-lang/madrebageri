import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPreferenceClient } from "@/lib/mercadopago";
import type { CreateOrderRequest } from "@/lib/order-types";

export async function POST(req: NextRequest) {
  let body: CreateOrderRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  if (!body.customerName?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: "Nombre y telefono son obligatorios" }, { status: 400 });
  }
  if (!body.items?.length) {
    return NextResponse.json({ error: "El carrito esta vacio" }, { status: 400 });
  }
  if (body.shippingMethod === "ENVIO" && (!body.address?.trim() || !body.city?.trim())) {
    return NextResponse.json({ error: "Direccion y ciudad son obligatorias para envio" }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const itemsData: {
        productId: string;
        variantId: string;
        productName: string;
        variantLabel: string;
        quantity: number;
        unitPrice: number;
      }[] = [];

      for (const item of body.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });
        if (!variant || variant.productId !== item.productId) {
          throw new Error(`Variante no encontrada`);
        }
        if (variant.stock < item.quantity) {
          throw new Error(`Sin stock suficiente de ${variant.product.name} (${variant.colorName})`);
        }

        const unitPrice = variant.product.basePrice + variant.priceDelta;
        total += unitPrice * item.quantity;
        itemsData.push({
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          variantLabel: `${variant.colorName}${variant.lensColor ? ` · ${variant.lensColor}` : ""}`,
          quantity: item.quantity,
          unitPrice,
        });

        const updated = await tx.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`Sin stock suficiente de ${variant.product.name} (${variant.colorName})`);
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
          shippingMethod: body.shippingMethod,
          paymentMethod: body.paymentMethod,
          notes: body.notes?.trim() || null,
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
          { error: "Mercado Pago no esta configurado todavia. Elegi otro medio de pago." },
          { status: 503 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const preference = await preferenceClient.create({
        body: {
          items: order.items.map((item) => ({
            id: item.id,
            title: `${item.productName} - ${item.variantLabel}`,
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
