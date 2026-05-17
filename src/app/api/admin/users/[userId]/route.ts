import { Role } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PROTECTED_EMAIL = "cattech3d@gmail.com";

const patchSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    guarded(request);
    const { userId } = await params;
    const actor = await requireUser(request);
    requireRole(actor, [Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR]);
    const body = patchSchema.parse(await request.json());
    const target = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (target.email === PROTECTED_EMAIL && body.role && body.role !== Role.SUPERADMIN) {
      return fail(new Error("Cannot change role of protected superadmin"), 403);
    }
    if (body.role === Role.SUPERADMIN && actor.role !== Role.SUPERADMIN) {
      return fail(new Error("Only superadmins can assign superadmin role"), 403);
    }
    if (body.role === Role.ADMIN && actor.role !== Role.SUPERADMIN && actor.role !== Role.ADMIN) {
      return fail(new Error("Only admins can assign admin role"), 403);
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.role !== undefined && { role: body.role }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
      }
    });
    await auditLog({ userId: actor.id, action: "user.update", targetType: "User", targetId: userId, metadata: body });
    return ok({ id: updated.id, role: updated.role, isActive: updated.isActive });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    guarded(request);
    const { userId } = await params;
    const actor = await requireUser(request);
    requireRole(actor, [Role.SUPERADMIN, Role.ADMIN]);
    const target = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (target.email === PROTECTED_EMAIL) {
      return fail(new Error("Cannot delete the protected superadmin account"), 403);
    }
    if (target.id === actor.id) {
      return fail(new Error("Cannot delete your own account from here"), 403);
    }
    await prisma.user.delete({ where: { id: userId } });
    await auditLog({ userId: actor.id, action: "user.delete", targetType: "User", targetId: userId });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
