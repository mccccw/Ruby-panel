"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { timestamp: string; cpuPercent: number; ramMb: number; playerCount: number; tps: number | null };

export function MonitoringCharts({ serverId }: { serverId: string }) {
  const points = useQuery({
    queryKey: ["stats-history", serverId],
    refetchInterval: 10_000,
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/stats`);
      const payload = (await response.json()) as { ok: boolean; data?: Point[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to load stats");
      }
      return payload.data.map((point) => ({ ...point, label: new Date(point.timestamp).toLocaleTimeString() }));
    }
  });
  const data = points.data ?? [];
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="glass-card p-5">
        <h3 className="font-semibold">CPU and RAM</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rubyCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e11d48" stopOpacity={0.6} /><stop offset="100%" stopColor="#e11d48" stopOpacity={0.04} /></linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" />
              <YAxis stroke="rgba(255,255,255,0.35)" />
              <Tooltip contentStyle={{ background: "#111114", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
              <Area type="monotone" dataKey="cpuPercent" stroke="#fb7185" fill="url(#rubyCpu)" />
              <Area type="monotone" dataKey="ramMb" stroke="#fecdd3" fill="rgba(254,205,211,0.08)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="glass-card p-5">
        <h3 className="font-semibold">TPS</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" />
              <YAxis domain={[0, 20]} stroke="rgba(255,255,255,0.35)" />
              <Tooltip contentStyle={{ background: "#111114", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
              <Line type="monotone" dataKey="tps" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
