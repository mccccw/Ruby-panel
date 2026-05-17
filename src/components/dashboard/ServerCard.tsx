"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { ServerSummary } from "@/types";

async function power(serverId: string, action: "start" | "stop" | "restart") {
  const response = await fetch(`/api/servers/${serverId}/power`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action })
  });
  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Power action failed");
  }
}

export function ServerCard({ server }: { server: ServerSummary }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (action: "start" | "stop" | "restart") => power(server.id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["servers"] })
  });
  return (
    <GlassCard className="group transition-transform hover:-translate-y-1 hover:border-ruby-500/35">
      <Link href={`/servers/${server.id}`} className="block">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{server.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-white/50">{server.description ?? `${server.type} ${server.version}`}</p>
          </div>
          <StatusBadge status={server.status} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-white/50">
          <span className="flex items-center gap-2"><MemoryStick className="h-4 w-4 text-ruby-400" />{server.ramMb} MB</span>
          <span className="flex items-center gap-2"><Cpu className="h-4 w-4 text-ruby-400" />{server.cpuPercent}%</span>
          <span className="flex items-center gap-2"><HardDrive className="h-4 w-4 text-ruby-400" />{server.diskGb} GB</span>
        </div>
      </Link>
      <div className="mt-6 flex gap-2">
        <Button size="sm" disabled={mutation.isPending || server.status === "RUNNING"} onClick={() => mutation.mutate("start")}>Start</Button>
        <Button size="sm" variant="secondary" disabled={mutation.isPending || server.status !== "RUNNING"} onClick={() => mutation.mutate("restart")}>Restart</Button>
        <Button size="sm" variant="destructive" disabled={mutation.isPending || server.status !== "RUNNING"} onClick={() => mutation.mutate("stop")}>Stop</Button>
      </div>
    </GlassCard>
  );
}
