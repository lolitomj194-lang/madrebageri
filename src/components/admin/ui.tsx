"use client";

import { useEffect, useState } from "react";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-brand-ash">{hint}</span>}
    </label>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-line bg-white px-4 py-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-ember" />
      <span className="text-sm">
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-brand-ash">{hint}</span>}
      </span>
    </label>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success" | "warn"; children: React.ReactNode }) {
  const cls = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    error: "bg-red-50 text-red-800 border-red-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
  }[tone];
  return <div className={`rounded-xl border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl uppercase text-brand-carbon">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-brand-ash">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Campo de imagen: URL manual o subida (si Cloudinary esta configurado). */
export function ImageField({ value, onChange, label = "Imagen" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [uploadEnabled, setUploadEnabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/upload").then((r) => r.json()).then((d) => setUploadEnabled(Boolean(d.enabled))).catch(() => {});
  }, []);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex gap-3">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-brand-line bg-brand-carbon">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value && <img src={value} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex-1 space-y-2">
          <input className="input-field" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… o /img/productos/vacio.svg" />
          {uploadEnabled ? (
            <label className="btn btn-outline btn-sm cursor-pointer">
              {uploading ? "Subiendo…" : "Subir foto"}
              <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          ) : (
            <p className="text-[11px] text-brand-ash">Pegá la URL de una imagen. Para subir archivos, configurá Cloudinary (ver README).</p>
          )}
          {error && <p className="text-xs text-brand-ember">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export async function apiFetch<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Error inesperado");
  return data as T;
}
