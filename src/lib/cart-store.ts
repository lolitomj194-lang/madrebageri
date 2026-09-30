import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeUnitPrice, type ProductPricing } from "@/lib/pricing";

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantLabel: string;
  image: string;
  pricing: ProductPricing;
  priceDelta: number;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          const nextQty = Math.min(existing.quantity + quantity, existing.maxStock);
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: nextQty } : i
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, quantity: Math.min(quantity, item.maxStock) }],
          });
        }
        set({ isOpen: true });
      },
      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },
      setQuantity: (variantId, quantity) => {
        set({
          items: get().items
            .map((i) =>
              i.variantId === variantId
                ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                : i
            )
            .filter((i) => i.quantity > 0),
        });
      },
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    { name: "aygloriabendita-cart" }
  )
);

// La cantidad que define el mayorista es la suma de unidades del MISMO
// producto en el carrito (distintas telas suman juntas).
export function productQuantity(items: CartItem[], productId: string) {
  return items
    .filter((i) => i.productId === productId)
    .reduce((sum, i) => sum + i.quantity, 0);
}

export function itemUnitPrice(items: CartItem[], item: CartItem, isCashPayment: boolean) {
  return computeUnitPrice(
    item.pricing,
    item.priceDelta,
    productQuantity(items, item.productId),
    isCashPayment
  );
}

export function cartTotal(items: CartItem[], isCashPayment = false) {
  return items.reduce(
    (sum, i) => sum + itemUnitPrice(items, i, isCashPayment).unitPrice * i.quantity,
    0
  );
}

export function cartHasWholesale(items: CartItem[], isCashPayment = false) {
  return items.some((i) => itemUnitPrice(items, i, isCashPayment).isWholesale);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
