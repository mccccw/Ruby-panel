import { Role } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { hashPassword, requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(12),
  role: z.nativeEnum(Role)
});

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return ok(users);
  } catch (error) {
    return fail(error, 403);
  }
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const body = schema.parse(await request.json());
    const created = await prisma.user.create({ data: { email: body.email.toLowerCase(), username: body.username, passwordHash: await hashPassword(body.password), role: body.role } });
    await auditLog({ userId: user.id, action: "user.create", targetType: "User", targetId: created.id });
    return ok({ id: created.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
