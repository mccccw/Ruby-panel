import { ServerPermission } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.FILES_READ);
    const worlds = await prisma.worldSnapshot.findMany({ where: { serverId }, orderBy: { createdAt: "desc" } });
    return ok(worlds.map((world) => ({ ...world, createdAt: world.createdAt.toISOString() })));
  } catch (error) {
    return fail(error);
  }
}
