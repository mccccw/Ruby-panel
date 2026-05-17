import { Prisma, ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { deleteServerContainer } from "@/lib/docker";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  description: z.string().max(280).nullable().optional(),
  iconUrl: z.string().url().nullable().optional(),
  ramMb: z.number().int().min(512).max(32768).optional(),
  cpuPercent: z.number().min(10).max(800).optional(),
  diskGb: z.number().min(1).max(2048).optional(),
  autoBackup: z.boolean().optional(),
  backupSchedule: z.string().nullable().optional(),
  backupRetention: z.number().int().min(1).max(365).optional()
});

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.VIEW);
    const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
    return ok(server);
  } catch (error) {
    return fail(error, 404);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.SETTINGS);
    const input = patchSchema.parse(await request.json());
    const data: Prisma.ServerUpdateInput = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.iconUrl !== undefined ? { iconUrl: input.iconUrl } : {}),
      ...(input.ramMb !== undefined ? { ramMb: input.ramMb } : {}),
      ...(input.cpuPercent !== undefined ? { cpuPercent: input.cpuPercent } : {}),
      ...(input.diskGb !== undefined ? { diskGb: input.diskGb } : {}),
      ...(input.autoBackup !== undefined ? { autoBackup: input.autoBackup } : {}),
      ...(input.backupSchedule !== undefined ? { backupSchedule: input.backupSchedule } : {}),
      ...(input.backupRetention !== undefined ? { backupRetention: input.backupRetention } : {})
    };
    const server = await prisma.server.update({ where: { id: serverId }, data });
    await auditLog({ userId: user.id, action: "server.update", targetType: "Server", targetId: serverId, metadata: input });
    return ok(server);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.MANAGE);
    const url = new URL(request.url);
    await deleteServerContainer(serverId, url.searchParams.get("deleteData") === "true");
    await auditLog({ userId: user.id, action: "server.delete", targetType: "Server", targetId: serverId });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
