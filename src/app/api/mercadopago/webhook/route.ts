import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getMercadoPagoClient } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  const client = getMercadoPagoClient();
  if (!client) return NextResponse.json({ ok: true });

  const searchParams = req.nextUrl.searchParams;
  const topic = searchParams.get("type") ?? searchParams.get("topic");
  const paymentId = searchParams.get("data.id") ?? searchParams.get("id");

  if (topic !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const payment = await new Payment(client).get({ id: paymentId });
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ ok: true });

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return NextResponse.json({ ok: true });

    if (payment.status === "approved") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID", mpPaymentId: String(payment.id) },
      });
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      if (order.status === "PENDING") {
        await prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
          await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MercadoPago webhook error", err);
    return NextResponse.json({ ok: true });
  }
}
