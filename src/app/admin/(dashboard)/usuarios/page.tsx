import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/current-admin";
import { UsersManager } from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [admin, users] = await Promise.all([
    getCurrentAdmin(),
    prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl text-brand-ink">Usuarios</h1>
        <p className="text-sm text-brand-ink-soft">
          Quién puede entrar al panel y qué puede ver.
        </p>
      </div>
      <UsersManager users={users} currentUserId={admin?.adminId ?? ""} />
    </div>
  );
}
