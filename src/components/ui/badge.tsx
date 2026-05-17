import { cn } from "@/lib/utils";

const styles = {
  default: "border-white/10 bg-white/[0.06] text-white/70",
  running: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,0.24)]",
  stopped: "border-white/10 bg-white/[0.04] text-white/45",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  danger: "border-ruby-500/40 bg-ruby-600/15 text-ruby-100"
};

export function Badge({
  variant = "default",
  className,
  children
}: {
  variant?: keyof typeof styles;
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", styles[variant], className)}>{children}</span>;
}
