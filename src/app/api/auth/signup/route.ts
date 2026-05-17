import { Role } from "@prisma/client";
import { z } from "zod";
import { fail, ok } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email.toLowerCase() },
          { username: body.username }
        ]
      }
    });

    if (existing) {
      return fail("Email or username already exists", 400);
    }

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        username: body.username,
        passwordHash: await hashPassword(body.password),
        role: Role.USER,
        isActive: true
      }
    });

    return ok({ id: user.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
