import { ServerType } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(64),
  type: z.nativeEnum(ServerType),
  version: z.string().min(2),
  ramMb: z.number().int().min(512).max(32768).default(2048),
  cpuPercent: z.number().min(10).max(800).default(100),
  diskGb: z.number().min(1).max(2048).default(20),
  reason: z.string().max(500).optional()
});

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const requests = await prisma.serverRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });
    return ok(requests);
  } catch (error) {
    return fail(error, 401);
  }
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const body = schema.parse(await request.json());
    const req = await prisma.serverRequest.create({
      data: {
        userId: user.id,
        name: body.name,
        type: body.type,
        version: body.version,
        ramMb: body.ramMb,
        cpuPercent: body.cpuPercent,
        diskGb: body.diskGb
      }
    });
    return ok({ id: req.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
