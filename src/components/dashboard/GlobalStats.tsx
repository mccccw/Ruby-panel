import { Boxes, MemoryStick, PlayCircle, Users } from "lucide-react";
import { GlassCard } from "@/components/common/GlassCard";

const icons = {
  servers: Boxes,
  running: PlayCircle,
  ram: MemoryStick,
  players: Users
};

export function GlobalStats({
  stats
}: {
  stats: {
    totalServers: number;
    runningServers: number;
    totalRamUsedMb: number;
    totalPlayersOnline: number;
  };
}) {
  const items = [
    { label: "Total Servers", value: stats.totalServers, icon: icons.servers },
    { label: "Running Servers", value: stats.runningServers, icon: icons.running },
    { label: "RAM Used", value: `${stats.totalRamUsedMb.toFixed(0)} MB`, icon: icons.ram },
    { label: "Players Online", value: stats.totalPlayersOnline, icon: icons.players }
  ];
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <GlassCard key={item.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/50">{item.label}</p>
              <Icon className="h-5 w-5 text-ruby-400" />
            </div>
            <p className="mt-4 text-3xl font-semibold">{item.value}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
