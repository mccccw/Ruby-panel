"use client";

import { SiteType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function WebsiteCreationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<SiteType>(SiteType.STATIC);
  const [port, setPort] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/web-hosting", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, type, port: port ? Number(port) : undefined })
    });
    const payload = (await response.json()) as { ok: boolean; data?: { id: string }; error?: string };
    setBusy(false);
    if (!payload.ok || !payload.data) {
      toast.error(payload.error ?? "Unable to create website");
      return;
    }
    toast.success("Website created");
    router.push(`/web-hosting/${payload.data.id}`);
  }
  return (
    <form className="glass-card grid gap-4 p-6" onSubmit={submit}>
      <Label>Name<Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} required /></Label>
      <Label>Type<Select value={type} onValueChange={(value) => setType(value as SiteType)}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{Object.values(SiteType).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Label>
      <Label>Port<Input className="mt-2" type="number" value={port} onChange={(event) => setPort(event.target.value)} placeholder="Auto" min={1} max={65535} /></Label>
      <Button disabled={busy}>{busy ? "Creating..." : "Create website"}</Button>
    </form>
  );
}
