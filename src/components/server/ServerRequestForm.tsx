"use client";

import { ServerType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ServerRequestForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ServerType>(ServerType.PAPER);
  const [version, setVersion] = useState("1.21.4");
  const [ramMb, setRamMb] = useState("2048");
  const [cpuPercent, setCpuPercent] = useState("100");
  const [diskGb, setDiskGb] = useState("20");
  const [reason, setReason] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!version.trim()) { toast.error("Version is required"); return; }
    setBusy(true);
    const res = await fetch("/api/servers/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, type, version, ramMb: Number(ramMb), cpuPercent: Number(cpuPercent), diskGb: Number(diskGb), reason })
    });
    const payload = await res.json() as { ok: boolean; error?: string };
    setBusy(false);
    if (!payload.ok) { toast.error(payload.error ?? "Failed to submit request"); return; }
    toast.success("Server request submitted! An admin will review it shortly.");
    router.push("/servers");
  }

  return (
    <form className="glass-card grid gap-6 p-6" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Server name<Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Server" required /></Label>
        </div>
        <div>
          <Label>Server type
            <Select value={type} onValueChange={(v) => setType(v as ServerType)}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(ServerType).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Label>
        </div>
        <div>
          <Label>Version<Input className="mt-2" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.21.4" required /></Label>
        </div>
        <div>
          <Label>RAM (MB)<Input className="mt-2" type="number" value={ramMb} onChange={(e) => setRamMb(e.target.value)} min={512} max={32768} /></Label>
        </div>
        <div>
          <Label>CPU (%)<Input className="mt-2" type="number" value={cpuPercent} onChange={(e) => setCpuPercent(e.target.value)} min={10} max={800} /></Label>
        </div>
        <div>
          <Label>Disk (GB)<Input className="mt-2" type="number" value={diskGb} onChange={(e) => setDiskGb(e.target.value)} min={1} max={2048} /></Label>
        </div>
      </div>
      <div>
        <Label>Reason / notes (optional)
          <Textarea className="mt-2" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why do you need this server? Any special requirements?" rows={3} />
        </Label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit request"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/servers")}>Cancel</Button>
      </div>
    </form>
  );
}
