export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { DbUnavailable } from "@/components/common/DbUnavailable";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userRole = session.user.role as Role;
  if (![Role.SUPERADMIN, Role.ADMIN].includes(userRole)) redirect("/");

  let settings: { id: string; key: string; value: string }[] = [];
  let dbAvailable = true;

  try {
    settings = await prisma.panelSetting.findMany({ orderBy: { key: "asc" } });
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Panel settings" description="Global product name, setup state, theme, and operational settings." />
      {!dbAvailable ? (
        <DbUnavailable page="Panel settings" />
      ) : (
        <SettingsEditor initialSettings={settings} />
      )}
    </>
  );
}
