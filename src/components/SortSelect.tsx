"use client";

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      id="orden"
      name="orden"
      defaultValue={defaultValue}
      className="rounded border border-brand-line px-2 py-1"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      <option value="relevancia">Relevancia</option>
      <option value="precio-asc">Precio: menor a mayor</option>
      <option value="precio-desc">Precio: mayor a menor</option>
      <option value="nuevo">Nuevos ingresos</option>
    </select>
  );
}
