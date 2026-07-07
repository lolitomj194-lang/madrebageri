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
  { name: "Hexagonal", slug: "hexagonal", order: 7 },
  { name: "Deportivo", slug: "deportivo", order: 8 },
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
  cashPrice?: number | null;
  featured: boolean;
  imageBg?: string;
  imageUrl?: string;
  variants: SeedVariant[];
};

// NOTE: Placeholder catalog for development. Replace with the real Ray-Ban
// product list, prices and photos via the admin panel before going live.
const PRODUCTS: SeedProduct[] = [
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
    categorySlug: "hexagonal",
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
];

// Real Ray-Ban x Scuderia Ferrari inventory, extracted from the seller's own
// product photos (reference codes read from the Ferrari box tags). basePrice
// is a placeholder (needs the real price list) - update from the admin panel.
const FERRARI_PENDING_PRICE = 0;

function ferrariProduct(
  name: string,
  refCode: string,
  categorySlug: string,
  colorName: string,
  colorHex: string,
  lensColor: string | undefined,
  imageFile: string
): SeedProduct {
  const slug = imageFile.replace(/\.jpg$/, "");
  return {
    name: `${name}${refCode ? ` ${refCode}` : ""}`,
    slug,
    description: `Ray-Ban para Scuderia Ferrari. ${refCode ? `Codigo de referencia: ${refCode}.` : ""} Producto original, incluye caja, funda y certificado de autenticidad Ferrari.`,
    collection: "Ferrari",
    categorySlug,
    basePrice: FERRARI_PENDING_PRICE,
    featured: false,
    imageUrl: `/products/ferrari/${imageFile}`,
    variants: [{ colorName, colorHex, lensColor, stock: 1 }],
  };
}

const NEGRO = "#1c1c1c";
const DORADO = "#c9a227";
const PLATEADO = "#b6b6b6";
const PLATEADO_OSCURO = "#4b4b4b";
const CAREY = "#8b5a2b";
const AZUL = "#1f3a5f";
const ROJO = "#e8000d";

