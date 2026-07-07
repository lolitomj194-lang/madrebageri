export type CreateOrderItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type CreateOrderRequest = {
  customerName: string;
  phone: string;
  email?: string;
  shippingMethod: "ENVIO" | "RETIRO_LOCAL";
  address?: string;
  city?: string;
  province?: string;
  paymentMethod: "MERCADOPAGO" | "TRANSFERENCIA" | "EFECTIVO";
  notes?: string;
  items: CreateOrderItem[];
};
