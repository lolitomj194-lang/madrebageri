import type { Prisma } from "@/generated/prisma/client";
import { computeUnitPrice } from "@/lib/pricing";

type Tx = Prisma.TransactionClient;

export type OrderLineInput = {
  productId: string;
  variantId: string;
  quantity: number;
  // Solo para ventas manuales: precio pactado a mano. Si falta, se calcula
  // con las reglas de la tienda (minorista / efectivo / mayorista).
  unitPrice?: number;
};

export type CreateOrderData = {
  customerName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  shippingMethod: "ENVIO_NACIONAL" | "RETIRO";
  paymentMethod: "MERCADOPAGO" | "TRANSFERENCIA" | "EFECTIVO";
  channel?: "WEB" | "INSTAGRAM" | "LOCAL_MAYORISTA" | "CONOCIDO" | "FERIA" | "OTRO";
  customerId?: string | null;
  status?: "PENDING" | "PAID";
  notes?: string | null;
  items: OrderLineInput[];
};

// Crea el pedido descontando stock de forma atomica y recalculando precios
// en el servidor. Lanza Error con mensaje legible si algo no se puede vender.
export async function createOrderWithStock(tx: Tx, data: CreateOrderData) {
  const qtyByProduct = new Map<string, number>();
  for (const item of data.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Cantidad inválida");
    }
    qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.quantity);
  }

  const isCashPayment =
    data.paymentMethod === "TRANSFERENCIA" || data.paymentMethod === "EFECTIVO";

  let total = 0;
  let orderHasWholesale = false;
  const itemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

  for (const item of data.items) {
    const variant = await tx.variant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });
    if (!variant || variant.productId !== item.productId || !variant.active) {
      throw new Error("Alguna tela del pedido ya no está disponible");
    }
    if (!variant.product.active) {
      throw new Error(`${variant.product.name} ya no está disponible`);
    }

    const computed = computeUnitPrice(
      variant.product,
      variant.priceDelta,
      qtyByProduct.get(item.productId) ?? item.quantity,
      isCashPayment
    );
    const unitPrice =
      item.unitPrice != null && item.unitPrice >= 0 ? Math.round(item.unitPrice) : computed.unitPrice;
    const isWholesale = computed.isWholesale;

    orderHasWholesale = orderHasWholesale || isWholesale;
    total += unitPrice * item.quantity;
    itemsData.push({
      product: { connect: { id: variant.productId } },
      variant: { connect: { id: variant.id } },
      productName: variant.product.name,
      variantLabel: variant.name,
      quantity: item.quantity,
      unitPrice,
      isWholesale,
    });

    const updated = await tx.variant.updateMany({
      where: { id: variant.id, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (updated.count === 0) {
      throw new Error(`Sin stock suficiente de ${variant.product.name} (${variant.name})`);
    }
  }

  return tx.order.create({
    data: {
      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      province: data.province?.trim() || null,
      postalCode: data.postalCode?.trim() || null,
      shippingMethod: data.shippingMethod,
      paymentMethod: data.paymentMethod,
      channel: data.channel ?? "WEB",
      customerId: data.customerId ?? null,
      status: data.status ?? "PENDING",
      notes: data.notes?.trim() || null,
      isWholesale: orderHasWholesale,
      total,
      items: { create: itemsData },
    },
    include: { items: true },
  });
}

// Repone el stock de un pedido (cancelacion).
export async function restockOrder(tx: Tx, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    if (item.variantId) {
      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }
}
