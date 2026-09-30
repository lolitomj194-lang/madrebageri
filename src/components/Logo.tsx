import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex flex-col leading-none ${className}`}>
      <span className="font-serif text-2xl font-semibold tracking-tight text-brand-ink">
        {site.name}
      </span>
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-brand-terracotta">
        deco · blanquería
      </span>
    </Link>
  );
}
