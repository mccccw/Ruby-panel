export const dynamic = "force-dynamic";
import { ServerList } from "@/components/dashboard/ServerList";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ServersPage() {
  return (
    <>
      <PageHeader eyebrow="Minecraft" title="Servers" description="Search, monitor, and control every isolated Docker-backed Minecraft server." />
      <ServerList />
    </>
  );
}
