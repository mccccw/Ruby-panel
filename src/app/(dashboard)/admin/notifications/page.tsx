export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { DbUnavailable } from "@/components/common/DbUnavailable";
import { prisma } from "@/lib/prisma";

export default async function AdminNotificationsPage() {
  let settings: Awaited<ReturnType<typeof prisma.panelSetting.findMany>> = [];
  let dbAvailable = true;

  try {
    settings = await prisma.panelSetting.findMany({ orderBy: { key: "asc" } });
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Notifications" description="Configure Discord, Telegram, and email notification targets." />
      {!dbAvailable ? (
        <DbUnavailable page="Notifications" />
      ) : (
        <GlassCard>
          <div className="grid gap-3">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                <span className="font-mono text-ruby-200">{setting.key}</span>
                <span className="text-white/60">{setting.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </>
  );
}
