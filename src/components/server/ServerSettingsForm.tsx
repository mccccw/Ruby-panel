"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/common/GlassCard";

type ServerData = {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  port: number;
  ramMb: number;
  cpuPercent: number;
  diskGb: number;
  autoBackup: boolean;
  backupRetention: number;
  containerName: string;
  dataPath: string;
  status: string;
  version: string;
  type: string;
};

export function ServerSettingsForm({ server }: { server: ServerData }) {
  const router = useRouter();
  const [name, setName] = useState(server.name);
  const [description, setDescription] = useState(server.description ?? "");
  const [iconUrl, setIconUrl] = useState(server.iconUrl ?? "");
  const [ramMb, setRamMb] = useState(server.ramMb);
  const [cpuPercent, setCpuPercent] = useState(server.cpuPercent);
  const [diskGb, setDiskGb] = useState(server.diskGb);
  const [autoBackup, setAutoBackup] = useState(server.autoBackup);
  const [backupRetention, setBackupRetention] = useState(server.backupRetention);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteData, setDeleteData] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description: description || null, ramMb, cpuPercent, diskGb, autoBackup, backupRetention })
      });
      const payload = await res.json() as { ok: boolean; error?: string };
      if (!payload.ok) throw new Error(payload.error ?? "Save failed");
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/servers/${server.id}?deleteData=${deleteData}`, {
        method: "DELETE"
      });
      const payload = await res.json() as { ok: boolean; error?: string };
      if (!payload.ok) throw new Error(payload.error ?? "Delete failed");
      toast.success("Server deleted");
      router.push("/servers");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="mb-4 font-semibold text-white">General</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Server name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="space-y-1">
            <Label>Icon URL</Label>
            <Input value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-1">
            <Label>Version</Label>
            <Input value={server.version} disabled className="opacity-50 cursor-not-allowed" />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 font-semibold text-white">Resources</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Label>RAM (MB)</Label>
            <Input type="number" value={ramMb} onChange={(e) => setRamMb(Number(e.target.value))} min={512} max={32768} />
          </div>
          <div className="space-y-1">
            <Label>CPU (%)</Label>
            <Input type="number" value={cpuPercent} onChange={(e) => setCpuPercent(Number(e.target.value))} min={10} max={800} />
          </div>
          <div className="space-y-1">
            <Label>Disk (GB)</Label>
            <Input type="number" value={diskGb} onChange={(e) => setDiskGb(Number(e.target.value))} min={1} max={2048} />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 font-semibold text-white">Backups</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoBackup"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10 accent-ruby-600"
            />
            <Label htmlFor="autoBackup">Auto backup</Label>
          </div>
          <div className="space-y-1">
            <Label>Retention (backups)</Label>
            <Input type="number" value={backupRetention} onChange={(e) => setBackupRetention(Number(e.target.value))} min={1} max={365} />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 font-semibold text-white">System info</h3>
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          {[
            ["Container", server.containerName],
            ["Port", String(server.port)],
            ["Type", server.type],
            ["Status", server.status],
            ["Data path", server.dataPath]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-xs uppercase tracking-widest text-white/35">{label}</dt>
              <dd className="mt-1 break-all text-white/70">{value}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>

      <div className="flex items-center justify-between">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </Button>
        <Button variant="secondary" className="border border-red-600/40 text-red-400 hover:bg-red-600/20" onClick={() => setShowDelete(true)}>
          Delete server
        </Button>
      </div>

      {showDelete && (
        <GlassCard className="border border-red-600/40 bg-red-600/10">
          <h3 className="mb-2 font-semibold text-red-300">Delete server permanently</h3>
          <p className="mb-4 text-sm text-white/60">This will remove the Docker container. This action cannot be undone.</p>
          <div className="mb-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="deleteData"
              checked={deleteData}
              onChange={(e) => setDeleteData(e.target.checked)}
              className="h-4 w-4 rounded accent-red-600"
            />
            <Label htmlFor="deleteData" className="text-red-300">Also delete all server files and data</Label>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? "Deleting..." : "Confirm delete"}
            </Button>
            <Button variant="secondary" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
