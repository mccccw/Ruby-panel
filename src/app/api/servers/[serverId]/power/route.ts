import { ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { killServer, restartServer, startServer, stopServer } from "@/lib/docker";
import { requireServerPermission } from "@/lib/permissions";

const schema = z.object({ action: z.enum(["start", "stop", "restart", "kill"]) });

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.MANAGE);
    const { action } = schema.parse(await request.json());
    if (action === "start") await startServer(serverId);
    if (action === "stop") await stopServer(serverId);
    if (action === "restart") await restartServer(serverId);
    if (action === "kill") await killServer(serverId);
    await auditLog({ userId: user.id, action: `server.${action}`, targetType: "Server", targetId: serverId });
    return ok({ action });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const isDockerError = msg.includes("ENOENT") || msg.includes("ECONNREFUSED") || msg.includes("socket") || msg.includes("Docker") || msg.includes("docker");
    if (isDockerError) {
      return fail(new Error("Docker is not running or not installed. Start Docker and try again."));
    }
    return fail(error);
  }
}
