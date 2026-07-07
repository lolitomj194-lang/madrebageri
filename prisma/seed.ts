import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Aviador", slug: "aviador", order: 1 },
  { name: "Wayfarer", slug: "wayfarer", order: 2 },
  { name: "Redondo", slug: "redondo", order: 3 },
  { name: "Clubmaster", slug: "clubmaster", order: 4 },
  { name: "Rectangular", slug: "rectangular", order: 5 },
  { name: "Cuadrado", slug: "cuadrado", order: 6 },
];

type SeedVariant = {
  colorName: string;
  colorHex: string;
  lensColor?: string;
  stock: number;
  priceDelta?: number;
};

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  collection: string;
  categorySlug: string;
  basePrice: number;
  featured: boolean;
  imageBg: string;
  variants: SeedVariant[];
};

// NOTE: Placeholder catalog for development. Replace with the real Ray-Ban
// product list, prices and photos via the admin panel before going live.
const PRODUCTS: SeedProduct[] = [
  {
    name: "Ray-Ban RB3648-M Ferrari Aviator",
    slug: "rb3648m-ferrari-aviator",
    description:
      "Edicion especial Ray-Ban x Scuderia Ferrari. Marco metalico liviano con terminaciones rojo Ferrari y lentes espejadas.",
    collection: "Ferrari",
    categorySlug: "aviador",
    basePrice: 285000,
    featured: true,
    imageBg: "111111/E8000D",
    variants: [
      { colorName: "Negro / Rojo Ferrari", colorHex: "#111111", lensColor: "Espejado plata", stock: 8 },
      { colorName: "Dorado / Rojo Ferrari", colorHex: "#C9A227", lensColor: "Verde clasico", stock: 5, priceDelta: 15000 },
    ],
  },
  {
    name: "Ray-Ban RB4413-M Ferrari Wayfarer",
    slug: "rb4413m-ferrari-wayfarer",
    description:
      "Wayfarer en acetato con detalles Scuderia Ferrari, inspirado en los cascos de la escuderia.",
    collection: "Ferrari",
    categorySlug: "wayfarer",
    basePrice: 265000,
    featured: true,
    imageBg: "1a1a1a/E8000D",
    variants: [
      { colorName: "Negro brillante", colorHex: "#0d0d0d", lensColor: "Gris degrade", stock: 10 },
      { colorName: "Rojo Ferrari", colorHex: "#E8000D", lensColor: "Gris", stock: 6 },
    ],
  },
  {
    name: "Ray-Ban RB8317-M Ferrari Rectangular",
    slug: "rb8317m-ferrari-rectangular",
    description:
      "Marco rectangular en fibra de carbono, la linea mas tecnica de la coleccion Ferrari.",
    collection: "Ferrari",
    categorySlug: "rectangular",
    basePrice: 310000,
    featured: true,
    imageBg: "0a0a0a/E8000D",
    variants: [
      { colorName: "Negro fibra de carbono", colorHex: "#050505", lensColor: "Polarizado gris", stock: 4 },
    ],
  },
  {
    name: "Ray-Ban Aviator Classic RB3025",
    slug: "aviator-classic-rb3025",
    description: "El aviador original de Ray-Ban desde 1937. Un clasico atemporal.",
    collection: "Signature",
    categorySlug: "aviador",
    basePrice: 195000,
    featured: true,
    imageBg: "C9A227/1a1a1a",
    variants: [
      { colorName: "Dorado", colorHex: "#C9A227", lensColor: "Verde G-15", stock: 12 },
      { colorName: "Plateado", colorHex: "#C0C0C0", lensColor: "Gris espejado", stock: 9 },
      { colorName: "Negro", colorHex: "#111111", lensColor: "Negro", stock: 7 },
    ],
  },
  {
    name: "Ray-Ban Wayfarer Classic RB2140",
    slug: "wayfarer-classic-rb2140",
    description: "El modelo icono de Ray-Ban, usado por generaciones desde 1952.",
    collection: "Signature",
    categorySlug: "wayfarer",
    basePrice: 180000,
    featured: false,
    imageBg: "1a1a1a/ffffff",
    variants: [
      { colorName: "Negro", colorHex: "#111111", lensColor: "Verde G-15", stock: 15 },
      { colorName: "Habana", colorHex: "#8B5A2B", lensColor: "Marron degrade", stock: 8 },
    ],
  },
  {
    name: "Ray-Ban Round Metal RB3447",
    slug: "round-metal-rb3447",
    description: "Estilo redondo vintage, inspirado en los anos 60.",
    collection: "Classic",
    categorySlug: "redondo",
    basePrice: 175000,
    featured: false,
    imageBg: "C9A227/111111",
    variants: [
      { colorName: "Dorado", colorHex: "#C9A227", lensColor: "Verde", stock: 10 },
      { colorName: "Gunmetal", colorHex: "#4b4b4b", lensColor: "Gris", stock: 6 },
    ],
  },
  {
    name: "Ray-Ban Clubmaster RB3016",
    slug: "clubmaster-rb3016",
    description: "Diseno retro con parte superior en acetato y base metalica.",
    collection: "Classic",
    categorySlug: "clubmaster",
    basePrice: 185000,
    featured: false,
    imageBg: "222222/C9A227",
    variants: [
      { colorName: "Negro / Dorado", colorHex: "#222222", lensColor: "Verde G-15", stock: 11 },
      { colorName: "Habana / Dorado", colorHex: "#8B5A2B", lensColor: "Marron", stock: 7 },
    ],
  },
  {
    name: "Ray-Ban Justin RB4165",
    slug: "justin-rb4165",
    description: "Wayfarer moderno en policarbonato liviano, con lentes degrade.",
    collection: "Classic",
    categorySlug: "wayfarer",
    basePrice: 160000,
    featured: false,
    imageBg: "3a3a3a/ffffff",
    variants: [
      { colorName: "Negro mate", colorHex: "#2b2b2b", lensColor: "Gris degrade", stock: 14 },
      { colorName: "Azul mate", colorHex: "#2b3a5a", lensColor: "Azul espejado", stock: 5 },
    ],
  },
  {
    name: "Ray-Ban Erika RB4171",
    slug: "erika-rb4171",
    description: "Marco redondeado femenino, uno de los modelos mas vendidos.",
    collection: "Classic",
    categorySlug: "redondo",
    basePrice: 165000,
    featured: false,
    imageBg: "8B5A2B/ffffff",
    variants: [
      { colorName: "Habana", colorHex: "#8B5A2B", lensColor: "Marron degrade", stock: 9 },
      { colorName: "Negro", colorHex: "#111111", lensColor: "Gris degrade", stock: 6 },
    ],
  },
  {
    name: "Ray-Ban Hexagonal RB3548",
    slug: "hexagonal-rb3548",
    description: "Marco hexagonal delgado, estetica retro-futurista.",
    collection: "Classic",
    categorySlug: "cuadrado",
    basePrice: 170000,
    featured: false,
    imageBg: "C0C0C0/111111",
    variants: [{ colorName: "Plateado", colorHex: "#C0C0C0", lensColor: "Gris", stock: 8 }],
  },
  {
    name: "Ray-Ban New Wayfarer RB2132",
    slug: "new-wayfarer-rb2132",
    description: "Version actualizada del Wayfarer clasico, marco mas curvo y comodo.",
    collection: "Signature",
    categorySlug: "wayfarer",
    basePrice: 178000,
    featured: false,
    imageBg: "111111/8B5A2B",
    variants: [
      { colorName: "Negro", colorHex: "#111111", lensColor: "Verde G-15", stock: 13 },
      { colorName: "Habana", colorHex: "#8B5A2B", lensColor: "Marron degrade", stock: 8 },
    ],
  },
  {
    name: "Ray-Ban RB4386-M Ferrari Square",
    slug: "rb4386m-ferrari-square",
    description: "Marco cuadrado bold de la coleccion Scuderia Ferrari, terminacion mate.",
    collection: "Ferrari",
    categorySlug: "cuadrado",
    basePrice: 295000,
    featured: true,
    imageBg: "111111/E8000D",
    variants: [{ colorName: "Negro mate / Rojo Ferrari", colorHex: "#111111", lensColor: "Gris polarizado", stock: 5 }],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, order: c.order },
      create: c,
    });
  }

  for (const p of PRODUCTS) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: p.categorySlug } });

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        collection: p.collection,
        basePrice: p.basePrice,
        featured: p.featured,
        categoryId: category.id,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        collection: p.collection,
        basePrice: p.basePrice,
        featured: p.featured,
        categoryId: category.id,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `https://placehold.co/800x600/${p.imageBg}?text=${encodeURIComponent(p.name.split(" ").slice(0, 3).join(" "))}`,
        order: 0,
      },
    });

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    for (const v of p.variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          colorName: v.colorName,
          colorHex: v.colorHex,
          lensColor: v.lensColor,
          sku: `${p.slug}-${v.colorName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          stock: v.stock,
          priceDelta: v.priceDelta ?? 0,
        },
      });
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@visionequis.com.ar";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "cambiar123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: "Admin Vision Equis" },
    create: { email: adminEmail, passwordHash, name: "Admin Vision Equis" },
  });

  console.log(`Seed complete. Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
