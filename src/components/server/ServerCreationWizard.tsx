"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ServerType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(280).optional(),
  type: z.nativeEnum(ServerType),
  version: z.string().min(2),
  ramMb: z.coerce.number().min(512).max(32768),
  cpuPercent: z.coerce.number().min(10).max(800),
  diskGb: z.coerce.number().min(1).max(2048),
  port: z.coerce.number().int().min(1).max(65535).optional()
});

type FormValues = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

export function ServerCreationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      type: ServerType.PAPER,
      version: "1.21.4",
      ramMb: 2048,
      cpuPercent: 100,
      diskGb: 20
    }
  });
  const values = form.watch();
  async function submit(data: FormValues) {
    const response = await fetch("/api/servers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, jvmFlags: [] })
    });
    const payload = (await response.json()) as { ok: boolean; data?: { id: string }; error?: string };
    if (!payload.ok || !payload.data) {
      toast.error(payload.error ?? "Unable to create server");
      return;
    }
    toast.success("Server created");
    router.push(`/servers/${payload.data.id}`);
  }
  return (
    <form className="glass-card p-6" onSubmit={form.handleSubmit(submit)}>
      <div className="mb-6 flex gap-2">
        {["Basic", "Software", "Resources", "Review"].map((label, index) => (
          <button key={label} type="button" onClick={() => setStep(index)} className={`rounded-full px-3 py-1 text-xs ${step === index ? "bg-ruby-600 text-white" : "bg-white/10 text-white/45"}`}>{label}</button>
        ))}
      </div>
      {step === 0 ? (
        <div className="grid gap-4">
          <Label>Name<Input className="mt-2" {...form.register("name")} /></Label>
          <Label>Description<Textarea className="mt-2" {...form.register("description")} /></Label>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Label>Server Type
            <Select value={values.type} onValueChange={(value) => form.setValue("type", value as ServerType)}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.values(ServerType).map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
            </Select>
          </Label>
          <Label>Minecraft Version<Input className="mt-2" {...form.register("version")} /></Label>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Label>RAM MB<Input className="mt-2" type="number" {...form.register("ramMb")} /></Label>
          <Label>CPU %<Input className="mt-2" type="number" {...form.register("cpuPercent")} /></Label>
          <Label>Disk GB<Input className="mt-2" type="number" {...form.register("diskGb")} /></Label>
          <Label>Port<Input className="mt-2" type="number" {...form.register("port")} placeholder="Auto" /></Label>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/65">
          <p className="text-lg font-semibold text-white">{values.name || "Unnamed Server"}</p>
          <p className="mt-2">
            {values.type} {values.version} · {String(values.ramMb ?? "")} MB RAM · {String(values.cpuPercent ?? "")}% CPU · {String(values.diskGb ?? "")} GB disk
          </p>
          <p className="mt-4">Ruby will allocate a port, create an isolated Docker container, mount the server volume, and persist the configuration in PostgreSQL.</p>
        </div>
      ) : null}
      <div className="mt-8 flex justify-between">
        <Button type="button" variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
        {step < 3 ? <Button type="button" onClick={() => setStep(step + 1)}>Next</Button> : <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating..." : "Create Server"}</Button>}
      </div>
    </form>
  );
}
