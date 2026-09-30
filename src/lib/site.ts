// Configuracion de la tienda. Todo sale de variables de entorno con valores
// por defecto, asi el mismo codigo sirve aunque cambien nombre/redes.

export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Ay Gloria Bendita",
  tagline:
    process.env.NEXT_PUBLIC_SITE_TAGLINE ??
    "Blanquería, deco y accesorios artesanales",
  description:
    "Almohadones, blanquería, carteras, materos y deco hechos con telas que van rotando. Comprá por menor o por mayor con envíos a todo el país.",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "", // formato internacional sin +, ej 5493435000000
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "aygloriabendita.deco",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
};

export function whatsappLink(message: string) {
  const text = encodeURIComponent(message);
  if (!site.whatsapp) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${site.whatsapp}?text=${text}`;
}

export function instagramLink() {
  return `https://instagram.com/${site.instagram}`;
}
