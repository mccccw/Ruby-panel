export const dynamic = "force-dynamic";
import { BackupManager } from "@/components/server/BackupManager";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function BackupManagerPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Server" title="Backups" description="Create, inspect, download, restore, and delete server backups." />
      <BackupManager serverId={serverId} />
    </>
  );
}
