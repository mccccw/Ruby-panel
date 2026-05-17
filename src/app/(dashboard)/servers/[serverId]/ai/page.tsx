export const dynamic = "force-dynamic";
import { AiAssistant } from "@/components/server/AiAssistant";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ServerAiPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Ruby intelligence" title="AI assistant" description="Streaming operational help with server-aware context injection." />
      <AiAssistant serverId={serverId} />
    </>
  );
}
