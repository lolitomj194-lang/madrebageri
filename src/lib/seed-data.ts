/**
 * DATOS DE EJEMPLO para probar la plataforma de punta a punta.
 * Los precios, pesos y combos son ilustrativos y deben reemplazarse desde el panel
 * administrativo con los valores reales de ENTRE CORTES antes de publicar.
 */
import bcrypt from "bcryptjs";
import type { PrismaClient } from "@/generated/prisma/client";
import type { AsadoRole, SaleUnit, PriceMode, Tier } from "@/generated/prisma/enums";
import { slugify } from "@/lib/slugify";

type SeedProduct = {
  name: string;
  category: string;
  description: string;
  role: AsadoRole;
  tier?: Tier;
  saleUnit?: SaleUnit;
  priceMode?: PriceMode;
  pricePerKg?: number;
  fixedPrice?: number;
  portion?: [min: number, max: number, ref: number];
  unitGrams?: number;
  unitLabel?: string;
  suggestedPerPerson?: number;
  minQuantity?: number;
  featured?: boolean;
  recommendable?: boolean;
  image?: string;
};

const CATEGORIES: { name: string; slug: string; role: AsadoRole; description: string }[] = [
  { name: "Cortes clásicos", slug: "cortes-clasicos", role: "CARNE", description: "Los infaltables de todo asado." },
  { name: "Cortes premium", slug: "cortes-premium", role: "CARNE", description: "Para una parrilla de otro nivel." },
  { name: "Achuras y embutidos", slug: "achuras-y-embutidos", role: "ACHURA", description: "La picada de la parrilla." },
  { name: "Todo para el fuego", slug: "todo-para-el-fuego", role: "FUEGO", description: "Leña, carbón y lo que hace falta para prender." },
  { name: "Acompañamientos", slug: "acompanamientos", role: "EXTRA", description: "Sal, salsas y extras." },
];

