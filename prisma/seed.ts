import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { runSeed } from "../src/lib/seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

runSeed(prisma)
  .then(({ productCount, adminEmail }) => {
    const adminPassword = process.env.ADMIN_PASSWORD ?? "cambiar123";
    console.log(`Seed complete. ${productCount} products. Admin login: ${adminEmail} / ${adminPassword}`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