const FERRARI_PRODUCTS: SeedProduct[] = [
  ferrariProduct("Wayfarer Ferrari", "4195-M F602/71", "wayfarer", "Negro", NEGRO, "Verde polarizado", "wayfarer-negro-verde-polarizado.jpg"),
  ferrariProduct("Scuderia Collection", "3674-M F031/71", "cuadrado", "Dorado", DORADO, "Verde", "scuderia-dorado-verde-01.jpg"),
  ferrariProduct("Scuderia Collection", "3674-M F029/A2", "cuadrado", "Dorado / Carey", CAREY, undefined, "scuderia-dorado-carey-01.jpg"),
  ferrariProduct("Aviador Ferrari", "8313-MF F008/13", "aviador", "Dorado", DORADO, "Marron degrade", "aviador-dorado-marron-degrade.jpg"),
  ferrariProduct("Ferrari Envolvente", "", "deportivo", "Negro (patilla roja)", NEGRO, "Azul", "envolvente-negro-azul-patilla-roja.jpg"),
  ferrariProduct("Hexagonal Ferrari", "3548-M F007/3F", "hexagonal", "Plateado", PLATEADO, "Azul degrade", "hexagonal-plateado-azul-degrade.jpg"),
  ferrariProduct("Aviador Ferrari", "8313-MF F003/H", "aviador", "Negro", NEGRO, "Azul espejado", "aviador-negro-azul-espejado.jpg"),
  ferrariProduct("Cats Ferrari", "4125 MF F601/9A", "aviador", "Negro", NEGRO, "Azul degrade", "cats-negro-azul-degrade.jpg"),
  ferrariProduct("Scuderia Collection", "3674 F007/71", "cuadrado", "Plateado oscuro", PLATEADO_OSCURO, "Azulada", "scuderia-plateado-oscuro-azulada.jpg"),
  ferrariProduct("Ferrari 3703-M", "F029/13", "cuadrado", "Dorado / Carey", CAREY, undefined, "3703m-dorado-carey.jpg"),
  ferrariProduct("Ferrari 3703-M", "F007/71", "cuadrado", "Plateado", PLATEADO, "Verde", "3703m-plateado-verde.jpg"),
  ferrariProduct("Scuderia Collection", "3674-M F007/71", "cuadrado", "Plateado", PLATEADO, "Verde", "scuderia-plateado-verde.jpg"),
  ferrariProduct("Double Bridge Ferrari", "3647-MF F029/3F", "redondo", "Dorado / Rojo", ROJO, "Azul degrade", "doublebridge-dorado-rojo-azul-degrade.jpg"),
  ferrariProduct("Scuderia Collection", "3674-M F028/6G", "cuadrado", "Negro", NEGRO, "Gris degrade", "scuderia-negro-gris-degrade.jpg"),
  ferrariProduct("Hexagonal Ferrari", "3548-M F002/62", "hexagonal", "Negro", NEGRO, "Verde", "hexagonal-negro-verde.jpg"),
  ferrariProduct("Aviador Ferrari", "8313-M F008/71", "aviador", "Dorado", DORADO, "Verde", "aviador-dorado-verde.jpg"),
  ferrariProduct("Double Bridge Ferrari", "3647-MF F002/R5", "redondo", "Negro", NEGRO, "Verde", "doublebridge-negro-verde.jpg"),
  ferrariProduct("Aviador Ferrari", "8313-MF F009/6G", "aviador", "Negro / Plateado", PLATEADO_OSCURO, "Espejado", "aviador-negro-plateado-espejado.jpg"),
  ferrariProduct("Scuderia Collection", "3674-M F028/71", "cuadrado", "Negro", NEGRO, "Verde", "scuderia-negro-verde-01.jpg"),
  ferrariProduct("Cats Ferrari", "4125 MF F601/87", "aviador", "Negro", NEGRO, "Verde", "cats-negro-verde.jpg"),
  ferrariProduct("Scuderia Collection", "3674-M F031/71", "cuadrado", "Dorado / Carey", CAREY, "Verde", "scuderia-dorado-carey-verde-02.jpg"),
  ferrariProduct("Wayfarer Ferrari", "4195-M F604/H0", "wayfarer", "Azul", AZUL, "Azul espejado polarizado", "wayfarer-azul-polarizado.jpg"),
  ferrariProduct("Cats Ferrari", "4125 MF F668/13", "aviador", "Carey", CAREY, "Marron degrade", "cats-carey-marron-degrade.jpg"),
  ferrariProduct("Round Fleck Ferrari", "2448 601", "redondo", "Negro", NEGRO, "Verde", "roundfleck-negro-verde.jpg"),
  ferrariProduct("Scuderia Collection", "3674-M F030/11", "cuadrado", "Plateado oscuro", PLATEADO_OSCURO, "Gris degrade", "scuderia-plateado-gris-degrade.jpg"),
  ferrariProduct("Hexagonal Ferrari", "3548-M F008/31", "hexagonal", "Dorado", DORADO, "Verde", "hexagonal-dorado-verde.jpg"),
  ferrariProduct("Aviador Ferrari", "8313-MF F002/32", "aviador", "Negro", NEGRO, "Gris degrade", "aviador-negro-gris-degrade.jpg"),
  ferrariProduct("Aviador Ferrari", "8313-M F001/71", "aviador", "Negro", NEGRO, "Verde", "aviador-negro-verde.jpg"),
  ferrariProduct("Round Fleck Ferrari", "2448 601S/30", "redondo", "Negro", NEGRO, "Azul espejado", "roundfleck-azul-espejado.jpg"),
];

PRODUCTS.push(...FERRARI_PRODUCTS);

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
        cashPrice: p.cashPrice ?? null,
        featured: p.featured,
        categoryId: category.id,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        collection: p.collection,
        basePrice: p.basePrice,
        cashPrice: p.cashPrice ?? null,
        featured: p.featured,
        categoryId: category.id,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url:
          p.imageUrl ??
          `https://placehold.co/800x600/${p.imageBg}?text=${encodeURIComponent(p.name.split(" ").slice(0, 3).join(" "))}`,
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
