export const dynamic = "force-dynamic";
import { TaskScheduler } from "@/components/server/TaskScheduler";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function TaskSchedulerPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Server" title="Task scheduler" description="Schedule restarts, backups, announcements, commands, starts, and stops." />
      <TaskScheduler serverId={serverId} />
    </>
  );
}
