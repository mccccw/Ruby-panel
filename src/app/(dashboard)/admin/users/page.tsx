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
  let serverRequests: { id: string; name: string; type: string; version: string; ramMb: number; cpuPercent: number; diskGb: number; status: string; adminNote: string | null; createdAt: Date; user: { username: string; email: string } }[] = [];
  let dbAvailable = true;

  try {
    [users, serverRequests] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, username: true, role: true, isActive: true, totpEnabled: true, lastLoginAt: true }
      }),
      prisma.serverRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true, email: true } } }
      })
    ]);
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Users" description="Manage roles, status, 2FA posture, account lifecycle, and server requests." />
      {!dbAvailable ? (
        <DbUnavailable page="Users" />
      ) : (
        <UserManagement
          initialUsers={users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))}
          initialServerRequests={serverRequests.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
          currentUserId={session.user.id}
          currentUserRole={userRole}
        />
      )}
    </>
  );
}
