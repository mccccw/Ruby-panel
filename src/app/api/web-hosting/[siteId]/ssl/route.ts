import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request, context: { params: Promise<{ siteId: string }> }) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const { siteId } = await context.params;
    await auditLog({ userId: user.id, action: "website.ssl", targetType: "Website", targetId: siteId });
    return ok({ accepted: true, siteId });
  } catch (error) {
    return fail(error);
  }
}
