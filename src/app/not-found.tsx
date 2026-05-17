import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div className="ruby-grid absolute inset-0 opacity-60" />
      <section className="glass-card relative max-w-xl p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-ruby-400">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">This route slipped beyond the border.</h1>
        <p className="mt-4 text-sm leading-6 text-white/60">
          Ruby Panel could not find that page. Head back to the command deck and we will keep the engines warm.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Return to dashboard</Link>
        </Button>
      </section>
    </main>
  );
}
