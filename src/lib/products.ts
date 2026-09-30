import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const productInclude = {
  images: { orderBy: { order: "asc" as const } },
  variants: { orderBy: { order: "asc" as const } },
  category: true,
};

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export type CatalogFilters = {
  categorySlug?: string;
  search?: string;
  sort?: "relevancia" | "precio-asc" | "precio-desc" | "nuevo";
};

export async function getCatalog(filters: CatalogFilters) {
  const where: Prisma.ProductWhereInput = { active: true };

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "precio-asc"
      ? { price: "asc" }
      : filters.sort === "precio-desc"
        ? { price: "desc" }
        : filters.sort === "nuevo"
          ? { createdAt: "desc" }
          : { featured: "desc" };

  return prisma.product.findMany({ where, include: productInclude, orderBy });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: { categoryId, active: true, id: { not: excludeId } },
    include: productInclude,
    take: 4,
  });
}

// Stock total disponible de un producto entre sus telas activas.
export function availableStock(product: { variants: { stock: number; active: boolean }[] }) {
  return product.variants
    .filter((v) => v.active)
    .reduce((sum, v) => sum + v.stock, 0);
}

export function firstImage(product: {
  images: { url: string }[];
  variants: { imageUrl: string | null; active: boolean }[];
}) {
  return (
    product.images[0]?.url ??
    product.variants.find((v) => v.active && v.imageUrl)?.imageUrl ??
    "/placeholder-product.svg"
  );
}
