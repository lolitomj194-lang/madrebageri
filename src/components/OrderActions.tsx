"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, type CartLine } from "@/lib/cart-store";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

export function OrderActions({
  orderNumber,
  whatsappUrl,
  token,
  whatsappConfigured,
}: {
  orderNumber: string;
  whatsappUrl: string | null;
  token: string;
  whatsappConfigured: boolean;
}) {
  const router = useRouter();
  const addMany = useCartStore((s) => s.addMany);
  const [copied, setCopied] = useState(false);
  const [repeatMsg, setRepeatMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard no disponible */
    }
  }

  async function repeat() {
    setLoading(true);
    setRepeatMsg(null);
    try {
      const res = await fetch(`/api/orders/${token}/repeat`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const lines: { line: Omit<CartLine, "quantity">; quantity: number }[] = data.lines;
      if (!lines.length) {
        setRepeatMsg("Ninguno de los productos de este pedido está disponible hoy.");
        return;
      }
      addMany(lines);
      if (data.unavailable?.length) {
        setRepeatMsg(`Se agregaron al carrito con precios actuales. No disponibles: ${data.unavailable.join(", ")}.`);
      } else {
        router.push("/checkout");
      }
    } catch {
      setRepeatMsg("No se pudo repetir el pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {whatsappUrl ? (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          <WhatsAppIcon className="h-5 w-5 fill-white" /> Enviar / reabrir en WhatsApp
        </a>
      ) : (
        !whatsappConfigured && (
          <span className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">WhatsApp comercial aún no configurado: te contactaremos nosotros.</span>
        )
      )}
      <button type="button" onClick={copy} className="btn btn-outline">
        {copied ? "¡Copiado!" : `Copiar ${orderNumber}`}
      </button>
      <button type="button" onClick={repeat} disabled={loading} className="btn btn-dark">
        {loading ? "Cargando…" : "Repetir este pedido"}
      </button>
      {repeatMsg && <p className="w-full text-xs text-brand-ash">{repeatMsg}</p>}
    </div>
  );
}
