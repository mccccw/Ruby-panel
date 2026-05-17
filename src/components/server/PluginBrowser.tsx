"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

type PluginResult = {
  id: string;
  source: "modrinth" | "curseforge";
  title: string;
  description: string;
  iconUrl: string | null;
  downloads: number;
  updatedAt: string;
};

export function PluginBrowser({ serverId }: { serverId: string }) {
  const [query, setQuery] = useState("luckperms");
  const results = useQuery({
    queryKey: ["plugins", serverId, query],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/plugins?q=${encodeURIComponent(query)}`);
      const payload = (await response.json()) as { ok: boolean; data?: PluginResult[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Plugin search failed");
      }
      return payload.data;
    }
  });
  return (
    <div className="space-y-4">
      <div className="glass-card flex gap-2 p-4">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Modrinth and CurseForge" />
        <Button onClick={() => results.refetch()}>Search</Button>
      </div>
      {results.isLoading ? <LoadingSpinner label="Searching plugin indexes" /> : null}
      {results.isError ? <p className="text-sm text-ruby-200">{results.error.message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.data?.map((plugin) => (
          <article key={`${plugin.source}:${plugin.id}`} className="glass-card p-5">
            <div className="flex gap-4">
              {plugin.iconUrl ? <Image src={plugin.iconUrl} alt="" width={48} height={48} className="h-12 w-12 rounded-xl object-cover" /> : <div className="h-12 w-12 rounded-xl bg-ruby-600/30" />}
              <div>
                <h3 className="font-semibold">{plugin.title}</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-ruby-300">{plugin.source}</p>
              </div>
            </div>
            <p className="mt-4 line-clamp-3 text-sm text-white/55">{plugin.description}</p>
            <div className="mt-5 flex items-center justify-between text-xs text-white/40">
              <span>{plugin.downloads.toLocaleString()} downloads</span>
              <Button size="sm" variant="secondary" disabled>
                <Download className="h-4 w-4" />
                Select version
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