const PRODUCTS: SeedProduct[] = [
  // Cortes clásicos (precios por kg DE EJEMPLO)
  { name: "Vacío", category: "cortes-clasicos", role: "CARNE", tier: "CLASICO", pricePerKg: 13900, portion: [450, 600, 500], description: "Tierno, jugoso y con sabor intenso. El clásico que nunca falla a fuego medio.", featured: true },
  { name: "Costilla", category: "cortes-clasicos", role: "CARNE", tier: "ECONOMICO", pricePerKg: 9900, portion: [500, 650, 550], description: "Costilla ancha para cocinar despacio y servir bien dorada.", featured: true },
  { name: "Tira de asado", category: "cortes-clasicos", role: "CARNE", tier: "CLASICO", pricePerKg: 11900, portion: [450, 600, 500], description: "Tira de asado de corte mediano, ideal para la parrilla.", featured: true },
  { name: "Matambre", category: "cortes-clasicos", role: "CARNE", tier: "CLASICO", pricePerKg: 12500, portion: [350, 450, 400], description: "Fino y sabroso. Perfecto a la parrilla o a la pizza." },
  { name: "Tapa de asado", category: "cortes-clasicos", role: "CARNE", tier: "ECONOMICO", pricePerKg: 9500, portion: [450, 600, 500], description: "Corte económico y muy rendidor para la parrilla." },
  { name: "Falda", category: "cortes-clasicos", role: "CARNE", tier: "ECONOMICO", pricePerKg: 7900, portion: [450, 600, 500], description: "Sabor fuerte y precio accesible. Ideal para asados grandes." },
  // Cortes premium
  { name: "Entraña", category: "cortes-premium", role: "CARNE", tier: "PREMIUM", pricePerKg: 19900, portion: [300, 400, 350], description: "Corte fino y jugoso, listo en pocos minutos a fuego fuerte.", featured: true },
  { name: "Bife de chorizo", category: "cortes-premium", role: "CARNE", tier: "PREMIUM", pricePerKg: 18900, portion: [350, 450, 400], description: "Bife ancho con buen marmolado. Un clásico de parrilla premium." },
  { name: "Ojo de bife", category: "cortes-premium", role: "CARNE", tier: "PREMIUM", pricePerKg: 21900, portion: [350, 450, 400], description: "Terneza y sabor en su máxima expresión." },
  { name: "Picaña", category: "cortes-premium", role: "CARNE", tier: "PREMIUM", pricePerKg: 17900, portion: [350, 450, 400], description: "Con su capa de grasa que la hace única en la parrilla." },
  { name: "Lomo", category: "cortes-premium", role: "CARNE", tier: "PREMIUM", pricePerKg: 22900, portion: [300, 400, 350], description: "El corte más tierno. Para los que buscan algo especial.", recommendable: false },
  // Achuras y embutidos
  { name: "Chorizo", category: "achuras-y-embutidos", role: "EMBUTIDO", tier: "CLASICO", saleUnit: "UNIT", priceMode: "FIXED", fixedPrice: 1500, unitGrams: 120, unitLabel: "unidad", suggestedPerPerson: 1, minQuantity: 2, description: "Chorizo puro cerdo de elaboración artesanal.", featured: true },
  { name: "Morcilla", category: "achuras-y-embutidos", role: "EMBUTIDO", tier: "CLASICO", saleUnit: "UNIT", priceMode: "FIXED", fixedPrice: 1300, unitGrams: 120, unitLabel: "unidad", suggestedPerPerson: 0.5, minQuantity: 2, description: "Morcilla casera, suave y bien condimentada." },
  { name: "Mollejas", category: "achuras-y-embutidos", role: "ACHURA", tier: "PREMIUM", pricePerKg: 16900, portion: [200, 300, 250], description: "Mollejas de corazón, doradas y crocantes." },
  { name: "Chinchulines", category: "achuras-y-embutidos", role: "ACHURA", tier: "CLASICO", pricePerKg: 8900, portion: [200, 300, 250], description: "Trenzados y listos para la parrilla." },
  { name: "Riñones", category: "achuras-y-embutidos", role: "ACHURA", tier: "ECONOMICO", pricePerKg: 6900, portion: [200, 300, 250], description: "Riñón limpio y cortado, para los fanáticos de las achuras." },
  { name: "Provoleta", category: "achuras-y-embutidos", role: "EXTRA", tier: "CLASICO", saleUnit: "UNIT", priceMode: "FIXED", fixedPrice: 3200, unitGrams: 200, unitLabel: "unidad", suggestedPerPerson: 0.25, description: "Provoleta de 200 g con orégano para empezar el asado." },
  // Todo para el fuego
  { name: "Leña", category: "todo-para-el-fuego", role: "FUEGO", saleUnit: "PACKAGE", priceMode: "FIXED", fixedPrice: 4500, unitLabel: "bolsa", description: "Bolsa de leña dura seca. Ideal para asados largos.", image: "lena" },
  { name: "Carbón", category: "todo-para-el-fuego", role: "FUEGO", saleUnit: "PACKAGE", priceMode: "FIXED", fixedPrice: 5900, unitLabel: "bolsa", description: "Bolsa de carbón vegetal de 4 kg. Prende rápido y dura.", featured: true, image: "carbon" },
  { name: "Prendefácil", category: "todo-para-el-fuego", role: "FUEGO", saleUnit: "UNIT", priceMode: "FIXED", fixedPrice: 1200, unitLabel: "unidad", description: "Pastillas para encender el fuego sin vueltas.", image: "prendefacil" },
  // Acompañamientos
  { name: "Sal parrillera", category: "acompanamientos", role: "ACCESORIO", saleUnit: "PACKAGE", priceMode: "FIXED", fixedPrice: 1800, unitLabel: "paquete", description: "Sal gruesa parrillera, 1 kg.", image: "sal-parrillera" },
  { name: "Chimichurri", category: "acompanamientos", role: "ACCESORIO", saleUnit: "UNIT", priceMode: "FIXED", fixedPrice: 2500, unitLabel: "frasco", description: "Chimichurri casero, frasco de 250 ml.", image: "chimichurri" },
  { name: "Salsa criolla", category: "acompanamientos", role: "ACCESORIO", saleUnit: "UNIT", priceMode: "FIXED", fixedPrice: 2500, unitLabel: "frasco", description: "Salsa criolla fresca, frasco de 250 ml.", image: "salsa-criolla" },
];

