"use client";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const btn =
    size === "sm"
      ? "h-8 w-8 text-base"
      : "h-11 w-11 text-lg";
  return (
    <div
      className="inline-flex items-center rounded-full border border-brand-line bg-white"
      role="group"
      aria-label={label ?? "Cantidad"}
    >
      <button
        type="button"
        className={`${btn} rounded-full font-semibold text-brand-carbon transition-colors hover:bg-brand-cream-dark disabled:opacity-30`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Restar"
      >
        −
      </button>
      <span className={`min-w-[2.2rem] text-center font-display ${size === "sm" ? "text-base" : "text-xl"} tabular-nums`}>
        {value}
      </span>
      <button
        type="button"
        className={`${btn} rounded-full font-semibold text-brand-carbon transition-colors hover:bg-brand-cream-dark disabled:opacity-30`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Sumar"
      >
        +
      </button>
    </div>
  );
}
