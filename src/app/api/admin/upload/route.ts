import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

/**
 * Subida de imagenes a Cloudinary (firmada, server-side).
 * Requiere CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.
 * Si no esta configurado, el panel permite pegar una URL de imagen.
 */
function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export async function GET() {
  return NextResponse.json({ enabled: Boolean(cloudinaryConfig()) });
}

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

export async function POST(req: NextRequest) {
  const config = cloudinaryConfig();
  if (!config) {
    return NextResponse.json(
      { error: "La subida de archivos no está configurada. Configurá CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET, o pegá una URL de imagen." },
      { status: 503 }
    );
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Archivo faltante." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Formato no permitido (JPG, PNG, WEBP, AVIF o SVG)." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "La imagen supera los 8 MB." }, { status: 400 });

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "entrecortes";
  const toSign = `folder=${folder}&timestamp=${timestamp}${config.apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  const upload = new FormData();
  upload.append("file", file);
  upload.append("api_key", config.apiKey);
  upload.append("timestamp", String(timestamp));
  upload.append("folder", folder);
  upload.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, { method: "POST", body: upload });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data?.error?.message ?? "No se pudo subir la imagen." }, { status: 502 });
  }
  return NextResponse.json({ url: data.secure_url as string });
}
