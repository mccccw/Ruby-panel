import { formatDistanceToNow } from "date-fns";
import { GlassCard } from "@/components/common/GlassCard";

export function ActivityFeed({
  entries
}: {
  entries: Array<{ id: string; action: string; targetType: string | null; createdAt: string; user: { username: string; email: string } | null }>;
}) {
  return (
    <GlassCard>
      <h2 className="text-lg font-semibold">Recent activity</h2>
      <div className="mt-5 space-y-4">
        {entries.length === 0 ? <p className="text-sm text-white/45">No activity yet. The first audit trail will appear here.</p> : null}
        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-ruby-500 shadow-ruby" />
            <div>
              <p className="text-sm text-white/80">
                <span className="font-medium">{entry.user?.username ?? "System"}</span> performed <span className="font-mono text-ruby-200">{entry.action}</span>
              </p>
              <p className="mt-1 text-xs text-white/40">
                {entry.targetType ?? "Panel"} · {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
