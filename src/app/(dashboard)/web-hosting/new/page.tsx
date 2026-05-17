export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { WebsiteCreationForm } from "@/components/web/WebsiteCreationForm";

export default function NewWebsitePage() {
  return (
    <>
      <PageHeader eyebrow="Deploy" title="Create website" description="Provision an isolated website runtime with ports, commands, domain metadata, and environment support." />
      <WebsiteCreationForm />
    </>
  );
}
