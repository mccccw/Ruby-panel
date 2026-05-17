"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { GlobalStats } from "@/components/dashboard/GlobalStats";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/layout/PageHeader";
import type { DashboardStats } from "@/types/api";

async function fetchDashboard(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard");
  const payload = (await response.json()) as { ok: boolean; data?: DashboardStats; error?: string };
  if (!payload.ok || !payload.data) {
    throw new Error(payload.error ?? "Unable to load dashboard");
  }
  return payload.data;
}

export function DashboardClient() {
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard, refetchInterval: 5000 });
  
  if (dashboard.isLoading) {
    return <LoadingSpinner label="Loading command deck" />;
  }
  
  const data = dashboard.data;
  const isError = dashboard.isError;
  const errorMsg = dashboard.error instanceof Error ? dashboard.error.message : "Database connection issue";

  return (
    <div>
      <PageHeader eyebrow="Command deck" title="Control Beyond Limits" description="Live infrastructure overview for Minecraft servers, web deployments, users, resources, and audit events." />
      
      {isError && (
        <div className="mb-6 rounded-xl border border-ruby-500/30 bg-ruby-600/10 p-4 text-ruby-100 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => window.location.href = "/setup"} className="text-xs underline hover:text-white">Run Setup</button>
        </div>
      )}

      {!data ? (
        <div className="glass-card p-12 text-center">
          <p className="text-white/45 italic">Waiting for infrastructure telemetry...</p>
        </div>
      ) : (
        <>
          <GlobalStats stats={data} />
          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
            <section className="glass-card p-5">
              <h2 className="text-lg font-semibold">Resource overview</h2>
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.resourceSeries.map((point) => ({ ...point, label: new Date(point.timestamp).toLocaleTimeString() }))}>
                    <defs>
                      <linearGradient id="resourceRuby" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e11d48" stopOpacity={0.7} /><stop offset="100%" stopColor="#e11d48" stopOpacity={0.03} /></linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" />
                    <YAxis stroke="rgba(255,255,255,0.35)" />
                    <Tooltip contentStyle={{ background: "#111114", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                    <Area type="monotone" dataKey="cpuPercent" stroke="#fb7185" fill="url(#resourceRuby)" />
                    <Area type="monotone" dataKey="ramMb" stroke="#fecdd3" fill="rgba(254,205,211,0.08)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
            <ActivityFeed entries={data.activity} />
          </div>
        </>
      )}
    </div>
  );
}
