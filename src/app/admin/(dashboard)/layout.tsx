import Link from "next/link";
import { getCurrentAdmin } from "@/lib/current-admin";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { site } from "@/lib/site";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-brand-ink text-brand-cream">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-serif text-lg">
              {site.name} · <span className="text-brand-sand">Admin</span>
            </Link>
            <nav className="hidden gap-6 text-sm sm:flex">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="transition-colors hover:text-brand-sand">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {admin && <span className="hidden text-brand-cream/60 sm:inline">{admin.name}</span>}
            <AdminLogoutButton />
          </div>
        </div>
        <nav className="flex gap-5 px-4 pb-3 text-sm sm:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-brand-sand">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
