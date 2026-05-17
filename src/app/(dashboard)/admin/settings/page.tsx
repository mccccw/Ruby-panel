export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { DbUnavailable } from "@/components/common/DbUnavailable";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  let settings: Awaited<ReturnType<typeof prisma.panelSetting.findMany>> = [];
  let dbAvailable = true;

  try {
    settings = await prisma.panelSetting.findMany({ orderBy: { key: "asc" } });
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Panel settings" description="Global product name, setup state, theme, and operational settings." />
      {!dbAvailable ? (
        <DbUnavailable page="Panel settings" />
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
