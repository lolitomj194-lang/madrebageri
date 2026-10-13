import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  /** "product:<id>" o "combo:<id>" */
  key: string;
  kind: "product" | "combo";
  id: string;
  slug: string;
  name: string;
  image?: string | null;
  /** "porcion", "unidad", "bolsa", "combo" o "persona" */
  unitLabel: string;
  unitPrice: number;
  quantity: number;
  minQuantity: number;
  estimated: boolean;
  portionMinGrams?: number | null;
  portionMaxGrams?: number | null;
  role?: string;
  /** Resumen de lo incluido en un combo. */
  summary?: string;
  /** Combos escalables: cantidad de personas elegida para este combo. */
  persons?: number;
};

export type AppliedCoupon = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minTotal: number;
};

type CartState = {
  items: CartLine[];
  coupon: AppliedCoupon | null;
  isOpen: boolean;
  addLine: (line: Omit<CartLine, "quantity">, quantity: number, open?: boolean) => void;
  addMany: (lines: { line: Omit<CartLine, "quantity">; quantity: number }[]) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,
      addLine: (line, quantity, open = true) => {
        const existing = get().items.find((i) => i.key === line.key);
        if (existing) {
          set({
            items: get().items.map((i) => (i.key === line.key ? { ...i, ...line, quantity: i.quantity + quantity } : i)),
          });
        } else {
          set({ items: [...get().items, { ...line, quantity: Math.max(quantity, line.minQuantity) }] });
        }
        if (open) set({ isOpen: true });
      },
      addMany: (lines) => {
        let items = [...get().items];
        for (const { line, quantity } of lines) {
          const idx = items.findIndex((i) => i.key === line.key);
          if (idx >= 0) {
            items[idx] = { ...items[idx], ...line, quantity: items[idx].quantity + quantity };
          } else {
            items = [...items, { ...line, quantity: Math.max(quantity, line.minQuantity) }];
          }
        }
        set({ items, isOpen: true });
      },
      setQuantity: (key, quantity) => {
        set({
          items: get()
            .items.map((i) => (i.key === key ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        });
      },
      removeLine: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      setCoupon: (coupon) => set({ coupon }),
      clear: () => set({ items: [], coupon: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    { name: "entrecortes-cart", version: 1 }
  )
);

export function cartSubtotal(items: CartLine[]) {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function cartCount(items: CartLine[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartDiscount(items: CartLine[], coupon: AppliedCoupon | null) {
  const subtotal = cartSubtotal(items);
  if (!coupon || subtotal < coupon.minTotal) return 0;
  if (coupon.type === "PERCENT") return Math.floor((subtotal * coupon.value) / 100);
  return Math.min(coupon.value, subtotal);
}

export function cartHasEstimates(items: CartLine[]) {
  return items.some((i) => i.estimated);
}

export function cartHasMeat(items: CartLine[]) {
  return items.some((i) => i.kind === "combo" || ["CARNE", "ACHURA", "EMBUTIDO"].includes(i.role ?? ""));
}

export function cartHasFire(items: CartLine[]) {
  return items.some((i) => i.role === "FUEGO");
}
