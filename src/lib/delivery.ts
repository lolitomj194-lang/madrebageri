import { prisma } from "@/lib/prisma";
import { getBusinessSettings, getOpeningHours, getClosedDates, getActiveZones } from "@/lib/settings";
import { isOpenNow, availableDates, slotsForDate } from "@/lib/hours";

/**
 * Opciones de entrega vigentes: modalidades habilitadas, zonas, fechas y franjas con cupo.
 * Se usa en el checkout (cliente) y para validar al crear el pedido (servidor).
 */
export async function getDeliveryOptions(now = new Date()) {
  const [settings, hours, closed, zones] = await Promise.all([
    getBusinessSettings(),
    getOpeningHours(),
    getClosedDates(),
    getActiveZones(),
  ]);
  const closedDates = closed.map((c) => c.date);
  const open = isOpenNow(hours, closedDates, now);
  const dates = availableDates(hours, closedDates, settings.scheduleDaysAhead, now);

  // Cupos: pedidos programados activos por fecha + franja.
  const booked = await prisma.order.groupBy({
    by: ["requestedDate", "timeSlot"],
    where: {
      deliveryMethod: "PROGRAMADO",
      status: { not: "CANCELADO" },
      requestedDate: { in: dates.map((d) => d.date) },
    },
    _count: { _all: true },
  });
  const bookedMap = new Map(booked.map((b) => [`${b.requestedDate}|${b.timeSlot}`, b._count._all]));

  const dateOptions = dates.map((d) => ({
    date: d.date,
    slots: slotsForDate(d.date, d.hour, now, settings.prepTimeMinutes).map((slot) => ({
      slot,
      full: (bookedMap.get(`${d.date}|${slot}`) ?? 0) >= d.hour.slotCapacity,
    })),
  }));

  return {
    openNow: open.open,
    today: open.date,
    express: settings.expressEnabled && open.open,
    expressEnabled: settings.expressEnabled,
    scheduled: settings.scheduledEnabled,
    pickup: settings.pickupEnabled,
    expressTargetMinutes: settings.expressTargetMinutes,
    prepTimeMinutes: settings.prepTimeMinutes,
    address: settings.address,
    whatsappConfigured: Boolean(settings.whatsapp),
    zones: zones.map((z) => ({
      id: z.id,
      name: z.name,
      neighborhoods: z.neighborhoods,
      fee: z.fee,
      minOrder: z.minOrder,
      freeShippingFrom: z.freeShippingFrom,
    })),
    dates: dateOptions,
  };
}

export type DeliveryOptions = Awaited<ReturnType<typeof getDeliveryOptions>>;

export function computeDeliveryFee(zone: { fee: number; freeShippingFrom: number | null }, goodsTotal: number) {
  if (zone.freeShippingFrom !== null && goodsTotal >= zone.freeShippingFrom) return 0;
  return zone.fee;
}
