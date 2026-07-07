"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo iniciar sesion");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-brand-cream px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-brand-line bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl text-brand-ink text-center">
          VISION <span className="text-brand-gold">EQUIS</span>
        </h1>
        <p className="mt-1 text-center text-xs uppercase tracking-[0.2em] text-brand-ink/50">Panel de administracion</p>

        <div className="mt-8 space-y-4">
          <input name="email" type="email" required placeholder="Email" className="input-field w-full" />
          <input name="password" type="password" required placeholder="Contrasena" className="input-field w-full" />
        </div>

        {error && <p className="mt-4 text-sm text-brand-ferrari">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-brand-ink py-3 text-sm uppercase tracking-wide text-brand-cream hover:bg-brand-gold hover:text-brand-ink transition-colors disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
