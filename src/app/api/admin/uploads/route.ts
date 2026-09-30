import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Subida de fotos desde el panel admin (pensada para el celular). Usa Vercel
// Blob: en Vercel se crea un Blob store y la variable BLOB_READ_WRITE_TOKEN
// queda configurada sola. Sin el token, el panel sigue permitiendo pegar URLs.

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "La subida de fotos no está configurada (falta BLOB_READ_WRITE_TOKEN). Crear un Blob store en Vercel o pegar la URL de la imagen.",
      },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato no soportado (usar JPG, PNG o WebP)" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "La foto es muy pesada (máximo 8 MB)" },
      { status: 400 }
    );
  }

  const extension = file.name.split(".").pop() || "jpg";
  const blob = await put(`productos/${Date.now()}.${extension}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
