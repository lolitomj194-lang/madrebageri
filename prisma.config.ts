import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Usado solo por la CLI de Prisma (migrate). La app se conecta con DATABASE_URL
  // (ver src/lib/prisma.ts). Se aceptan los nombres que inyectan Neon/Vercel Postgres.
  datasource: {
    url:
      process.env["DIRECT_URL"] ??
      process.env["DATABASE_URL_UNPOOLED"] ??
      process.env["POSTGRES_URL_NON_POOLING"] ??
      process.env["DATABASE_URL"] ??
      process.env["POSTGRES_URL"],
  },
});
