import { Role } from "@prisma/client";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { hashPassword, setupSchema } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    guarded(request);
    const existing = await prisma.user.count();
    if (existing > 0) {
      return fail(new Error("Setup has already been completed"), 404);
    }
    const input = setupSchema.parse(await request.json());
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          username: input.username,
          passwordHash,
          role: Role.SUPERADMIN
        }
      });
      await tx.panelSetting.upsert({ where: { key: "panel.name" }, update: { value: input.panelName }, create: { key: "panel.name", value: input.panelName } });
      await tx.panelSetting.upsert({ where: { key: "setup.completed" }, update: { value: "true" }, create: { key: "setup.completed", value: "true" } });
      await tx.panelSetting.upsert({ where: { key: "panel.tagline" }, update: { value: "Control Beyond Limits" }, create: { key: "panel.tagline", value: "Control Beyond Limits" } });
      return created;
    });
    await auditLog({ userId: user.id, action: "setup.complete", targetType: "User", targetId: user.id });
    return ok({ id: user.id });
  } catch (error) {
    return fail(error);
  }
}
