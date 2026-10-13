import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  let body: { code?: string; subtotal?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const code = String(body.code ?? "").trim().toUpperCase();
  const subtotal = Math.max(0, Number(body.subtotal ?? 0));
  if (!code) return NextResponse.json({ error: "Ingresá un código" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  const result = checkCoupon(coupon, subtotal);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });

  return NextResponse.json({
    coupon: { code: coupon!.code, type: coupon!.type, value: coupon!.value, minTotal: coupon!.minTotal },
    discount: result.discount,
  });
}
