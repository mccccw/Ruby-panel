"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, username, password })
      });
      const payload = await response.json();
      setBusy(false);
      if (!payload.ok) {
        setError(payload.error || "Signup failed");
        return;
      }
      router.push("/login?signup=success");
    } catch (err) {
      setBusy(false);
      setError("An unexpected error occurred");
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="ruby-grid absolute inset-0 opacity-70" />
      <form className="glass-card relative w-full max-w-md p-8" onSubmit={submit}>
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ruby-600 text-xl font-bold shadow-ruby">R</div>
          <h1 className="mt-5 text-3xl font-semibold">Join Ruby</h1>
          <p className="mt-2 text-sm text-white/50">Create your account to request servers.</p>
        </div>
        <div className="grid gap-4">
          <Label>Email<Input className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Label>
          <Label>Username<Input className="mt-2" value={username} onChange={(event) => setUsername(event.target.value)} required /></Label>
          <Label>Password<Input className="mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></Label>
          {error ? <p className="rounded-lg border border-ruby-500/30 bg-ruby-600/10 p-3 text-sm text-ruby-100">{error}</p> : null}
        </div>
        <Button className="mt-8 w-full" disabled={busy}>{busy ? "Creating account..." : "Create account"}</Button>
        <p className="mt-6 text-center text-sm text-white/45">
          Already have an account? <Link href="/login" className="text-ruby-400 hover:underline">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
