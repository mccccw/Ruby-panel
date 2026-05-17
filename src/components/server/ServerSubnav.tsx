"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  ["", "Overview"],
  ["console", "Console"],
  ["files", "Files"],
  ["ai", "Ruby AI"],
  ["plugins", "Plugins"],
  ["backups", "Backups"],
  ["tasks", "Tasks"],
  ["monitoring", "Monitoring"],
  ["worlds", "Worlds"],
  ["logs", "Logs"],
  ["users", "Users"],
  ["settings", "Settings"]
] as const;

export function ServerSubnav({ serverId }: { serverId: string }) {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-2">
      {tabs.map(([segment, label]) => {
        const href = `/servers/${serverId}${segment ? `/${segment}` : ""}`;
        const active = pathname === href;
        return <Link key={segment || "overview"} href={href} className={cn("shrink-0 rounded-xl px-3 py-2 text-sm transition-colors", active ? "bg-ruby-600 text-white" : "text-white/50 hover:bg-white/10 hover:text-white")}>{label}</Link>;
      })}
    </nav>
  );
}
