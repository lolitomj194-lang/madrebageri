import Link from "next/link";
import { getCurrentAdmin } from "@/lib/current-admin";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/Logo";

export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-brand-carbon text-brand-cream">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-lg uppercase tracking-[0.15em]">Entre Cortes · Panel</span>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" target="_blank" className="text-brand-cream/60 hover:text-brand-cream">Ver sitio ↗</Link>
            <span className="hidden text-brand-cream/60 sm:inline">{admin?.name}</span>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[200px_1fr] lg:px-8">
        <aside>
          <AdminNav />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
