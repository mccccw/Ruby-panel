export const dynamic = "force-dynamic";
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { DbUnavailable } from "@/components/common/DbUnavailable";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  let dbAvailable = true;

  try {
    users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Users" description="Manage roles, status, 2FA posture, and account lifecycle." />
      {!dbAvailable ? (
        <DbUnavailable page="Users" />
      ) : (
        <>
          <div className="glass-card overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-white/45"><tr><th className="p-4">User</th><th>Role</th><th>2FA</th><th>Last login</th><th>Status</th></tr></thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id}><td className="p-4"><p className="font-semibold">{user.username}</p><p className="text-white/45">{user.email}</p></td><td>{user.role}</td><td>{user.totpEnabled ? "Enabled" : "Disabled"}</td><td>{user.lastLoginAt?.toLocaleString() ?? "Never"}</td><td>{user.isActive ? "Active" : "Suspended"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-white/45">Available roles: {Object.values(Role).join(", ")}</p>
        </>
      )}
    </>
  );
}
