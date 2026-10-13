import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="section-title mt-2 text-5xl text-brand-carbon">Esta página se quemó</h1>
      <p className="mt-4 text-brand-ash">No encontramos lo que buscabas. Volvé al inicio y seguí armando tu asado.</p>
      <Link href="/" className="btn btn-primary mt-8">Volver al inicio</Link>
    </div>
  );
}
