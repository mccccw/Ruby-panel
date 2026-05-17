export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { DbUnavailable } from "@/components/common/DbUnavailable";
import { prisma } from "@/lib/prisma";

export default async function AuditPage() {
  let entries: Awaited<ReturnType<typeof prisma.auditLog.findMany>> = [];
  let dbAvailable = true;

  try {
    entries = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: true } });
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Audit log" description="Chronological trail of authentication, server, file, backup, and admin events." />
      {!dbAvailable ? (
        <DbUnavailable page="Audit log" />
      ) : (
        <div className="glass-card divide-y divide-white/10 p-0">
          {entries.map((entry) => (
            <div key={entry.id} className="grid gap-2 p-5 text-sm md:grid-cols-[180px_1fr_180px]">
              <span className="text-white/45">{entry.createdAt.toLocaleString()}</span>
              <span><span className="font-medium">{entry.user?.username ?? "System"}</span> · <span className="font-mono text-ruby-200">{entry.action}</span></span>
              <span className="text-white/45">{entry.targetType ?? "Panel"}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
