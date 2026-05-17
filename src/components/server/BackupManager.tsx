"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Backup = {
  id: string;
  name: string;
  type: string;
  status: string;
  sizeMb: number | null;
  createdAt: string;
  errorMsg: string | null;
};

async function request(serverId: string, init?: RequestInit): Promise<void> {
  const response = await fetch(`/api/servers/${serverId}/backups`, init);
  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Backup request failed");
  }
}

export function BackupManager({ serverId }: { serverId: string }) {
  const [name, setName] = useState(`backup-${new Date().toISOString().slice(0, 16).replace("T", "-")}`);
  const queryClient = useQueryClient();
  const backups = useQuery({
    queryKey: ["backups", serverId],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/backups`);
      const payload = (await response.json()) as { ok: boolean; data?: Backup[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to load backups");
      }
      return payload.data;
    }
  });
  const create = useMutation({
    mutationFn: () => request(serverId, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) }),
    onSuccess: () => {
      toast.success("Backup created");
      queryClient.invalidateQueries({ queryKey: ["backups", serverId] });
    }
  });
  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-col gap-3 p-4 md:flex-row">
        <Input value={name} onChange={(event) => setName(event.target.value)} />
        <Button onClick={() => create.mutate()} disabled={create.isPending}>{create.isPending ? "Creating..." : "Create backup"}</Button>
      </div>
      <div className="glass-card divide-y divide-white/10 p-0">
        {backups.data?.length === 0 ? <p className="p-5 text-sm text-white/45">No backups yet.</p> : null}
        {backups.data?.map((backup) => (
          <div key={backup.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{backup.name}</p>
              <p className="text-sm text-white/45">{backup.status} · {backup.sizeMb ? `${backup.sizeMb.toFixed(1)} MB` : "pending size"} · {new Date(backup.createdAt).toLocaleString()}</p>
              {backup.errorMsg ? <p className="mt-1 text-sm text-ruby-200">{backup.errorMsg}</p> : null}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm"><Download className="h-4 w-4" />Download</Button>
              <Button variant="secondary" size="sm"><RotateCcw className="h-4 w-4" />Restore</Button>
              <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" />Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
