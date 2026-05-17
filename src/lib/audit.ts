import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publishJson } from "@/lib/redis";

export async function auditLog(input: {
  userId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const data: Prisma.AuditLogCreateInput = {
    action: input.action,
    ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
    ...(input.targetType ? { targetType: input.targetType } : {}),
    ...(input.targetId ? { targetId: input.targetId } : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
    ...(input.userAgent ? { userAgent: input.userAgent } : {})
  };
  const entry = await prisma.auditLog.create({
    data,
    include: { user: { select: { username: true, email: true } } }
  });
  await publishJson("global:activity", {
    id: entry.id,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    createdAt: entry.createdAt.toISOString(),
    user: entry.user
  });
}
