import { MercadoPagoConfig, Preference } from "mercadopago";

export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return null;
  return new MercadoPagoConfig({ accessToken });
}

export function getPreferenceClient() {
  const client = getMercadoPagoClient();
  if (!client) return null;
  return new Preference(client);
}
