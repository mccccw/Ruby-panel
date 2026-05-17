export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { DbUnavailable } from "@/components/common/DbUnavailable";
import { UserManagement } from "@/components/admin/UserManagement";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userRole = session.user.role as Role;
  if (![Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR].includes(userRole)) redirect("/");

  let users: { id: string; email: string; username: string; role: Role; isActive: boolean; totpEnabled: boolean; lastLoginAt: Date | null }[] = [];
  let dbAvailable = true;

  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, username: true, role: true, isActive: true, totpEnabled: true, lastLoginAt: true }
    });
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Users" description="Manage roles, status, 2FA posture, and account lifecycle." />
      {!dbAvailable ? (
        <DbUnavailable page="Users" />
      ) : (
        <UserManagement
          initialUsers={users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))}
          currentUserId={session.user.id}
          currentUserRole={userRole}
        />
      )}
    </>
  );
}
