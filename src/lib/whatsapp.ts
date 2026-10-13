/**
 * Normaliza un telefono argentino a formato internacional para WhatsApp (549 + area + numero).
 * Acepta: "343 5123456", "0343 15 5123456", "+54 9 343 5123456", "543435123456", etc.
 * Devuelve solo digitos o null si no parece un celular argentino valido.
 */
export function normalizeArPhone(input: string): string | null {
  let digits = (input ?? "").replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("54")) digits = digits.slice(2);
  if (digits.startsWith("9")) digits = digits.slice(1);
  if (digits.startsWith("0")) digits = digits.slice(1);

  // Quitar el "15" despues del codigo de area (2 a 4 digitos).
  for (const areaLen of [2, 3, 4]) {
    const area = digits.slice(0, areaLen);
    const rest = digits.slice(areaLen);
    if (rest.startsWith("15") && area.length + rest.length - 2 === 10) {
      digits = area + rest.slice(2);
      break;
    }
  }

  if (digits.length !== 10) return null;
  return `549${digits}`;
}

export function formatArPhone(normalized: string) {
  // 549 343 5123456 -> +54 9 343 512-3456 (aproximado para area de 3 digitos)
  const local = normalized.replace(/^549/, "");
  if (local.length !== 10) return `+${normalized}`;
  const area = local.length === 10 && local.startsWith("11") ? local.slice(0, 2) : local.slice(0, 3);
  const num = local.slice(area.length);
  return `+54 9 ${area} ${num.slice(0, num.length - 4)}-${num.slice(-4)}`;
}

/** Enlace wa.me compatible con celular y escritorio. */
export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
