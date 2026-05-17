import type { ServerStatus, SiteStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: ServerStatus | SiteStatus }) {
  if (status === "RUNNING") {
    return <Badge variant="running">RUNNING</Badge>;
  }
  if (status === "CRASHED" || status === "ERROR") {
    return <Badge variant="danger">{status}</Badge>;
  }
  if (status === "STARTING" || status === "STOPPING" || status === "BUILDING") {
    return <Badge variant="warning">{status}</Badge>;
  }
  return <Badge variant="stopped">{status}</Badge>;
}
