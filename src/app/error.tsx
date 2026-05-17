"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="glass-card max-w-xl p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-ruby-400">Runtime fault</p>
        <h1 className="mt-4 text-3xl font-semibold">Something went wrong.</h1>
        <p className="mt-4 text-sm text-white/60">
          The panel caught the issue before it spread. Try again, and check server logs if the problem persists.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <pre className="mt-6 overflow-auto rounded-lg bg-black/40 p-4 text-left text-xs text-white/70">{error.message}</pre>
        ) : null}
        <Button className="mt-8" onClick={reset}>
          Retry
        </Button>
      </section>
    </main>
  );
}
