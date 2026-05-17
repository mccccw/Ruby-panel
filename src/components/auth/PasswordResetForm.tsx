"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordResetForm() {
  const search = useSearchParams();
  const token = search.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/auth/password-reset", {
      method: token ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(token ? { token, password } : { email })
    });
    const payload = (await response.json()) as { ok: boolean; error?: string };
    setBusy(false);
    if (!payload.ok) {
      toast.error(payload.error ?? "Password reset failed");
      return;
    }
    toast.success(token ? "Password updated" : "If the account exists, a reset email was sent");
  }
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form className="glass-card w-full max-w-md p-8" onSubmit={submit}>
        <h1 className="text-3xl font-semibold">{token ? "Choose a new password" : "Reset password"}</h1>
        <p className="mt-2 text-sm text-white/50">{token ? "This will invalidate old sessions." : "We will send a one-hour reset link if the account exists."}</p>
        <div className="mt-6 grid gap-4">
          {token ? <Label>New password<Input className="mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Label> : <Label>Email<Input className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Label>}
        </div>
        <Button className="mt-8 w-full" disabled={busy}>{busy ? "Working..." : "Continue"}</Button>
      </form>
    </main>
  );
}
