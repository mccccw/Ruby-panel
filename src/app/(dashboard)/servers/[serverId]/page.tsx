export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { Cpu, HardDrive, MemoryStick, Network } from "lucide-react";
import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function ServerOverviewPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  const server = await prisma.server.findUnique({ where: { id: serverId }, include: { stats: { orderBy: { timestamp: "desc" }, take: 1 } } });
  if (!server) {
    notFound();
  }
  const latest = server.stats[0];
  return (
    <>
      <PageHeader eyebrow={server.type} title={server.name} description={server.description ?? `Minecraft ${server.version} on port ${server.port}`} actions={<StatusBadge status={server.status} />} />
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard><MemoryStick className="h-5 w-5 text-ruby-400" /><p className="mt-4 text-2xl font-semibold">{latest?.ramMb.toFixed(0) ?? 0} MB</p><p className="text-sm text-white/45">RAM used of {server.ramMb} MB</p></GlassCard>
        <GlassCard><Cpu className="h-5 w-5 text-ruby-400" /><p className="mt-4 text-2xl font-semibold">{latest?.cpuPercent.toFixed(1) ?? 0}%</p><p className="text-sm text-white/45">CPU usage</p></GlassCard>
        <GlassCard><Network className="h-5 w-5 text-ruby-400" /><p className="mt-4 text-2xl font-semibold">{latest?.playerCount ?? 0}</p><p className="text-sm text-white/45">Players online</p></GlassCard>
        <GlassCard><HardDrive className="h-5 w-5 text-ruby-400" /><p className="mt-4 text-2xl font-semibold">{server.diskGb} GB</p><p className="text-sm text-white/45">Disk quota</p></GlassCard>
      </div>
    </>
  );
}
