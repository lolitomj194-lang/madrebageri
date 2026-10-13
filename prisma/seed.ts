import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { runSeed } from "../src/lib/seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

runSeed(prisma)
  .then(({ productCount, comboCount, adminEmail }) => {
    console.log(`Seed completo: ${productCount} productos y ${comboCount} combos DE EJEMPLO.`);
    console.log(`Los precios son ilustrativos: cargar los reales desde /admin antes de publicar.`);
    console.log(`Admin: ${adminEmail} / ${process.env.ADMIN_PASSWORD ?? "cambiar123"}`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
