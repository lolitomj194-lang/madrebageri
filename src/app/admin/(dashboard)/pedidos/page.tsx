import { redirect } from "next/navigation";

// Los pedidos web ahora viven junto a las ventas de todos los canales.
export default function LegacyOrdersPage() {
  redirect("/admin/ventas");
}
