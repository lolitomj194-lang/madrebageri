import { redirect } from "next/navigation";

// Pagina heredada del proyecto anterior: ahora todo vive en /contacto.
export default function UbicacionPage() {
  redirect("/contacto");
}
