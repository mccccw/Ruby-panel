export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { prisma } from "@/lib/prisma";

export default async function ServerSettingsPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  return (
    <>
      <PageHeader eyebrow="Configuration" title="Server settings" description="Container, resource, backup, JVM, and startup configuration." />
      <GlassCard>
        <dl className="grid gap-4 md:grid-cols-2">
          {[
            ["Container", server.containerName],
            ["Port", String(server.port)],
            ["RAM", `${server.ramMb} MB`],
            ["CPU", `${server.cpuPercent}%`],
            ["Disk", `${server.diskGb} GB`],
            ["Data path", server.dataPath],
            ["Auto backup", server.autoBackup ? "Enabled" : "Disabled"],
            ["Retention", `${server.backupRetention} backups`]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</dt>
              <dd className="mt-2 break-all text-sm text-white/75">{value}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>
    </>
  );
}
