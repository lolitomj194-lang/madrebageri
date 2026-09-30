export type CreateOrderItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type CreateOrderRequest = {
  customerName: string;
  phone: string;
  email?: string;
  shippingMethod: "ENVIO_NACIONAL" | "RETIRO";
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  paymentMethod: "MERCADOPAGO" | "TRANSFERENCIA" | "EFECTIVO";
  notes?: string;
  items: CreateOrderItem[];
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PREPARING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const PAYMENT_LABELS: Record<string, string> = {
  MERCADOPAGO: "Mercado Pago",
  TRANSFERENCIA: "Transferencia",
  EFECTIVO: "Efectivo",
};

export const SHIPPING_LABELS: Record<string, string> = {
  ENVIO_NACIONAL: "Envío a domicilio",
  RETIRO: "Retiro / entrega en persona",
};
