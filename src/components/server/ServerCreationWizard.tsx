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
  name: z.string().min(2, "Name must be at least 2 characters").max(64),
  description: z.string().max(280).optional(),
  type: z.nativeEnum(ServerType),
  version: z.string().min(2, "Version is required"),
  ramMb: z.coerce.number().min(512, "Minimum 512 MB").max(32768, "Maximum 32768 MB"),
  cpuPercent: z.coerce.number().min(10, "Minimum 10%").max(800, "Maximum 800%"),
  diskGb: z.coerce.number().min(1, "Minimum 1 GB").max(2048, "Maximum 2048 GB"),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  acceptEula: z.literal(true, { message: "You must accept the Minecraft EULA to create a server" }),
  autoBackup: z.boolean().optional(),
  backupSchedule: z.string().optional(),
  backupRetention: z.coerce.number().min(1).max(100).optional(),
  jvmFlags: z.string().optional()
});

type FormValues = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

const STEPS = ["Basic", "Software", "Resources", "Advanced", "Review"];

const STEP_FIELDS: (keyof FormValues)[][] = [
  ["name", "description"],
  ["type", "version"],
  ["ramMb", "cpuPercent", "diskGb", "port"],
  ["autoBackup", "jvmFlags"],
  ["acceptEula"]
];

const BACKUP_SCHEDULES = [
  { value: "0 */6 * * *", label: "Every 6 hours" },
  { value: "0 */12 * * *", label: "Every 12 hours" },
  { value: "0 0 * * *", label: "Daily" },
  { value: "0 0 * * 0", label: "Weekly" }
];

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
      diskGb: 20,
      acceptEula: undefined as unknown as true,
      autoBackup: false,
      backupSchedule: "0 0 * * *",
      backupRetention: 7,
      jvmFlags: "-XX:+UseG1GC -XX:+ParallelRefProcEnabled"
    }
  });
  const { formState: { errors, isSubmitting } } = form;
  const values = form.watch();

  async function goToStep(target: number) {
    if (target > step) {
      const fieldsToValidate = STEP_FIELDS[step];
      const valid = await form.trigger(fieldsToValidate as (keyof FormInput)[]);
      if (!valid) return;
    }
    setStep(target);
  }

  async function submit(data: FormValues) {
    const response = await fetch("/api/servers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...data,
        jvmFlags: data.jvmFlags ? data.jvmFlags.split(/\s+/).filter(Boolean) : [],
        acceptEula: undefined
      })
    });
    const payload = (await response.json()) as { ok: boolean; data?: { id: string }; error?: string };
    if (!payload.ok || !payload.data) {
      toast.error(payload.error ?? "Unable to create server");
      return;
    }
    toast.success("Server created successfully!");
    router.push(`/servers/${payload.data.id}`);
  }

  function FieldError({ name }: { name: keyof FormValues }) {
    const error = errors[name];
    if (!error) return null;
    return <p className="mt-1 text-xs text-ruby-400">{error.message as string}</p>;
  }

  return (
    <form className="glass-card p-6" onSubmit={form.handleSubmit(submit)}>
      <div className="mb-6 flex gap-2">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => goToStep(index)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${step === index ? "bg-ruby-600 text-white" : "bg-white/10 text-white/45 hover:bg-white/20"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="grid gap-4">
          <div>
            <Label>Name<Input className="mt-2" {...form.register("name")} placeholder="My Minecraft Server" /></Label>
            <FieldError name="name" />
          </div>
          <div>
            <Label>Description<Textarea className="mt-2" {...form.register("description")} placeholder="Optional description..." /></Label>
            <FieldError name="description" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Server Type
              <Select value={values.type} onValueChange={(value) => form.setValue("type", value as ServerType)}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(ServerType).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
            <FieldError name="type" />
          </div>
          <div>
            <Label>Minecraft Version<Input className="mt-2" {...form.register("version")} placeholder="1.21.4" /></Label>
            <FieldError name="version" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>RAM (MB)<Input className="mt-2" type="number" {...form.register("ramMb")} /></Label>
            <FieldError name="ramMb" />
          </div>
          <div>
            <Label>CPU (%)<Input className="mt-2" type="number" {...form.register("cpuPercent")} /></Label>
            <FieldError name="cpuPercent" />
          </div>
          <div>
            <Label>Disk (GB)<Input className="mt-2" type="number" {...form.register("diskGb")} /></Label>
            <FieldError name="diskGb" />
          </div>
          <div>
            <Label>Port (optional)<Input className="mt-2" type="number" {...form.register("port")} placeholder="Auto-assigned" /></Label>
            <FieldError name="port" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-semibold text-white">Backups</p>
            <div className="mt-3 flex items-center gap-3">
              <input type="checkbox" id="autoBackup" {...form.register("autoBackup")} className="h-4 w-4 rounded border-white/20 bg-white/10" />
              <Label htmlFor="autoBackup">Enable automatic backups</Label>
            </div>
            {values.autoBackup && (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Schedule
                    <Select value={values.backupSchedule ?? "0 0 * * *"} onValueChange={(v) => form.setValue("backupSchedule", v)}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BACKUP_SCHEDULES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Label>
                </div>
                <div>
                  <Label>Max backups to keep<Input className="mt-2" type="number" {...form.register("backupRetention")} /></Label>
                </div>
              </div>
            )}
          </div>
          <div>
            <Label>JVM Flags<Textarea className="mt-2 font-mono text-xs" {...form.register("jvmFlags")} placeholder="-XX:+UseG1GC -XX:+ParallelRefProcEnabled" /></Label>
            <p className="mt-1 text-xs text-white/40">Custom JVM arguments for server optimization</p>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/65">
          <p className="text-lg font-semibold text-white">{values.name || "Unnamed Server"}</p>
          {values.description && <p className="mt-1 text-white/50">{values.description}</p>}
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            <div className="rounded-lg bg-white/[0.04] p-3">
              <p className="text-xs text-white/40">Software</p>
              <p className="font-medium text-white">{values.type} {values.version}</p>
            </div>
            <div className="rounded-lg bg-white/[0.04] p-3">
              <p className="text-xs text-white/40">Resources</p>
              <p className="font-medium text-white">{String(values.ramMb ?? "")} MB · {String(values.cpuPercent ?? "")}% CPU · {String(values.diskGb ?? "")} GB</p>
            </div>
            {values.port ? (
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-xs text-white/40">Port</p>
                <p className="font-medium text-white">{String(values.port)}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-start gap-3">
              <input type="checkbox" id="acceptEula" {...form.register("acceptEula")} className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10" />
              <Label htmlFor="acceptEula" className="text-sm leading-relaxed text-white/80">
                I accept the <a href="https://aka.ms/MinecraftEULA" target="_blank" rel="noopener noreferrer" className="text-ruby-400 underline hover:text-ruby-300">Minecraft EULA</a>. By checking this box, you agree to the Minecraft End User License Agreement.
              </Label>
            </div>
            <FieldError name="acceptEula" />
          </div>
          <p className="mt-4 text-white/40">Ruby will allocate a port, create an isolated Docker container, mount the server volume, and persist the configuration in the database.</p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => goToStep(step + 1)}>Next</Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Server"}
          </Button>
        )}
      </div>
    </form>
  );
}
