"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebarStore } from "@/store/sidebarStore";

export function TopBar() {
  const { data } = useSession();
  const { setCollapsed } = useSidebarStore();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-surface-1/70 px-4 backdrop-blur-xl md:px-8">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setCollapsed(false)} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input className="pl-9" placeholder="Search servers, websites, users..." />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="hidden text-right text-sm md:block">
          <p className="font-medium">{data?.user?.username ?? "Operator"}</p>
          <p className="text-xs text-white/45">{data?.user?.role ?? "USER"}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
