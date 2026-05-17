export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServerSettingsForm } from "@/components/server/ServerSettingsForm";
import { prisma } from "@/lib/prisma";

export default async function ServerSettingsPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  const server = await prisma.server.findUniqueOrThrow({
    where: { id: serverId },
    select: {
      id: true, name: true, description: true, iconUrl: true,
      port: true, ramMb: true, cpuPercent: true, diskGb: true,
      autoBackup: true, backupRetention: true, containerName: true,
      dataPath: true, status: true, version: true, type: true
    }
  });
  return (
    <>
      <PageHeader eyebrow="Configuration" title="Server settings" description="Edit name, resources, backup, and manage server lifecycle." />
      <ServerSettingsForm server={server} />
    </>
  );
}
