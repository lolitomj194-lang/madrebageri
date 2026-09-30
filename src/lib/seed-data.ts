import bcrypt from "bcryptjs";
import type { PrismaClient } from "@/generated/prisma/client";

// Catalogo de EJEMPLO para probar la tienda de punta a punta. Los productos,
// telas, fotos (placeholders) y precios se reemplazan desde el panel admin
// con el catalogo real.

type SeedVariant = {
  name: string;
  color: string; // color del placeholder
  stock: number;
  priceDelta?: number;
};

type SeedProduct = {
  name: string;
  category: string;
  description: string;
  price: number;
  cashPrice?: number;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  featured?: boolean;
  variants: SeedVariant[];
};

const CATEGORIES = [
  "Almohadones",
  "Blanquería",
  "Carteras y Bolsos",
  "Materos",
  "Cocina y Mesa",
];

const PRODUCTS: SeedProduct[] = [
  {
    name: "Almohadón 40x40 con cierre",
    category: "Almohadones",
    description:
      "Almohadón decorativo de 40x40 cm con cierre invisible, funda desmontable y relleno vellón siliconado incluido. Elegí la tela entre los diseños disponibles.",
    price: 18000,
    cashPrice: 16500,
    wholesalePrice: 13500,
    wholesaleMinQty: 10,
    featured: true,
    variants: [
      { name: "Floral terracota", color: "c96f4a", stock: 8 },
      { name: "Lino natural", color: "d9c9a3", stock: 12 },
      { name: "Hojas verde salvia", color: "9caf88", stock: 6 },
      { name: "Rayas crudo y negro", color: "8a8578", stock: 4 },
    ],
  },
  {
    name: "Almohadón 50x50 premium",
    category: "Almohadones",
    description:
      "Almohadón de 50x50 cm en telas de tapicería pesada, ideal para sillones. Funda con cierre y relleno incluido.",
    price: 24000,
    cashPrice: 22000,
    wholesalePrice: 18000,
    wholesaleMinQty: 8,
    featured: true,
    variants: [
      { name: "Pana caramelo", color: "b5793c", stock: 5 },
      { name: "Tusor crudo", color: "e3d7bd", stock: 7 },
      { name: "Jacquard geométrico", color: "6e7d8a", stock: 3 },
    ],
  },
  {
    name: "Juego de sábanas 2 plazas",
    category: "Blanquería",
    description:
      "Juego de sábanas de 2 plazas: sábana bajera ajustable, encimera y dos fundas de almohada. Algodón suave, los estampados varían según disponibilidad.",
    price: 52000,
    cashPrice: 48000,
    wholesalePrice: 41000,
    wholesaleMinQty: 5,
    featured: true,
    variants: [
      { name: "Flores acuarela", color: "c9a3b8", stock: 4 },
      { name: "Liso arena", color: "ded3b8", stock: 6 },
      { name: "Rayas grises", color: "a7a7a7", stock: 2 },
    ],
  },
  {
    name: "Pie de cama matelaseado",
    category: "Blanquería",
    description:
      "Pie de cama matelaseado de 2 plazas, reversible. Suma color y abrigo sin recargar. Consultá medidas especiales por WhatsApp.",
    price: 46000,
    cashPrice: 43000,
    variants: [
      { name: "Terracota liso", color: "b3562e", stock: 3 },
      { name: "Verde seco", color: "7d8a6a", stock: 2 },
    ],
  },
  {
    name: "Funda de acolchado queen",
    category: "Blanquería",
    description:
      "Funda de acolchado queen con botones, reversible, en telas de algodón estampado. Incluye dos fundas de almohadón.",
    price: 68000,
    cashPrice: 63000,
    variants: [
      { name: "Botánico crudo", color: "cdd1b4", stock: 2 },
      { name: "Geométrico tostado", color: "c2925f", stock: 3 },
    ],
  },
  {
    name: "Cartera bandolera mediana",
    category: "Carteras y Bolsos",
    description:
      "Bandolera mediana con correa regulable, forro interno con bolsillo y cierre metálico. Combina tela de tapicería con base de cuerina.",
    price: 38000,
    cashPrice: 35000,
    wholesalePrice: 28500,
    wholesaleMinQty: 6,
    featured: true,
    variants: [
      { name: "Pana bordó", color: "7b2d3b", stock: 4 },
      { name: "Yute natural", color: "c7b299", stock: 5 },
      { name: "Flores vintage", color: "a98ca3", stock: 2 },
    ],
  },
  {
    name: "Tote grande de tela",
    category: "Carteras y Bolsos",
    description:
      "Bolso tote amplio, ideal para el día a día o la playa. Manijas reforzadas y bolsillo interno.",
    price: 30000,
    cashPrice: 27500,
    wholesalePrice: 22000,
    wholesaleMinQty: 6,
    variants: [
      { name: "Rayas marineras", color: "3d5a80", stock: 6 },
      { name: "Lona cruda", color: "e0d8c3", stock: 8 },
    ],
  },
  {
    name: "Matero clásico con bolsillos",
    category: "Materos",
    description:
      "Matero de tela reforzada con base rígida, bolsillos para termo, mate, yerbera y azucarera. Correa larga para llevar al hombro.",
    price: 34000,
    cashPrice: 31000,
    wholesalePrice: 25500,
    wholesaleMinQty: 6,
    featured: true,
    variants: [
      { name: "Azteca tostado", color: "b07d4f", stock: 7 },
      { name: "Verde militar", color: "5a6b4f", stock: 5 },
      { name: "Flores fondo negro", color: "4a3d4d", stock: 3 },
    ],
  },
  {
    name: "Matero + individuales de picnic",
    category: "Materos",
    description:
      "Combo matero con manta individual de picnic haciendo juego. Un regalo que sale siempre bien.",
    price: 42000,
    cashPrice: 39000,
    variants: [
      { name: "Cuadrillé rojo", color: "a63c3c", stock: 2 },
      { name: "Cuadrillé verde", color: "4f6b52", stock: 2 },
    ],
  },
  {
    name: "Set de individuales x4",
    category: "Cocina y Mesa",
    description:
      "Set de 4 individuales de tela con terminación en vivo contrastante. Lavables y resistentes al uso diario.",
    price: 16000,
    cashPrice: 14500,
    wholesalePrice: 11500,
    wholesaleMinQty: 10,
    variants: [
      { name: "Limones", color: "d9c75a", stock: 9 },
      { name: "Rayas naturales", color: "cfc3a8", stock: 6 },
    ],
  },
  {
    name: "Delantal de cocina premium",
    category: "Cocina y Mesa",
    description:
      "Delantal con bolsillo doble y tiras regulables, en telas de tapicería resistentes. Se puede bordar con nombre (consultar).",
    price: 19000,
    cashPrice: 17500,
    wholesalePrice: 14000,
    wholesaleMinQty: 8,
    variants: [
      { name: "Café y crema", color: "8c6d55", stock: 5 },
      { name: "Flores campestres", color: "b78fa3", stock: 4 },
    ],
  },
  {
    name: "Panera de tela con tapa",
    category: "Cocina y Mesa",
    description:
      "Panera de tela con estructura, tapa con abertura y lazo. Mantiene el pan cubierto y queda hermosa en la mesa.",
    price: 14000,
    cashPrice: 13000,
    variants: [
      { name: "Gallitos rústicos", color: "b05c43", stock: 6 },
      { name: "Liso crudo", color: "e6ddc8", stock: 7 },
    ],
  },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function placeholderImage(label: string, color: string) {
  return `https://placehold.co/900x900/${color}/fff9f0.png?text=${encodeURIComponent(label)}`;
}

export async function runSeed(prisma: PrismaClient) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@aygloriabendita.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "cambiar123";

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Gloria",
    },
  });

  const categoryBySlug = new Map<string, string>();
  for (const [index, name] of CATEGORIES.entries()) {
    const slug = slugify(name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: { order: index },
      create: { name, slug, order: index },
    });
    categoryBySlug.set(slug, category.id);
  }

  let productCount = 0;
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        cashPrice: p.cashPrice ?? null,
        wholesalePrice: p.wholesalePrice ?? null,
        wholesaleMinQty: p.wholesaleMinQty ?? null,
        featured: p.featured ?? false,
        categoryId: categoryBySlug.get(slugify(p.category))!,
        images: {
          create: [{ url: placeholderImage(p.name, p.variants[0].color), order: 0 }],
        },
        variants: {
          create: p.variants.map((v, i) => ({
            name: v.name,
            imageUrl: placeholderImage(v.name, v.color),
            stock: v.stock,
            priceDelta: v.priceDelta ?? 0,
            order: i,
          })),
        },
      },
    });
    productCount++;
  }

  return { productCount, adminEmail };
}
