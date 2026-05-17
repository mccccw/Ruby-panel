import { Role } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z.string().max(500).optional()
});

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR]);
    const requests = await prisma.serverRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, email: true } } }
    });
    return ok(requests);
  } catch (error) {
    return fail(error, 403);
  }
}

export async function PATCH(request: Request) {
  try {
    guarded(request);
    const actor = await requireUser(request);
    requireRole(actor, [Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR]);
    const url = new URL(request.url);
    const requestId = url.searchParams.get("id");
    if (!requestId) return fail(new Error("Missing id parameter"));
    const body = patchSchema.parse(await request.json());
    const updated = await prisma.serverRequest.update({
      where: { id: requestId },
      data: { status: body.status as "APPROVED" | "REJECTED", adminNote: body.adminNote ?? null }
    });
    await auditLog({ userId: actor.id, action: `server_request.${body.status.toLowerCase()}`, targetType: "ServerRequest", targetId: requestId });
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}
