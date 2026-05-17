export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServerCreationWizard } from "@/components/server/ServerCreationWizard";

export default function NewServerPage() {
  return (
    <>
      <PageHeader eyebrow="Provision" title="Create server" description="Configure software, resources, ports, and Docker isolation in one guided flow." />
      <ServerCreationWizard />
    </>
  );
}
