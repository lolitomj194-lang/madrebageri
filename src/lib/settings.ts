import { prisma } from "@/lib/prisma";

export async function getBusinessSettings() {
  return prisma.businessSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
}

export async function getCalculatorSettings() {
  return prisma.calculatorSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
}

export async function getOpeningHours() {
  const rows = await prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } });
  if (rows.length === 7) return rows;
  // Garantiza una fila por dia (por defecto miercoles a domingo abierto).
  const existing = new Set(rows.map((r) => r.dayOfWeek));
  const missing = [0, 1, 2, 3, 4, 5, 6].filter((d) => !existing.has(d));
  if (missing.length) {
    await prisma.openingHour.createMany({
      data: missing.map((dayOfWeek) => ({
        dayOfWeek,
        open: [0, 3, 4, 5, 6].includes(dayOfWeek),
        openTime: "18:00",
        closeTime: "23:00",
      })),
      skipDuplicates: true,
    });
  }
  return prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } });
}

export async function getClosedDates() {
  const rows = await prisma.closedDate.findMany({ orderBy: { date: "asc" } });
  return rows;
}

export async function getActiveZones() {
  return prisma.deliveryZone.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export type BusinessSettings = Awaited<ReturnType<typeof getBusinessSettings>>;
export type CalculatorSettings = Awaited<ReturnType<typeof getCalculatorSettings>>;
