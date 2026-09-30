// Logica de precios compartida entre el carrito (cliente) y la API de
// pedidos (servidor). El servidor SIEMPRE recalcula: nunca se confia en el
// precio que manda el navegador.

export type ProductPricing = {
  price: number; // minorista lista (tarjeta / Mercado Pago)
  cashPrice: number | null; // minorista efectivo/transferencia
  wholesalePrice: number | null; // mayorista por unidad
  wholesaleMinQty: number | null; // unidades minimas para mayorista
};

export function hasWholesale(p: ProductPricing) {
  return p.wholesalePrice != null && p.wholesaleMinQty != null && p.wholesaleMinQty > 0;
}

// Precio unitario final para una cantidad dada de un mismo producto.
// El mayorista se activa por cantidad y aplica igual para cualquier medio de
// pago (ya es un precio "de reventa"). El precio efectivo solo aplica al
// minorista.
export function computeUnitPrice(
  p: ProductPricing,
  priceDelta: number,
  quantity: number,
  isCashPayment: boolean
): { unitPrice: number; isWholesale: boolean } {
  if (hasWholesale(p) && quantity >= (p.wholesaleMinQty as number)) {
    return { unitPrice: (p.wholesalePrice as number) + priceDelta, isWholesale: true };
  }
  const base = isCashPayment ? (p.cashPrice ?? p.price) : p.price;
  return { unitPrice: base + priceDelta, isWholesale: false };
}
