import { Prisma, Role } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR]);
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? undefined;
    const where: Prisma.AuditLogWhereInput = action ? { action } : {};
    const logs = await prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 500, include: { user: true } });
    return ok(logs);
  } catch (error) {
    return fail(error, 403);
  }
}
