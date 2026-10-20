// Tipos y validacion del formulario de productos del admin, compartidos por
// las rutas de crear y editar.

export type VariantInput = {
  id?: string; // presente cuando se edita una tela existente
  name: string;
  imageUrl?: string | null;
  stock: number;
  priceDelta?: number;
  active?: boolean;
};

export type RecipeInput = {
  materialId: string;
  quantity: number;
};

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  cashPrice?: number | null;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
  categoryId: string;
  featured: boolean;
  active: boolean;
  images: { url: string }[];
  variants: VariantInput[];
  laborMinutes?: number;
  materials?: RecipeInput[];
};

export function validateProductInput(body: ProductInput): string | null {
  if (!body.name?.trim() || !body.categoryId || body.price == null) {
    return "Faltan datos obligatorios (nombre, categoría o precio)";
  }
  if (Number(body.price) <= 0) return "El precio debe ser mayor a 0";
  if (!body.variants?.length) return "Agregá al menos una tela/diseño";
  if (body.variants.some((v) => !v.name?.trim())) {
    return "Cada tela necesita un nombre";
  }
  const hasWholesalePrice = body.wholesalePrice != null && body.wholesalePrice !== 0;
  const hasWholesaleQty = body.wholesaleMinQty != null && body.wholesaleMinQty !== 0;
  if (hasWholesalePrice !== hasWholesaleQty) {
    return "Para mayorista completá precio Y cantidad mínima (o ninguno)";
  }
  if (body.materials?.some((m) => !m.materialId || !(Number(m.quantity) > 0))) {
    return "Cada material de la receta necesita una cantidad mayor a 0";
  }
  return null;
}

// Receta sin duplicados y con numeros limpios.
export function normalizeRecipe(materials: RecipeInput[] | undefined) {
  const byId = new Map<string, number>();
  for (const m of materials ?? []) {
    byId.set(m.materialId, (byId.get(m.materialId) ?? 0) + Number(m.quantity));
  }
  return [...byId.entries()].map(([materialId, quantity]) => ({ materialId, quantity }));
}
