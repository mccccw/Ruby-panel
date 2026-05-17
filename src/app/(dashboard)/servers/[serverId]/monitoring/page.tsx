export const dynamic = "force-dynamic";
import { MonitoringCharts } from "@/components/server/MonitoringCharts";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function MonitoringChartsPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Server" title="Monitoring" description="CPU, RAM, TPS, players, and network history from Docker and stored snapshots." />
      <MonitoringCharts serverId={serverId} />
    </>
  );
}
