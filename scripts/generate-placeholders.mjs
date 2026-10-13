// Genera imagenes SVG de ejemplo (claramente ilustrativas) para productos y combos.
// Uso: node scripts/generate-placeholders.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "img");
mkdirSync(join(OUT, "productos"), { recursive: true });
mkdirSync(join(OUT, "combos"), { recursive: true });

const PALETTE = {
  carbon: "#171717",
  brasa: "#B83227",
  calido: "#F8F5EF",
  madera: "#76513B",
  gris: "#2B2B2B",
};

const ICONS = {
  carne: `<path d="M-70 10c-10-40 30-70 70-60 35 8 80 0 85 40 4 35-30 55-70 55-35 0-78-5-85-35z" fill="#c2473a"/><path d="M-40 0c10-25 55-30 80-15 12 7 12 25-5 30-25 8-55 10-75-15z" fill="#f1d7c4" opacity=".75"/><path d="M-62 15c-3-25 18-40 35-35" stroke="#fff" stroke-width="5" fill="none" opacity=".4" stroke-linecap="round"/>`,
  premium: `<path d="M-80 20c0-45 35-75 80-75s80 30 80 75c0 20-35 30-80 30s-80-10-80-30z" fill="#b9372c"/><path d="M-50 10c10-30 40-45 70-35 15 5 15 25 0 30-25 10-50 15-70 5z" fill="#f3dccb" opacity=".7"/><circle cx="20" cy="-10" r="6" fill="#fff" opacity=".5"/>`,
  achura: `<path d="M-75 0c0-30 25-45 50-35 20 8 30 30 55 25 25-5 45 15 40 40-6 30-40 35-70 30-35-5-75-15-75-60z" fill="#a8382e"/><path d="M-45 5c15-20 40-20 60-5" stroke="#f2c7b8" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>`,
  embutido: `<path d="M-85 10c0-25 20-35 45-30s40 5 60-5 50 5 55 30-20 35-50 30-40-5-60 5-50 0-50-30z" fill="#8e2f26"/><path d="M-70 5c20-10 50-5 70 0s45 5 65-3" stroke="#f5d0c0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>`,
  fuego: `<path d="M0-70c20 30 45 40 45 80 0 25-20 45-45 45s-45-20-45-45c0-20 10-30 20-45 0 15 5 25 15 30-5-25 0-45 10-65z" fill="#e0582f"/><path d="M0-15c10 15 18 22 18 38 0 12-8 20-18 20s-18-8-18-20c0-10 5-15 10-22 0 8 2 12 6 15-2-12 0-20 2-31z" fill="#f6b852"/>`,
  extra: `<circle r="60" fill="#e8c27a"/><circle r="45" fill="#f6dfae"/><path d="M-30-10c20-15 40-15 60 0" stroke="#d99a3c" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>`,
  combo: `<rect x="-90" y="-20" width="180" height="60" rx="10" fill="#3a3a3a"/><path d="M-80-20v-20M-40-20v-20M0-20v-20M40-20v-20M80-20v-20" stroke="#555" stroke-width="6"/><path d="M-55-55c-8-25 20-45 45-38 22 6 50 0 55 25 3 22-18 35-45 35-22 0-50-3-55-22z" fill="#c2473a"/><path d="M10-30c0-18 14-28 30-24 15 4 30 2 32 18 1 14-13 22-30 22-14 0-30-2-32-16z" fill="#8e2f26"/><path d="M-70 60c0 0 20-10 70-10s70 10 70 10" stroke="#f6b852" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`,
};

