import { Role, ServerStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureAdmin() {
  try {
    const admin = await prisma.user.findUnique({ where: { email: "cattech3d@gmail.com" } });
    if (!admin) {
      const passwordHash = await hash("@a240924", 12);
      await prisma.user.create({
        data: { email: "cattech3d@gmail.com", username: "cattech", passwordHash, role: Role.SUPERADMIN, isActive: true }
      });
    }
    await prisma.server.updateMany({
      where: { status: { in: ["CREATING", "STARTING", "STOPPING"] } },
      data: { status: "STOPPED" }
    });
  } catch {
    // DB unavailable, skip silently
  }
}

export async function GET(request: Request) {
  try {
    await requireUser(request);
    void ensureAdmin();
    
    let totalServers = 0;
    let runningServers = 0;
    let latestStats: Array<{ timestamp: Date; cpuPercent: number; ramMb: number; playerCount: number }> = [];
    let activity: Array<{ id: string; action: string; targetType: string | null; targetId: string | null; createdAt: Date; user: { username: string; email: string } | null }> = [];

    try {
      const results = await Promise.all([
        prisma.server.count(),
        prisma.server.count({ where: { status: ServerStatus.RUNNING } }),
        prisma.serverStatSnapshot.findMany({ orderBy: { timestamp: "desc" }, take: 180 }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { username: true, email: true } } }
        })
      ]);
      totalServers = results[0];
      runningServers = results[1];
      latestStats = results[2];
      activity = results[3];
    } catch (dbError) {
      console.error("Dashboard DB fetch error:", dbError);
      // Return partial data instead of 401/error if only DB is down
    }

    const resourceSeries = latestStats
      .slice()
      .reverse()
      .map((point) => ({ timestamp: point.timestamp.toISOString(), cpuPercent: point.cpuPercent, ramMb: point.ramMb }));
    return ok({
      totalServers,
      runningServers,
      totalRamUsedMb: latestStats.reduce((sum, point) => sum + point.ramMb, 0),
      totalPlayersOnline: latestStats.reduce((sum, point) => sum + point.playerCount, 0),
      activity: activity.map((entry) => ({
        id: entry.id,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        createdAt: entry.createdAt.toISOString(),
        user: entry.user
      })),
      resourceSeries
    });
  } catch (error) {
    return fail(error, 401);
  }
}
