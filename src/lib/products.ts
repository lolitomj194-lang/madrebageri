import { prisma } from "@/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    include: { images: { orderBy: { order: "asc" } }, variants: true, category: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export async function getFerrariProducts() {
  return prisma.product.findMany({
    where: { active: true, collection: "Ferrari" },
    include: { images: { orderBy: { order: "asc" } }, variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export type CatalogFilters = {
  categorySlug?: string;
  collection?: string;
  search?: string;
  sort?: "relevancia" | "precio-asc" | "precio-desc" | "nuevo";
};

export async function getCatalog(filters: CatalogFilters) {
  const where: Record<string, unknown> = { active: true };

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.collection) {
    where.collection = filters.collection;
  }
  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }

  const orderBy =
    filters.sort === "precio-asc"
      ? { basePrice: "asc" as const }
      : filters.sort === "precio-desc"
        ? { basePrice: "desc" as const }
        : filters.sort === "nuevo"
          ? { createdAt: "desc" as const }
          : { featured: "desc" as const };

  return prisma.product.findMany({
    where,
    include: { images: { orderBy: { order: "asc" } }, variants: true, category: true },
    orderBy,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: { categoryId, active: true, id: { not: excludeId } },
    include: { images: { orderBy: { order: "asc" } }, variants: true, category: true },
    take: 4,
  });
}
