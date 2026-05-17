"use client";

import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

export function LogViewer({ serverId }: { serverId: string }) {
  const [filter, setFilter] = useState("");
  const logs = useQuery({
    queryKey: ["logs", serverId],
    refetchInterval: 5000,
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/files?path=${encodeURIComponent("logs/latest.log")}&mode=read`);
      const payload = (await response.json()) as { ok: boolean; data?: { content: string }; error?: string };
      if (!payload.ok || !payload.data) {
        return "";
      }
      return payload.data.content;
    }
  });
  const lines = useMemo(() => (logs.data ?? "").split(/\r?\n/).filter((line) => line.toLowerCase().includes(filter.toLowerCase())), [logs.data, filter]);
  return (
    <div className="glass-card p-4">
      <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter log lines..." />
      <pre className="mt-4 max-h-[70vh] overflow-auto rounded-xl bg-black p-4 font-mono text-xs leading-6 text-white/75">
        {lines.length ? lines.join("\n") : "No matching log lines."}
      </pre>
    </div>
  );
}
