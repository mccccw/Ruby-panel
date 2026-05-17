export const dynamic = "force-dynamic";
import { LogViewer } from "@/components/server/LogViewer";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function LogViewerPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Server" title="Logs" description="Filter and inspect the latest server log with live refresh." />
      <LogViewer serverId={serverId} />
    </>
  );
}
