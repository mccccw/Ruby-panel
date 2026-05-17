export const dynamic = "force-dynamic";
import { PluginBrowser } from "@/components/server/PluginBrowser";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function PluginBrowserPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Server" title="Plugin browser" description="Search Modrinth and CurseForge for compatible plugins and mods." />
      <PluginBrowser serverId={serverId} />
    </>
  );
}
