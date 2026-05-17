import { ServerPermission, TaskType } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, jsonObject, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(120),
  type: z.nativeEnum(TaskType),
  schedule: z.string().min(5),
  payload: z.unknown().optional()
});

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.TASKS);
    const tasks = await prisma.scheduledTask.findMany({ where: { serverId }, orderBy: { createdAt: "desc" } });
    return ok(tasks.map((task) => ({ ...task, createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString(), lastRun: task.lastRun?.toISOString() ?? null, nextRun: task.nextRun?.toISOString() ?? null })));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.TASKS);
    const body = schema.parse(await request.json());
    const task = await prisma.scheduledTask.create({ data: { serverId, name: body.name, type: body.type, schedule: body.schedule, payload: jsonObject(body.payload) } });
    await auditLog({ userId: user.id, action: "task.create", targetType: "Server", targetId: serverId, metadata: { taskId: task.id, type: body.type } });
    return ok({ id: task.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
