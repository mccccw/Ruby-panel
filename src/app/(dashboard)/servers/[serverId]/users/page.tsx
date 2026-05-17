export const dynamic = "force-dynamic";
import { ServerPermission } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { prisma } from "@/lib/prisma";

export default async function ServerUsersPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  const grants = await prisma.serverUser.findMany({ where: { serverId }, include: { user: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader eyebrow="Access" title="Server users" description="Per-server permission grants with RBAC-aware enforcement on API routes." />
      <div className="glass-card divide-y divide-white/10 p-0">
        {grants.length === 0 ? <p className="p-5 text-sm text-white/45">No delegated users yet. Admins and superadmins retain global access.</p> : null}
        {grants.map((grant) => (
          <div key={grant.id} className="grid gap-2 p-5 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="font-semibold">{grant.user.username}</p>
              <p className="text-sm text-white/45">{grant.user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {grant.permissions.map((permission) => <span key={permission} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/60">{permission}</span>)}
            </div>
          </div>
        ))}
      </div>
      <GlassCard className="mt-4">
        <p className="text-sm text-white/55">Available permissions: {Object.values(ServerPermission).join(", ")}</p>
      </GlassCard>
    </>
  );
}
