import { cn } from "@/lib/utils";

export function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("glass-card p-5", className)}>{children}</section>;
}
