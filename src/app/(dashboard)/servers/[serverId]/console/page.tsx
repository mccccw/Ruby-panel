export const dynamic = "force-dynamic";
import { Console } from "@/components/server/Console";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ServerConsolePage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Terminal" title="Live console" description="Attach to Docker stdout/stdin through the Ruby socket bridge." />
      <Console serverId={serverId} />
    </>
  );
}
