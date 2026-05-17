"use client";

import { Copy, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  user: { username: string; email: string };
};

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    setCreating(true);
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim(), permissions: {} })
    });
    const payload = await res.json() as { ok: boolean; data?: { id: string; key: string; keyPrefix: string }; error?: string };
    setCreating(false);
    if (!payload.ok || !payload.data) { toast.error(payload.error ?? "Failed to create key"); return; }
    setNewKeyRaw(payload.data.key);
    setShowCreate(false);
    setName("");
    const refreshRes = await fetch("/api/admin/api-keys");
    const refreshPayload = await refreshRes.json() as { ok: boolean; data?: ApiKey[] };
    if (refreshPayload.ok && refreshPayload.data) setKeys(refreshPayload.data);
    toast.success("API key created - copy it now, it won't be shown again!");
  }

  async function deleteKey(keyId: string, keyName: string) {
    if (!confirm(`Delete API key "${keyName}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/api-keys/${keyId}`, { method: "DELETE" });
    const payload = await res.json() as { ok: boolean; error?: string };
    if (!payload.ok) { toast.error(payload.error ?? "Failed to delete"); return; }
    setKeys((prev) => prev.filter((k) => k.id !== keyId));
    toast.success("API key deleted");
  }

  function copyKey(value: string) {
    navigator.clipboard.writeText(value).then(() => toast.success("Copied to clipboard"));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/45">{keys.length} key{keys.length !== 1 ? "s" : ""}</p>
        <Button variant="secondary" className="gap-2" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          Create key
        </Button>
      </div>

      {newKeyRaw && (
        <div className="rounded-xl border border-amber-600/40 bg-amber-600/10 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-300">Save your API key — it won&apos;t be shown again!</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-black/30 px-3 py-2 text-xs font-mono text-amber-200 break-all">
              {showKey ? newKeyRaw : "ruby_••••••••••••••••••••••••••••••••••••••"}
            </code>
            <button onClick={() => setShowKey(!showKey)} className="rounded-lg p-2 text-white/40 hover:text-white transition-colors" title={showKey ? "Hide" : "Show"}>
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={() => copyKey(newKeyRaw)} className="rounded-lg p-2 text-white/40 hover:text-white transition-colors" title="Copy">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => setNewKeyRaw(null)} className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors">Dismiss</button>
        </div>
      )}

      {showCreate && (
        <form onSubmit={createKey} className="glass-card grid gap-3 p-4 border border-ruby-600/20">
          <p className="font-semibold text-white text-sm">New API key</p>
          <Label>Name<Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="My integration" required /></Label>
          <div className="flex gap-2">
            <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="glass-card divide-y divide-white/10 overflow-hidden p-0">
        {keys.length === 0 && (
          <p className="p-6 text-center text-sm text-white/40">No API keys yet.</p>
        )}
        {keys.map((key) => (
          <div key={key.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">{key.name}</p>
              <p className="text-xs text-white/40 mt-0.5 font-mono">{key.keyPrefix}</p>
              <div className="mt-1 flex gap-3 text-xs text-white/30">
                <span>Owner: {key.user.username}</span>
                <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                {key.lastUsedAt && <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>}
                {key.expiresAt && <span>Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>}
              </div>
            </div>
            <button
              onClick={() => deleteKey(key.id, key.name)}
              className="rounded-lg p-1.5 text-white/30 hover:bg-red-600/20 hover:text-red-400 transition-colors shrink-0"
              title="Delete key"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 border border-white/5">
        <p className="text-sm font-semibold text-white mb-1">How to use API keys</p>
        <p className="text-xs text-white/45 mb-2">Add the key as a Bearer token in the Authorization header:</p>
        <code className="block rounded-lg bg-black/30 px-3 py-2 text-xs font-mono text-white/60">
          Authorization: Bearer ruby_your_key_here
        </code>
      </div>
    </div>
  );
}
