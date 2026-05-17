import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DashboardLayoutWrapper } from "@/components/layout/DashboardLayoutWrapper";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-surface-background">
      <Sidebar />
      <DashboardLayoutWrapper>
        <TopBar />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
          {children}
        </main>
      </DashboardLayoutWrapper>
    </div>
  );
}
