"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { ServerCard } from "@/components/dashboard/ServerCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ServerSummary } from "@/types";

async function fetchServers(): Promise<ServerSummary[]> {
  const response = await fetch("/api/servers");
  const payload = (await response.json()) as { ok: boolean; data?: ServerSummary[]; error?: string };
  if (!payload.ok || !payload.data) {
    throw new Error(payload.error ?? "Unable to load servers");
  }
  return payload.data;
}

export function ServerList() {
  const [search, setSearch] = useState("");
  const servers = useQuery({ queryKey: ["servers"], queryFn: fetchServers, refetchInterval: 10_000 });
  const filtered = useMemo(
    () => (servers.data ?? []).filter((server) => `${server.name} ${server.type} ${server.version}`.toLowerCase().includes(search.toLowerCase())),
    [servers.data, search]
  );
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, type, version..." />
        <Button asChild>
          <Link href="/servers/new"><Plus className="h-4 w-4" />New server</Link>
        </Button>
      </div>
      {servers.isLoading ? <LoadingSpinner label="Loading servers" /> : null}
      {servers.isError ? <p className="rounded-xl border border-ruby-500/30 bg-ruby-600/10 p-4 text-ruby-100">{servers.error.message}</p> : null}
      {filtered.length === 0 && !servers.isLoading ? <p className="glass-card p-8 text-center text-white/50">No servers match this view.</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((server) => <ServerCard key={server.id} server={server} />)}
      </div>
    </div>
  );
}