function svg(kind, label, accent = PALETTE.brasa) {
  const icon = ICONS[kind] ?? ICONS.carne;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#2e2a27"/>
      <stop offset="100%" stop-color="${PALETTE.carbon}"/>
    </radialGradient>
    <linearGradient id="grill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity=".45"/>
    </linearGradient>
    <pattern id="lines" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="none"/>
      <path d="M0 20h40" stroke="#ffffff" stroke-opacity=".035" stroke-width="10"/>
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <rect width="800" height="600" fill="url(#lines)"/>
  <g transform="translate(400 265) scale(1.9)">${icon}</g>
  <rect width="800" height="600" fill="url(#grill)"/>
  <rect x="40" y="40" width="720" height="520" rx="18" fill="none" stroke="${accent}" stroke-opacity=".55" stroke-width="3"/>
  <text x="400" y="505" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="46" fill="${PALETTE.calido}" letter-spacing="2">${label}</text>
  <text x="400" y="545" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="${PALETTE.calido}" fill-opacity=".55" letter-spacing="4">IMAGEN ILUSTRATIVA</text>
</svg>`;
}

const products = [
  ["carne", "Vacío", "vacio"],
  ["carne", "Costilla", "costilla"],
  ["carne", "Tira de asado", "tira-de-asado"],
  ["carne", "Matambre", "matambre"],
  ["carne", "Tapa de asado", "tapa-de-asado"],
  ["carne", "Falda", "falda"],
  ["premium", "Entraña", "entrana"],
  ["premium", "Bife de chorizo", "bife-de-chorizo"],
  ["premium", "Ojo de bife", "ojo-de-bife"],
  ["premium", "Picaña", "picana"],
  ["premium", "Lomo", "lomo"],
  ["embutido", "Chorizo", "chorizo"],
  ["embutido", "Morcilla", "morcilla"],
  ["achura", "Mollejas", "mollejas"],
  ["achura", "Chinchulines", "chinchulines"],
  ["achura", "Riñones", "rinones"],
  ["extra", "Provoleta", "provoleta"],
  ["fuego", "Leña", "lena"],
  ["fuego", "Carbón", "carbon"],
  ["fuego", "Prendefácil", "prendefacil"],
  ["extra", "Sal parrillera", "sal-parrillera"],
  ["extra", "Chimichurri", "chimichurri"],
  ["extra", "Salsa criolla", "salsa-criolla"],
];

for (const [kind, label, slug] of products) {
  writeFileSync(join(OUT, "productos", `${slug}.svg`), svg(kind, label));
}

const combos = [
  ["Combo Económico", "economico"],
  ["Combo Clásico", "clasico"],
  ["Combo Premium", "premium"],
  ["Asado para Dos", "para-dos"],
  ["Asado Familiar", "familiar"],
  ["Asado de Amigos", "amigos"],
  ["Parrillero Completo", "parrillero-completo"],
];
for (const [label, slug] of combos) {
  writeFileSync(join(OUT, "combos", `${slug}.svg`), svg("combo", label, PALETTE.madera));
}

// Hero de inicio: brasas y parrilla (abstracto, sin fotografia)
const embers = Array.from({ length: 70 }, (_, i) => {
  const x = (i * 211) % 1600;
  const y = 420 + ((i * 97) % 460);
  const r = 2 + ((i * 13) % 5);
  const o = 0.25 + ((i * 7) % 6) / 10;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#f6b852" opacity="${o.toFixed(2)}"/>`;
}).join("");
const grate = Array.from({ length: 9 }, (_, i) => `<rect x="0" y="${300 + i * 70}" width="1600" height="14" rx="7" fill="#000" opacity="${(0.55 - i * 0.04).toFixed(2)}"/>`).join("");
writeFileSync(
  join(OUT, "hero.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#141212"/>
      <stop offset="55%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#2a1512"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="100%" r="75%">
      <stop offset="0%" stop-color="#e0582f" stop-opacity=".95"/>
      <stop offset="30%" stop-color="#b83227" stop-opacity=".55"/>
      <stop offset="70%" stop-color="#6b1f18" stop-opacity=".15"/>
      <stop offset="100%" stop-color="#171717" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="78%" cy="95%" r="40%">
      <stop offset="0%" stop-color="#f6b852" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#f6b852" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <rect width="1600" height="900" fill="url(#glow2)"/>
  <g filter="url(#blur)" opacity=".8">
    <ellipse cx="500" cy="880" rx="420" ry="90" fill="#e0582f"/>
    <ellipse cx="1150" cy="900" rx="380" ry="80" fill="#c9442c"/>
  </g>
  ${grate}
  ${embers}
</svg>`
);

console.log("Placeholders generados en public/img");
