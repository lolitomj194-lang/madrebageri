import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildOrderEmail } from "@/lib/order-email";
import { getBusinessSettings } from "@/lib/settings";
import { getDeliveryOptions, computeDeliveryFee } from "@/lib/delivery";
import { checkCoupon } from "@/lib/coupons";
import { normalizeArPhone, whatsappLink } from "@/lib/whatsapp";
import { unitPrice, isEstimated, estimatedWeight, lineDetail, pluralUnit } from "@/lib/pricing";
import { comboTotal, comboSummary, clampPersons } from "@/lib/combo-math";
import { buildWhatsappMessage } from "@/lib/order-message";
import type { DeliveryMethod } from "@/generated/prisma/enums";

type IncomingItem = { kind: "product" | "combo"; id: string; quantity: number; persons?: number };

type Body = {
  clientRequestId?: string;
  customerName?: string;
  phone?: string;
  deliveryMethod?: DeliveryMethod;
  address?: string;
  neighborhood?: string;
  reference?: string;
  mapsLink?: string;
  zoneId?: string;
  requestedDate?: string;
  timeSlot?: string;
  notes?: string;
  couponCode?: string;
  items?: IncomingItem[];
};

const METHODS: DeliveryMethod[] = ["EXPRESS", "PROGRAMADO", "RETIRO"];

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function clean(value: unknown, max = 300) {
  return String(value ?? "").trim().slice(0, max) || null;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return bad("JSON inválido");
  }

  const settings = await getBusinessSettings();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;

  // Idempotencia: si el navegador reintenta con la misma clave, devolvemos el mismo pedido.
  const clientRequestId = clean(body.clientRequestId, 80);
  if (clientRequestId) {
    const existing = await prisma.order.findUnique({ where: { clientRequestId } });
    if (existing) {
      return NextResponse.json({
        duplicate: true,
        orderNumber: existing.number,
        token: existing.publicToken,
        whatsappUrl: settings.whatsapp && existing.whatsappMessage ? whatsappLink(settings.whatsapp, existing.whatsappMessage) : null,
        redirectUrl: `/pedido/${existing.publicToken}?nuevo=1`,
      });
    }
  }

  // --- Validaciones basicas ---
  const customerName = clean(body.customerName, 120);
  if (!customerName || customerName.length < 3) return bad("Ingresá tu nombre y apellido.");
  const phone = normalizeArPhone(String(body.phone ?? ""));
  if (!phone) return bad("Ingresá un número de WhatsApp argentino válido (ej: 343 5123456).");
  const deliveryMethod = body.deliveryMethod;
  if (!deliveryMethod || !METHODS.includes(deliveryMethod)) return bad("Elegí una modalidad de entrega.");
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return bad("El carrito está vacío.");
  if (items.length > 60) return bad("Demasiados productos en un solo pedido.");

  const options = await getDeliveryOptions();

  // --- Modalidad de entrega ---
  const address = clean(body.address, 200);
  const neighborhood = clean(body.neighborhood, 120);
  const reference = clean(body.reference, 300);
  const mapsLinkRaw = clean(body.mapsLink, 300);
  const mapsLink = mapsLinkRaw && /^https?:\/\//i.test(mapsLinkRaw) ? mapsLinkRaw : null;
  const requestedDate = clean(body.requestedDate, 10);
  const timeSlot = clean(body.timeSlot, 20);
  let zone: (typeof options.zones)[number] | null = null;

  if (deliveryMethod === "EXPRESS") {
    if (!options.expressEnabled) return bad("El delivery express no está disponible.");
    if (!options.openNow) return bad("El delivery express solo está disponible dentro del horario de atención. Podés programar la entrega.");
  }
  if (deliveryMethod === "PROGRAMADO" && !options.scheduled) return bad("El delivery programado no está disponible.");
  if (deliveryMethod === "RETIRO" && !options.pickup) return bad("El retiro por local no está disponible.");

  if (deliveryMethod !== "RETIRO") {
    if (!address) return bad("Ingresá la dirección de entrega (calle y número).");
    zone = options.zones.find((z) => z.id === body.zoneId) ?? null;
    if (!zone) return bad("Elegí tu zona de reparto. Si tu barrio no aparece, consultanos por WhatsApp.");
  }

  if (deliveryMethod !== "EXPRESS") {
    const date = options.dates.find((d) => d.date === requestedDate);
    if (!date) return bad("Elegí un día disponible.");
    const slot = date.slots.find((s) => s.slot === timeSlot);
    if (!slot) return bad("Elegí una franja horaria disponible.");
    if (deliveryMethod === "PROGRAMADO" && slot.full) return bad("Esa franja ya no tiene cupo. Elegí otra.");
  }

  // --- Recalcular precios en el servidor (nunca se confia en el navegador) ---
  const productIds = items.filter((i) => i.kind === "product").map((i) => i.id);
  const comboIds = items.filter((i) => i.kind === "combo").map((i) => i.id);
  const [products, combos] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: productIds }, active: true } }),
    prisma.combo.findMany({ where: { id: { in: comboIds }, active: true }, include: { items: { include: { product: true } } } }),
  ]);

  const itemsData: {
    productId?: string;
    comboId?: string;
    name: string;
    detail: string | null;
    quantity: number;
    unitLabel: string;
    unitPrice: number;
    lineTotal: number;
    estimated: boolean;
    estWeightMinG: number | null;
    estWeightMaxG: number | null;
  }[] = [];

  for (const item of items) {
    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 500) return bad("Cantidad inválida.");
    if (item.kind === "product") {
      const p = products.find((x) => x.id === item.id);
      if (!p) return bad("Uno de los productos ya no está disponible. Revisá tu carrito.");
      if (quantity < p.minQuantity) return bad(`${p.name}: la cantidad mínima es ${p.minQuantity}.`);
      const price = unitPrice(p);
      const w = estimatedWeight(p, quantity);
      itemsData.push({
        productId: p.id,
        name: p.name,
        detail: lineDetail(p, quantity),
        quantity,
        unitLabel: p.unitLabel,
        unitPrice: price,
        lineTotal: price * quantity,
        estimated: isEstimated(p),
        estWeightMinG: w?.minG ?? null,
        estWeightMaxG: w?.maxG ?? null,
      });
    } else {
      const c = combos.find((x) => x.id === item.id);
      if (!c) return bad("Uno de los combos ya no está disponible. Revisá tu carrito.");
      const itemsLike = c.items.map((it) => ({
        name: it.product.name,
        unitLabel: it.product.unitLabel,
        quantity: it.quantity,
        inGrams: it.inGrams,
        perExtraPerson: it.perExtraPerson,
        note: it.note,
        saleUnit: it.product.saleUnit,
        portionMinGrams: it.product.portionMinGrams,
        portionMaxGrams: it.product.portionMaxGrams,
      }));
      if (c.pricing === "PER_PERSON") {
        if (quantity < c.persons) return bad(`${c.name}: mínimo ${c.persons} personas.`);
        if (c.maxPersons && quantity > c.maxPersons) return bad(`${c.name}: máximo ${c.maxPersons} personas.`);
        itemsData.push({
          comboId: c.id,
          name: c.name,
          detail: `${quantity} personas (${comboSummary(c, itemsLike, quantity)})`,
          quantity,
          unitLabel: "persona",
          unitPrice: c.price,
          lineTotal: comboTotal(c, quantity),
          estimated: false,
          estWeightMinG: null,
          estWeightMaxG: null,
        });
      } else {
        const requested = c.pricing === "SCALABLE" ? Math.floor(Number(item.persons ?? c.persons)) : c.persons;
        if (c.pricing === "SCALABLE" && requested !== clampPersons(c, requested)) {
          return bad(`${c.name}: la cantidad de personas debe estar entre ${c.persons} y ${c.maxPersons ?? "sin límite"}.`);
        }
        const persons = clampPersons(c, requested);
        const unit = comboTotal(c, persons);
        const name = c.pricing === "SCALABLE" ? `${c.name} (${persons} personas)` : c.name;
        itemsData.push({
          comboId: c.id,
          name,
          detail: `${quantity} combo${quantity > 1 ? "s" : ""} (${comboSummary(c, itemsLike, persons)})`,
          quantity,
          unitLabel: "combo",
          unitPrice: unit,
          lineTotal: unit * quantity,
          estimated: false,
          estWeightMinG: null,
          estWeightMaxG: null,
        });
      }
    }
  }

  const subtotal = itemsData.reduce((s, i) => s + i.lineTotal, 0);

  // --- Cupon (uno solo, nunca se acumulan) ---
  let discount = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;
  const code = clean(body.couponCode, 40)?.toUpperCase() ?? null;
  if (code) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    const check = checkCoupon(coupon, subtotal);
    if (!check.ok) return bad(`Cupón ${code}: ${check.reason}`);
    discount = check.discount;
    couponId = coupon!.id;
    couponCode = coupon!.code;
  }

  const goodsTotal = subtotal - discount;
  let deliveryFee = 0;
  if (zone) {
    if (goodsTotal < zone.minOrder) {
      return bad(`La compra mínima para ${zone.name} es de $${zone.minOrder.toLocaleString("es-AR")}.`);
    }
    deliveryFee = computeDeliveryFee(zone, goodsTotal);
  }
  const total = goodsTotal + deliveryFee;

  try {
    const order = await prisma.$transaction(async (tx) => {
      if (couponId) {
        const updated = await tx.coupon.updateMany({
          where: { id: couponId, OR: [{ maxUses: null }, { usedCount: { lt: tx.coupon.fields.maxUses } }] },
          data: { usedCount: { increment: 1 } },
        });
        if (updated.count === 0) throw new Error("El cupón alcanzó el máximo de usos.");
      }
      const created = await tx.order.create({
        data: {
          clientRequestId,
          customerName,
          phone,
          deliveryMethod,
          address: deliveryMethod === "RETIRO" ? null : address,
          neighborhood: deliveryMethod === "RETIRO" ? null : neighborhood,
          reference: deliveryMethod === "RETIRO" ? null : reference,
          mapsLink: deliveryMethod === "RETIRO" ? null : mapsLink,
          zoneId: zone?.id ?? null,
          requestedDate: deliveryMethod === "EXPRESS" ? null : requestedDate,
          timeSlot: deliveryMethod === "EXPRESS" ? null : timeSlot,
          notes: clean(body.notes, 500),
          subtotal,
          deliveryFee,
          discount,
          couponId,
          couponCode,
          total,
          status: "SOLICITADA",
          items: { create: itemsData },
        },
        include: { items: true },
      });
      const trackingUrl = `${baseUrl}/pedido/${created.publicToken}`;
      const message = buildWhatsappMessage({ ...created, zoneName: zone?.name ?? null }, settings.name, trackingUrl);
      return tx.order.update({ where: { id: created.id }, data: { whatsappMessage: message }, include: { items: true } });
    });

    // Aviso interno por correo: se envia despues de responder y nunca bloquea ni rompe la solicitud.
    if (settings.notificationEmail) {
      after(async () => {
        try {
          const mail = buildOrderEmail({ ...order, zoneName: zone?.name ?? null }, settings.name, baseUrl);
          const result = await sendEmail({ to: settings.notificationEmail, ...mail });
          if (!result.sent) console.warn(`[orders] aviso por correo no enviado (#${order.number}): ${result.reason}`);
        } catch (err) {
          console.error(`[orders] error enviando aviso por correo (#${order.number})`, err);
        }
      });
    }

    return NextResponse.json({
      orderNumber: order.number,
      token: order.publicToken,
      whatsappUrl: settings.whatsapp && order.whatsappMessage ? whatsappLink(settings.whatsapp, order.whatsappMessage) : null,
      whatsappConfigured: Boolean(settings.whatsapp),
      redirectUrl: `/pedido/${order.publicToken}?nuevo=1`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo registrar la solicitud";
    return bad(message);
  }
}
