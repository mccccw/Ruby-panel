"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("cattech3d@gmail.com");
  const [password, setPassword] = useState("@a240924");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn("credentials", { email, password, totpCode: needsTotp ? totpCode : undefined, remember: remember ? "true" : "false", redirect: false });
    setBusy(false);
    if (result?.error) {
      if (result.error.includes("TOTP_REQUIRED")) {
        setNeedsTotp(true);
        return;
      }
      setError(result.error.replace("CredentialsSignin", "Invalid email, password, or authenticator code"));
      return;
    }
    router.push(search.get("callbackUrl") ?? "/");
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="ruby-grid absolute inset-0 opacity-70" />
      <form className="glass-card relative w-full max-w-md p-8" onSubmit={submit}>
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ruby-600 text-xl font-bold shadow-ruby">R</div>
          <h1 className="mt-5 text-3xl font-semibold">Ruby Panel</h1>
          <p className="mt-2 text-sm text-white/50">{needsTotp ? "Enter your authenticator code to continue." : "Sign in to the command deck."}</p>
        </div>
        <div className="grid gap-4">
          <Label>Email<Input className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={needsTotp} required /></Label>
          <Label>Password<Input className="mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={needsTotp} required /></Label>
          {needsTotp ? <Label>2FA Code<Input className="mt-2" inputMode="numeric" value={totpCode} onChange={(event) => setTotpCode(event.target.value)} required /></Label> : null}
          <label className="flex items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember this device</label>
          {error ? <p className="rounded-lg border border-ruby-500/30 bg-ruby-600/10 p-3 text-sm text-ruby-100">{error}</p> : null}
        </div>
        <Button className="mt-8 w-full" disabled={busy}>{busy ? "Checking..." : needsTotp ? "Verify and enter" : "Sign in"}</Button>
        {!needsTotp && (
          <p className="mt-6 text-center text-sm text-white/45">
            Don't have an account? <Link href="/signup" className="text-ruby-400 hover:underline">Join Ruby</Link>
          </p>
        )}
      </form>
    </main>
  );
}
