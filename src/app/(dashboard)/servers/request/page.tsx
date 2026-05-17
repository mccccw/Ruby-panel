export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServerRequestForm } from "@/components/server/ServerRequestForm";

export default function RequestServerPage() {
  return (
    <>
      <PageHeader eyebrow="Servers" title="Request a server" description="Submit a server request. An admin will review and provision it for you." />
      <ServerRequestForm />
    </>
  );
}