type SeedCombo = {
  name: string;
  description: string;
  pricing: "FIXED" | "PER_PERSON";
  price: number;
  compareAtPrice?: number;
  persons: number;
  maxPersons?: number;
  badge?: string;
  featured?: boolean;
  image: string;
  items: [product: string, quantity: number, note?: string][];
};

const COMBOS: SeedCombo[] = [
  { name: "Combo Asado Económico", description: "Costilla, tapa de asado y chorizos. Rendidor y sin vueltas.", pricing: "FIXED", price: 29900, persons: 4, image: "economico", items: [["Costilla", 2], ["Tapa de asado", 2], ["Chorizo", 4]] },
  { name: "Combo Asado Clásico", description: "Vacío, tira de asado, chorizos y morcillas. El asado de siempre.", pricing: "FIXED", price: 42900, compareAtPrice: 45900, persons: 4, badge: "Más pedido", featured: true, image: "clasico", items: [["Vacío", 2], ["Tira de asado", 2], ["Chorizo", 4], ["Morcilla", 2]] },
  { name: "Combo Asado Premium", description: "Entraña, bife de chorizo, mollejas y chorizos para una parrilla de lujo.", pricing: "FIXED", price: 64900, persons: 4, badge: "Premium", featured: true, image: "premium", items: [["Entraña", 2], ["Bife de chorizo", 2], ["Mollejas", 1], ["Chorizo", 4]] },
  { name: "Combo Asado para Dos", description: "Lo justo para dos: entraña, chorizos y una provoleta.", pricing: "FIXED", price: 23900, persons: 2, image: "para-dos", items: [["Entraña", 2], ["Chorizo", 2], ["Provoleta", 1]] },
  { name: "Combo Asado Familiar", description: "Se arma por persona: vacío, costilla, chorizo y morcilla para toda la familia.", pricing: "PER_PERSON", price: 9900, persons: 6, maxPersons: 20, featured: true, image: "familiar", items: [["Vacío", 0.5], ["Costilla", 0.5], ["Chorizo", 1], ["Morcilla", 0.5]] },
  { name: "Combo Asado de Amigos", description: "Para juntadas grandes: tira de asado, vacío, chinchulines y chorizos por persona.", pricing: "PER_PERSON", price: 10900, persons: 8, maxPersons: 30, image: "amigos", items: [["Tira de asado", 0.5], ["Vacío", 0.5], ["Chinchulines", 0.25], ["Chorizo", 1]] },
  { name: "Combo Parrillero Completo", description: "Asado clásico para 4 más carbón, sal parrillera y chimichurri. Solo falta el fuego.", pricing: "FIXED", price: 52900, persons: 4, badge: "Todo incluido", image: "parrillero-completo", items: [["Vacío", 2], ["Tira de asado", 2], ["Chorizo", 4], ["Carbón", 1], ["Sal parrillera", 1], ["Chimichurri", 1]] },
];

