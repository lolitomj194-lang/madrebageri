import { AR_TIMEZONE } from "@/lib/format";

export type OpeningHourLike = {
  dayOfWeek: number;
  open: boolean;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  slotCapacity: number;
};

export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function toHHMM(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Fecha y hora actual en Argentina. */
export function nowInArgentina(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: AR_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const minutes = Number(get("hour")) % 24 * 60 + Number(get("minute"));
  return { date, minutes, dayOfWeek: dayOfWeekOf(date) };
}

export function dayOfWeekOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function hourFor(hours: OpeningHourLike[], dayOfWeek: number) {
  return hours.find((h) => h.dayOfWeek === dayOfWeek) ?? null;
}

export function isOpenNow(hours: OpeningHourLike[], closedDates: string[], now = new Date()) {
  const { date, minutes, dayOfWeek } = nowInArgentina(now);
  if (closedDates.includes(date)) return { open: false, hour: null, date };
  const hour = hourFor(hours, dayOfWeek);
  if (!hour || !hour.open) return { open: false, hour: null, date };
  const open = minutes >= toMinutes(hour.openTime) && minutes < toMinutes(hour.closeTime);
  return { open, hour, date };
}

export type DateOption = { date: string; dayOfWeek: number; hour: OpeningHourLike };

/** Fechas disponibles para pedidos programados / retiro. */
export function availableDates(
  hours: OpeningHourLike[],
  closedDates: string[],
  daysAhead: number,
  now = new Date()
): DateOption[] {
  const { date: today } = nowInArgentina(now);
  const result: DateOption[] = [];
  for (let i = 0; i <= daysAhead; i++) {
    const date = addDays(today, i);
    if (closedDates.includes(date)) continue;
    const dow = dayOfWeekOf(date);
    const hour = hourFor(hours, dow);
    if (!hour || !hour.open) continue;
    if (slotsForDate(date, hour, now).length === 0) continue;
    result.push({ date, dayOfWeek: dow, hour });
  }
  return result;
}

/** Franjas horarias ("19:00 - 20:00") para una fecha; para hoy excluye las que ya pasaron. */
export function slotsForDate(date: string, hour: OpeningHourLike, now = new Date(), prepMinutes = 30) {
  const { date: today, minutes: nowMin } = nowInArgentina(now);
  const start = toMinutes(hour.openTime);
  const end = toMinutes(hour.closeTime);
  const step = Math.max(15, hour.slotMinutes || 60);
  const slots: string[] = [];
  for (let s = start; s + step <= end + 0.001; s += step) {
    if (date === today && s < nowMin + prepMinutes) continue;
    slots.push(`${toHHMM(s)} - ${toHHMM(s + step)}`);
  }
  return slots;
}

export function describeHours(hours: OpeningHourLike[]) {
  return [1, 2, 3, 4, 5, 6, 0].map((dow) => {
    const h = hourFor(hours, dow);
    return {
      dayOfWeek: dow,
      name: DAY_NAMES[dow],
      text: h && h.open ? `${h.openTime} a ${h.closeTime}` : "Cerrado",
      open: Boolean(h?.open),
    };
  });
}
