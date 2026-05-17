export const dynamic = "force-dynamic";
import { FileManager } from "@/components/server/FileManager";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function DeepFilesPage({ params }: { params: Promise<{ serverId: string; path: string[] }> }) {
  const { serverId, path } = await params;
  return (
    <>
      <PageHeader eyebrow="Storage" title="File manager" description="Deep path navigation inside this server data volume." />
      <FileManager serverId={serverId} initialPath={path.join("/")} />
    </>
  );
}
