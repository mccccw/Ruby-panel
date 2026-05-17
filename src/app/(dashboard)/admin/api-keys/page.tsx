export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { DbUnavailable } from "@/components/common/DbUnavailable";
import { ApiKeyManager } from "@/components/admin/ApiKeyManager";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminApiKeysPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userRole = session.user.role as Role;
  if (![Role.SUPERADMIN, Role.ADMIN].includes(userRole)) redirect("/");

  let keys: { id: string; name: string; keyPrefix: string; lastUsedAt: Date | null; expiresAt: Date | null; createdAt: Date; user: { username: string; email: string } }[] = [];
  let dbAvailable = true;

  try {
    keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, email: true } } }
    });
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="API Keys" description="Create and revoke hashed API keys for external integrations." />
      {!dbAvailable ? (
        <DbUnavailable page="API keys" />
      ) : (
        <ApiKeyManager
          initialKeys={keys.map((k) => ({
            ...k,
            lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
            expiresAt: k.expiresAt?.toISOString() ?? null,
            createdAt: k.createdAt.toISOString()
          }))}
        />
      )}
    </>
  );
}
