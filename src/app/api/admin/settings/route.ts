import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBusinessSettings, ValidationError } from "@/lib/admin-validation";
import { readJson, handleError } from "@/lib/api-helpers";
import { normalizeArPhone } from "@/lib/whatsapp";
import { getBusinessSettings } from "@/lib/settings";

export async function PUT(req: NextRequest) {
  try {
    const body = await readJson(req);
    const data = parseBusinessSettings(body);
    if (data.whatsapp) {
      const normalized = normalizeArPhone(data.whatsapp);
      if (!normalized) throw new ValidationError("El WhatsApp comercial debe ser un celular argentino válido (ej: 343 5123456).");
      data.whatsapp = normalized;
    }
    const settings = await prisma.businessSettings.upsert({ where: { id: "main" }, update: data, create: { id: "main", ...data } });
    return NextResponse.json({ settings });
  } catch (err) {
    return handleError(err);
  }
}

/** Actualizacion parcial (solo campos de reparto) desde la pantalla de horarios. */
export async function PATCH(req: NextRequest) {
  try {
    const body = await readJson(req);
    const current = await getBusinessSettings();
    const merged = parseBusinessSettings({ ...current, ...body });
    const settings = await prisma.businessSettings.update({
      where: { id: "main" },
      data: {
        expressEnabled: merged.expressEnabled,
        scheduledEnabled: merged.scheduledEnabled,
        pickupEnabled: merged.pickupEnabled,
        expressTargetMinutes: merged.expressTargetMinutes,
        prepTimeMinutes: merged.prepTimeMinutes,
        scheduleDaysAhead: merged.scheduleDaysAhead,
      },
    });
    return NextResponse.json({ settings });
  } catch (err) {
    return handleError(err);
  }
}
