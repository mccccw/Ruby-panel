"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    panelName: z.string().min(2),
    acceptTerms: z.boolean().refine(Boolean, "Terms must be accepted")
  })
  .refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

type FormValues = z.infer<typeof schema>;

export function SetupForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "cattech3d",
      email: "cattech3d@gmail.com",
      password: "@a240924",
      confirmPassword: "@a240924",
      panelName: "Ruby Panel",
      acceptTerms: true
    }
  });
  const password = form.watch("password");
  const strength = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/, /.{8,}/].filter((test) => test.test(password)).length;
  async function submit(values: FormValues) {
    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { ok: boolean; error?: string };
    if (!payload.ok) {
      toast.error(payload.error ?? "Setup failed");
      return;
    }
    const login = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    if (login?.error) {
      toast.error("Setup finished, but automatic login failed. Please sign in.");
      router.push("/login");
      return;
    }
    router.push("/");
  }
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="ruby-grid absolute inset-0 opacity-80" />
      <form className="glass-card relative w-full max-w-xl p-8" onSubmit={form.handleSubmit(submit)}>
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ruby-600 text-xl font-bold shadow-ruby">R</div>
          <h1 className="mt-5 text-3xl font-semibold">Welcome. Let&apos;s get started.</h1>
          <p className="mt-2 text-sm text-white/50">Create the first super admin and lock in the panel identity.</p>
        </div>
        <div className="grid gap-4">
          <Label>Username<Input className="mt-2" {...form.register("username")} /></Label>
          <Label>Email<Input className="mt-2" type="email" {...form.register("email")} /></Label>
          <Label>Password<Input className="mt-2" type="password" {...form.register("password")} /></Label>
          <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-ruby-600 transition-all" style={{ width: `${strength * 20}%` }} /></div>
          <Label>Confirm Password<Input className="mt-2" type="password" {...form.register("confirmPassword")} /></Label>
          <Label>Panel Name<Input className="mt-2" {...form.register("panelName")} /></Label>
          <label className="flex items-center gap-3 text-sm text-white/65"><input type="checkbox" {...form.register("acceptTerms")} /> I accept responsibility for securing this panel.</label>
        </div>
        <Button className="mt-8 w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating..." : "Create super admin"}</Button>
      </form>
    </main>
  );
}
