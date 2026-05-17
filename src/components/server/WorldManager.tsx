"use client";

import { useQuery } from "@tanstack/react-query";
import { Globe2 } from "lucide-react";

type World = { id: string; worldName: string; sizeMb: number; createdAt: string };

export function WorldManager({ serverId }: { serverId: string }) {
  const worlds = useQuery({
    queryKey: ["worlds", serverId],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/worlds`);
      const payload = (await response.json()) as { ok: boolean; data?: World[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to load worlds");
      }
      return payload.data;
    }
  });
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {worlds.data?.length === 0 ? <p className="text-sm text-white/45">No world snapshots have been captured yet.</p> : null}
      {worlds.data?.map((world) => (
        <article key={world.id} className="glass-card p-5">
          <Globe2 className="h-8 w-8 text-ruby-400" />
          <h3 className="mt-4 font-semibold">{world.worldName}</h3>
          <p className="mt-1 text-sm text-white/45">{world.sizeMb.toFixed(1)} MB · {new Date(world.createdAt).toLocaleString()}</p>
        </article>
      ))}
    </div>
  );
}
