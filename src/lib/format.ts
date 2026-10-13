const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatPrice(pesos: number) {
  return formatter.format(pesos);
}

export function formatOrderNumber(n: number) {
  return `EC-${String(n).padStart(6, "0")}`;
}

export const AR_TIMEZONE = "America/Argentina/Buenos_Aires";

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: AR_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Formatea una fecha YYYY-MM-DD como "sabado 18 de octubre". */
export function formatIsoDate(iso: string, withWeekday = true) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    weekday: withWeekday ? "long" : undefined,
    day: "numeric",
    month: "long",
  }).format(date);
}
