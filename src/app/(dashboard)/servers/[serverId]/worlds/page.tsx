export const dynamic = "force-dynamic";
import { WorldManager } from "@/components/server/WorldManager";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function WorldManagerPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Server" title="Worlds" description="Manage captured world snapshots and world data operations." />
      <WorldManager serverId={serverId} />
    </>
  );
}
