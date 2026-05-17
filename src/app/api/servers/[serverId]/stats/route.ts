import { ServerPermission } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getStats } from "@/lib/docker";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.MONITORING);
    const url = new URL(request.url);
    if (url.searchParams.get("live") === "true") {
      const stats = await getStats(serverId);
      return ok(stats);
    }
    const points = await prisma.serverStatSnapshot.findMany({ where: { serverId }, orderBy: { timestamp: "desc" }, take: 180 });
    return ok(points.reverse().map((point) => ({ ...point, timestamp: point.timestamp.toISOString() })));
  } catch (error) {
    return fail(error);
  }
}
