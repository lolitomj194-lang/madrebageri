import Link from "next/link";
import { getCurrentAdmin } from "@/lib/current-admin";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <span className="font-serif text-lg">
              VISION <span className="text-brand-gold">EQUIS</span> · Admin
            </span>
            <nav className="hidden sm:flex gap-6 text-sm uppercase tracking-wide">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-brand-gold transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {admin && <span className="text-brand-cream/60 hidden sm:inline">{admin.name}</span>}
            <AdminLogoutButton />
          </div>
        </div>
        <nav className="flex sm:hidden gap-4 px-4 pb-3 text-sm uppercase tracking-wide">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand-gold transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
