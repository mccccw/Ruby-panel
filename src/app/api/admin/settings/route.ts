import { Role } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  key: z.string().min(1),
  value: z.string()
});

const createSchema = z.object({
  key: z.string().min(1).max(80),
  value: z.string()
});

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const settings = await prisma.panelSetting.findMany({ orderBy: { key: "asc" } });
    return ok(settings);
  } catch (error) {
    return fail(error, 403);
  }
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const body = createSchema.parse(await request.json());
    const setting = await prisma.panelSetting.upsert({
      where: { key: body.key },
      update: { value: body.value },
      create: { key: body.key, value: body.value }
    });
    await auditLog({ userId: user.id, action: "setting.update", targetType: "PanelSetting", targetId: setting.id, metadata: { key: body.key } });
    return ok(setting);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const body = patchSchema.parse(await request.json());
    const setting = await prisma.panelSetting.upsert({
      where: { key: body.key },
      update: { value: body.value },
      create: { key: body.key, value: body.value }
    });
    await auditLog({ userId: user.id, action: "setting.update", targetType: "PanelSetting", targetId: setting.id, metadata: { key: body.key } });
    return ok(setting);
  } catch (error) {
    return fail(error);
  }
}
