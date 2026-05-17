import { Progress } from "@/components/ui/progress";

export function ResourceGauge({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-white/55">{label}</span>
        <span className="text-sm font-semibold text-white">{value.toFixed(1)}%</span>
      </div>
      <Progress value={value} />
      <p className="mt-2 text-xs text-white/40">{detail}</p>
    </div>
  );
}
