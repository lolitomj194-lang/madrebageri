import type { CouponType } from "@/generated/prisma/enums";

export type CouponLike = {
  code: string;
  type: CouponType;
  value: number;
  minTotal: number;
  validFrom: Date | null;
  validTo: Date | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
};

export type CouponCheck = { ok: true; discount: number } | { ok: false; reason: string };

/** Valida un cupon contra un subtotal y devuelve el descuento (nunca mayor al subtotal). */
export function checkCoupon(coupon: CouponLike | null, subtotal: number, now = new Date()): CouponCheck {
  if (!coupon || !coupon.active) return { ok: false, reason: "El cupón no existe o está inactivo." };
  if (coupon.validFrom && now < coupon.validFrom) return { ok: false, reason: "El cupón todavía no está vigente." };
  if (coupon.validTo && now > coupon.validTo) return { ok: false, reason: "El cupón ya venció." };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, reason: "El cupón alcanzó el máximo de usos." };
  }
  if (subtotal < coupon.minTotal) {
    return { ok: false, reason: `El cupón requiere una compra mínima de $${coupon.minTotal.toLocaleString("es-AR")}.` };
  }
  const discount =
    coupon.type === "PERCENT"
      ? Math.floor((subtotal * Math.min(100, Math.max(0, coupon.value))) / 100)
      : Math.min(coupon.value, subtotal);
  return { ok: true, discount: Math.max(0, discount) };
}
