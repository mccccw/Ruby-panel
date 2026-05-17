import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { createApiKeySecret, requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(80),
  permissions: z.record(z.string(), z.unknown()).default({})
});

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { username: true, email: true } } } });
    return ok(keys.map((key) => ({ ...key, keyHash: undefined })));
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
    const secret = createApiKeySecret();
    const key = await prisma.apiKey.create({
      data: {
        user: { connect: { id: user.id } },
        name: body.name,
        keyHash: secret.hash,
        keyPrefix: secret.prefix,
        permissions: body.permissions as Prisma.InputJsonObject
      }
    });
    await auditLog({ userId: user.id, action: "api_key.create", targetType: "ApiKey", targetId: key.id });
    return ok({ id: key.id, key: secret.raw, keyPrefix: secret.prefix }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
