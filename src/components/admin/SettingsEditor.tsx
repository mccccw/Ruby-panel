"use client";

import { Check, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Setting = { id: string; key: string; value: string };

const EXTRA_SETTINGS = [
  { key: "panel_name", label: "Panel Name", placeholder: "Ruby Panel" },
  { key: "panel_description", label: "Panel Description", placeholder: "Control Beyond Limits" },
  { key: "registration_enabled", label: "Registration Enabled", placeholder: "true or false" },
  { key: "max_servers_per_user", label: "Max Servers Per User", placeholder: "5" },
  { key: "maintenance_mode", label: "Maintenance Mode", placeholder: "true or false" },
  { key: "smtp_host", label: "SMTP Host", placeholder: "smtp.example.com" },
  { key: "smtp_port", label: "SMTP Port", placeholder: "587" },
  { key: "smtp_user", label: "SMTP User", placeholder: "noreply@example.com" },
  { key: "discord_webhook", label: "Discord Webhook URL", placeholder: "https://discord.com/api/webhooks/..." },
  { key: "default_ram_mb", label: "Default RAM (MB)", placeholder: "2048" },
  { key: "default_disk_gb", label: "Default Disk (GB)", placeholder: "20" },
];

export function SettingsEditor({ initialSettings }: { initialSettings: Setting[] }) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveSetting(key: string, value: string) {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, value })
    });
    const payload = await res.json() as { ok: boolean; data?: Setting; error?: string };
    setSaving(false);
    if (!payload.ok) { toast.error(payload.error ?? "Failed to save"); return; }
    setSettings((prev) => {
      const exists = prev.find((s) => s.key === key);
      if (exists) return prev.map((s) => s.key === key ? { ...s, value } : s);
      return [...prev, payload.data!];
    });
    setEditingKey(null);
    toast.success(`Setting "${key}" saved`);
  }

  async function addSetting(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey.trim()) { toast.error("Key is required"); return; }
    await saveSetting(newKey.trim(), newValue);
    setNewKey(""); setNewValue(""); setShowAdd(false);
  }

  const allKeys = new Set(settings.map((s) => s.key));
  const suggestedMissing = EXTRA_SETTINGS.filter((s) => !allKeys.has(s.key));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/45">{settings.length} setting{settings.length !== 1 ? "s" : ""}</p>
        <Button variant="secondary" className="gap-2" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4" />
          Add setting
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={addSetting} className="glass-card grid gap-3 p-4 border border-ruby-600/20">
          <p className="font-semibold text-white text-sm">Add / update setting</p>
          {suggestedMissing.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedMissing.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => { setNewKey(s.key); setNewValue(""); }}
                  className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="setting_key" required />
            <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="value" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="glass-card divide-y divide-white/10 overflow-hidden p-0">
        {settings.length === 0 && (
          <p className="p-6 text-center text-sm text-white/40">No settings yet. Add one above.</p>
        )}
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-ruby-200">{setting.key}</p>
              {editingKey === setting.key ? (
                <Input
                  className="mt-1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveSetting(setting.key, editValue);
                    if (e.key === "Escape") setEditingKey(null);
                  }}
                  autoFocus
                />
              ) : (
                <p className="mt-0.5 text-sm text-white/60 truncate">{setting.value || <span className="italic text-white/25">empty</span>}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {editingKey === setting.key ? (
                <>
                  <button
                    onClick={() => saveSetting(setting.key, editValue)}
                    disabled={saving}
                    className="rounded-lg p-1.5 text-green-400 hover:bg-green-600/20 transition-colors"
                    title="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingKey(null)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 transition-colors"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setEditingKey(setting.key); setEditValue(setting.value); }}
                  className="rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
