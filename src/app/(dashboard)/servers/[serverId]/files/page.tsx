export const dynamic = "force-dynamic";
import { FileManager } from "@/components/server/FileManager";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ServerFilesPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Storage" title="File manager" description="Browse, edit, delete, and write files inside the server volume with path traversal protection." />
      <FileManager serverId={serverId} />
    </>
  );
}
