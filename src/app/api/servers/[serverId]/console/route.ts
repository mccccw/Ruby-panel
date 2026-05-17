import { ServerPermission } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.CONSOLE);
    return ok({ socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", room: `server:${serverId}:console` });
  } catch (error) {
    return fail(error);
  }
}
