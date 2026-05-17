"use client";

import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { PanelLeftOpen } from "lucide-react";

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle } = useSidebarStore();
  
  return (
    <div className={cn(
      "transition-all duration-300 min-h-screen flex flex-col relative",
      collapsed ? "md:pl-20" : "md:pl-72"
    )}>
      {/* Mobile/Collapsed Fallback Toggle */}
      <button 
        onClick={toggle}
        className={cn(
          "fixed top-4 left-4 z-[110] md:hidden grid h-10 w-10 place-items-center rounded-xl bg-ruby-600/90 text-white shadow-lg shadow-ruby-600/20 backdrop-blur-sm transition-opacity duration-300 border border-ruby-400/20",
          !collapsed && "opacity-0 pointer-events-none"
        )}
      >
        <PanelLeftOpen className="h-5 w-5" />
      </button>

      {children}
    </div>
  );
}
