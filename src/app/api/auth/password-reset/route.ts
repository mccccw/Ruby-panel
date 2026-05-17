import crypto from "node:crypto";
import { addHours } from "date-fns";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { hashPassword, hashSecret, isStrongPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/notifications";
import { absoluteUrl } from "@/lib/utils";

const requestSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ token: z.string().min(20), password: z.string().min(12) });

export async function POST(request: Request) {
  try {
    guarded(request);
    const body = requestSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (user) {
      const token = crypto.randomBytes(32).toString("base64url");
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash: hashSecret(token), expiresAt: addHours(new Date(), 1) }
      });
      await sendEmail(user.email, "Ruby Panel password reset", `Reset your password: ${absoluteUrl(`/reset-password?token=${token}`)}`);
      await auditLog({ userId: user.id, action: "auth.password_reset.request", targetType: "User", targetId: user.id });
    }
    return ok({ sent: true });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    guarded(request);
    const body = resetSchema.parse(await request.json());
    if (!isStrongPassword(body.password)) {
      throw new Error("Password must contain uppercase, lowercase, number, and symbol");
    }
    const token = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashSecret(body.token) } });
    if (!token || token.usedAt || token.expiresAt < new Date()) {
      throw new Error("Reset token is invalid or expired");
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: token.userId }, data: { passwordHash: await hashPassword(body.password), passwordChangedAt: new Date() } }),
      prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
      prisma.userSession.deleteMany({ where: { userId: token.userId } })
    ]);
    await auditLog({ userId: token.userId, action: "auth.password_reset.complete", targetType: "User", targetId: token.userId });
    return ok({ reset: true });
  } catch (error) {
    return fail(error);
  }
}
