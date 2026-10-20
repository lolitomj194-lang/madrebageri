import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderWithStock, type OrderLineInput } from "@/lib/orders";

// Venta manual desde el panel: Instagram, local mayorista, conocidos, feria.
// Descuenta stock igual que la web. Si "paid" es false queda como "a cobrar"
// (cuenta corriente) hasta que se marque pagada en el listado de ventas.
export type ManualSaleRequest = {
  channel: "INSTAGRAM" | "LOCAL_MAYORISTA" | "CONOCIDO" | "FERIA" | "OTRO";
  customerId?: string | null;
  customerName?: string;
  phone?: string;
  paymentMethod: "TRANSFERENCIA" | "EFECTIVO" | "MERCADOPAGO";
  paid: boolean;
  notes?: string;
  items: OrderLineInput[];
};

export async function POST(req: NextRequest) {
  let body: ManualSaleRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.items?.length) {
    return NextResponse.json({ error: "Agregá al menos un producto" }, { status: 400 });
  }
  if (!body.channel) {
    return NextResponse.json({ error: "Elegí el canal de venta" }, { status: 400 });
  }

  let customerName = body.customerName?.trim() ?? "";
  let phone = body.phone?.trim() ?? "";
  if (body.customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
    if (!customer) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 400 });
    customerName = customerName || customer.name;
    phone = phone || customer.phone || "";
  }
  if (!customerName) customerName = "Consumidor final";
  if (!phone) phone = "-";

  try {
    const order = await prisma.$transaction((tx) =>
      createOrderWithStock(tx, {
        customerName,
        phone,
        shippingMethod: "RETIRO",
        paymentMethod: body.paymentMethod,
        channel: body.channel,
        customerId: body.customerId ?? null,
        status: body.paid ? "PAID" : "PENDING",
        notes: body.notes,
        items: body.items,
      })
    );
    return NextResponse.json({ orderId: order.id, total: order.total });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo registrar la venta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
