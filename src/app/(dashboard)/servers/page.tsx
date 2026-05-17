export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { ServerList } from "@/components/dashboard/ServerList";
import { PageHeader } from "@/components/layout/PageHeader";
import { auth } from "@/lib/auth";

export default async function ServersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user.role as Role) ?? Role.USER;
  return (
    <>
      <PageHeader eyebrow="Minecraft" title="Servers" description="Search, monitor, and control every isolated Docker-backed Minecraft server." />
      <ServerList role={role} />
    </>
  );
}
