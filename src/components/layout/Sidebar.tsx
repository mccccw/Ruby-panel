"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Globe2, KeyRound, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/servers", label: "Servers", icon: Boxes },
  { href: "/web-hosting", label: "Web Hosting", icon: Globe2 },
  { href: "/admin/users", label: "Users", icon: Shield },
  { href: "/admin/api-keys", label: "API Keys", icon: KeyRound },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();
  return (
    <aside className={cn("fixed left-0 top-0 z-[100] flex h-screen flex-col border-r border-white/10 bg-surface-1/95 backdrop-blur-2xl transition-all duration-300 ease-in-out shadow-2xl", collapsed ? "w-0 md:w-20 overflow-hidden" : "w-72")}>
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5 shrink-0">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-ruby-600 font-bold shadow-ruby shrink-0 text-white shadow-lg shadow-ruby-600/20">R</div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-500">
            <p className="font-semibold text-white">Ruby Panel</p>
            <p className="text-xs text-white/45">Control Beyond Limits</p>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("focus-ruby flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 group relative", active ? "bg-ruby-600 text-white shadow-lg shadow-ruby-600/30" : "text-white/55 hover:bg-white/[0.08] hover:text-white")}>
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200", !active && "group-hover:scale-110")} />
              {!collapsed && <span className="whitespace-nowrap animate-in slide-in-from-left-2 duration-300">{item.label}</span>}
              {collapsed && <div className="absolute left-16 hidden group-hover:block z-50 rounded-lg bg-surface-2 border border-white/10 px-3 py-1.5 text-xs text-white shadow-xl">
                {item.label}
              </div>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 shrink-0 bg-surface-1/50 backdrop-blur-md">
        <Button variant="secondary" className={cn("w-full transition-all flex items-center justify-center hover:bg-ruby-600/20 hover:text-ruby-400 border border-transparent hover:border-ruby-600/30", collapsed ? "px-0 h-12 rounded-xl" : "gap-2 h-11 rounded-xl")} onClick={toggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen className="h-6 w-6 text-ruby-400" /> : <PanelLeftClose className="h-5 w-5" />}
          {!collapsed && <span className="whitespace-nowrap font-medium">Collapse Panel</span>}
        </Button>
      </div>
    </aside>
  );
}
