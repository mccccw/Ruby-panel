export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { prisma } from "@/lib/prisma";

export default async function SitePage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await prisma.website.findUniqueOrThrow({ where: { id: siteId }, include: { domains: true, envVars: true, databases: true, deployments: { orderBy: { createdAt: "desc" }, take: 10 } } });
  return (
    <>
      <PageHeader eyebrow={site.type} title="Git integration" description="Repository settings, branch, deploy history, and webhook state." />
      <GlassCard>
        <div className="grid gap-4 md:grid-cols-2">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Name: <span className="font-semibold text-white">{site.name}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Status: <span className="font-semibold text-white">{site.status}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Port: <span className="font-semibold text-white">{site.port}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Domains: <span className="font-semibold text-white">{site.domains.length}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Env vars: <span className="font-semibold text-white">{site.envVars.length}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Deployments: <span className="font-semibold text-white">{site.deployments.length}</span></p>
        </div>
      </GlassCard>
    </>
  );
}
