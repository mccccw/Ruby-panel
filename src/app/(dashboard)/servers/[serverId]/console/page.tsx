export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { Console } from "@/components/server/Console";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function ServerConsolePage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  const server = await prisma.server.findUnique({ where: { id: serverId }, select: { id: true, name: true, port: true, status: true } });
  if (!server) notFound();
  return (
    <>
      <PageHeader eyebrow="Terminal" title="Live console" description="Attach to Docker stdout/stdin through the Ruby socket bridge." />
      <Console serverId={serverId} serverPort={server.port} serverStatus={server.status} />
    </>
  );
}
