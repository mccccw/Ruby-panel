import { verifySync } from "otplib";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { generateRecoveryCodes, hashSecret, requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const enableSchema = z.object({ secret: z.string().min(16), code: z.string().min(6).max(10) });
const disableSchema = z.object({ password: z.string().min(1), code: z.string().min(6).max(10) });

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const body = enableSchema.parse(await request.json());
    if (!verifySync({ token: body.code.replace(/\s+/g, ""), secret: body.secret }).valid) {
      throw new Error("Authenticator code is invalid");
    }
    const recoveryCodes = generateRecoveryCodes();
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { totpSecret: body.secret, totpEnabled: true } }),
      prisma.recoveryCode.deleteMany({ where: { userId: user.id } }),
      prisma.recoveryCode.createMany({ data: recoveryCodes.map((code) => ({ userId: user.id, codeHash: hashSecret(code) })) })
    ]);
    await auditLog({ userId: user.id, action: "auth.2fa.enable", targetType: "User", targetId: user.id });
    return ok({ recoveryCodes });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const body = disableSchema.parse(await request.json());
    const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    if (!(await verifyPassword(body.password, record.passwordHash))) {
      throw new Error("Password is invalid");
    }
    if (!record.totpSecret || !verifySync({ token: body.code.replace(/\s+/g, ""), secret: record.totpSecret }).valid) {
      throw new Error("Authenticator code is invalid");
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabled: false } }),
      prisma.recoveryCode.deleteMany({ where: { userId: user.id } })
    ]);
    await auditLog({ userId: user.id, action: "auth.2fa.disable", targetType: "User", targetId: user.id });
    return ok({ disabled: true });
  } catch (error) {
    return fail(error);
  }
}