export async function runSeed(prisma: PrismaClient) {
  // Categorias
  const categoryIds: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, role: c.role, description: c.description, order: i },
      create: { ...c, order: i },
    });
    categoryIds[c.slug] = cat.id;
  }

  // Productos
  const productIds: Record<string, string> = {};
  for (const [i, p] of PRODUCTS.entries()) {
    const slug = slugify(p.name);
    const saleUnit = p.saleUnit ?? "PORTION";
    const data = {
      name: p.name,
      description: p.description,
      imageUrl: `/img/productos/${p.image ?? slug}.svg`,
      categoryId: categoryIds[p.category],
      role: p.role,
      tier: p.tier ?? "CLASICO",
      saleUnit,
      priceMode: p.priceMode ?? "PER_KG",
      pricePerKg: p.pricePerKg ?? null,
      fixedPrice: p.fixedPrice ?? null,
      portionMinGrams: p.portion?.[0] ?? null,
      portionMaxGrams: p.portion?.[1] ?? null,
      portionRefGrams: p.portion?.[2] ?? null,
      unitGrams: p.unitGrams ?? null,
      unitLabel: p.unitLabel ?? "porción",
      suggestedPerPerson: p.suggestedPerPerson ?? null,
      minQuantity: p.minQuantity ?? 1,
      featured: p.featured ?? false,
      recommendable: p.recommendable ?? true,
      order: i,
      active: true,
    };
    const prod = await prisma.product.upsert({ where: { slug }, update: data, create: { slug, ...data } });
    productIds[p.name] = prod.id;
  }

  // Combos
  for (const [i, c] of COMBOS.entries()) {
    const slug = slugify(c.name);
    const combo = await prisma.combo.upsert({
      where: { slug },
      update: {
        name: c.name, description: c.description, pricing: c.pricing, price: c.price, compareAtPrice: c.compareAtPrice ?? null,
        persons: c.persons, maxPersons: c.maxPersons ?? null, badge: c.badge ?? null, featured: c.featured ?? false,
        imageUrl: `/img/combos/${c.image}.svg`, order: i, active: true,
      },
      create: {
        slug, name: c.name, description: c.description, pricing: c.pricing, price: c.price, compareAtPrice: c.compareAtPrice ?? null,
        persons: c.persons, maxPersons: c.maxPersons ?? null, badge: c.badge ?? null, featured: c.featured ?? false,
        imageUrl: `/img/combos/${c.image}.svg`, order: i, active: true,
      },
    });
    await prisma.comboItem.deleteMany({ where: { comboId: combo.id } });
    await prisma.comboItem.createMany({
      data: c.items.map(([name, quantity, note], order) => ({ comboId: combo.id, productId: productIds[name], quantity, note: note ?? null, order })),
    });
  }

  // Zonas de ejemplo (Parana)
  const zones = [
    { name: "Centro y microcentro", neighborhoods: "Centro, Plaza Alvear, Puerto Viejo", fee: 2500, minOrder: 15000, freeShippingFrom: 60000 },
    { name: "Zona norte", neighborhoods: "Toma Nueva, Parque Urquiza, Bajada Grande, Thompson", fee: 3500, minOrder: 15000, freeShippingFrom: 70000 },
    { name: "Zona sur", neighborhoods: "San Agustin, Paracao, Anacleto Medina, Mosconi", fee: 3500, minOrder: 15000, freeShippingFrom: 70000 },
    { name: "Zona oeste", neighborhoods: "Lomas del Mirador, Los Arenales, Antartida Argentina, Las Flores", fee: 4000, minOrder: 20000, freeShippingFrom: 80000 },
  ];
  for (const [i, z] of zones.entries()) {
    const existing = await prisma.deliveryZone.findFirst({ where: { name: z.name } });
    if (existing) await prisma.deliveryZone.update({ where: { id: existing.id }, data: { ...z, order: i } });
    else await prisma.deliveryZone.create({ data: { ...z, order: i, active: true } });
  }

  // Horarios: miercoles a domingo
  for (const dayOfWeek of [0, 1, 2, 3, 4, 5, 6]) {
    const open = [0, 3, 4, 5, 6].includes(dayOfWeek);
    await prisma.openingHour.upsert({
      where: { dayOfWeek },
      update: {},
      create: { dayOfWeek, open, openTime: dayOfWeek === 0 ? "10:00" : "18:00", closeTime: dayOfWeek === 0 ? "14:00" : "23:00", slotMinutes: 60, slotCapacity: 6 },
    });
  }

  // Cupon de ejemplo
  await prisma.coupon.upsert({
    where: { code: "BIENVENIDO10" },
    update: {},
    create: { code: "BIENVENIDO10", description: "10% de descuento en tu primer pedido (cupón de ejemplo)", type: "PERCENT", value: 10, minTotal: 20000, active: true },
  });

  // Configuracion comercial y de la calculadora
  await prisma.businessSettings.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } });
  await prisma.calculatorSettings.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } });

  // Admin
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@entrecortes.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "cambiar123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, name: "Administrador" },
  });

  return { productCount: PRODUCTS.length, comboCount: COMBOS.length, adminEmail };
}
