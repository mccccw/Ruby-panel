import { Role } from "@prisma/client";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ keyId: string }> }) {
  try {
    guarded(request);
    const { keyId } = await params;
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    await prisma.apiKey.delete({ where: { id: keyId } });
    await auditLog({ userId: user.id, action: "api_key.delete", targetType: "ApiKey", targetId: keyId });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
