import { ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { streamOllamaChat } from "@/lib/ai";
import { requireServerPermission } from "@/lib/permissions";

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) })).min(1)
});

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.VIEW);
    const body = schema.parse(await request.json());
    const stream = await streamOllamaChat(body.messages, serverId);
    await auditLog({ userId: user.id, action: "ai.chat", targetType: "Server", targetId: serverId });
    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive"
      }
    });
  } catch (error) {
    return fail(error);
  }
}
