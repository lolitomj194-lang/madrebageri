import { prisma } from "@/lib/prisma";

// Una sola fila de configuracion; se crea con los defaults la primera vez.
export async function getCostSettings() {
  return prisma.costSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}
