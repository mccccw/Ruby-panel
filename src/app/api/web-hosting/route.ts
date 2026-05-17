import path from "node:path";
import { Prisma, SiteStatus, SiteType } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(80),
  type: z.nativeEnum(SiteType),
  domain: z.string().min(3).optional(),
  buildCommand: z.string().optional(),
  startCommand: z.string().optional(),
  outputDir: z.string().optional()
});

async function allocateWebPort(): Promise<number> {
  const start = Number(process.env.WEB_PORT_RANGE_START ?? 8100);
  const end = Number(process.env.WEB_PORT_RANGE_END ?? 8200);
  const used = new Set((await prisma.website.findMany({ select: { port: true } })).map((site) => site.port));
  for (let port = start; port <= end; port += 1) {
    if (!used.has(port)) return port;
  }
  throw new Error("No free web ports are available");
}

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const sites = await prisma.website.findMany({ orderBy: { updatedAt: "desc" }, include: { domains: true } });
    return ok(sites);
  } catch (error) {
    return fail(error, 401);
  }
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const body = schema.parse(await request.json());
    const idSeed = `${slugify(body.name)}-${Date.now().toString(36)}`;
    const data: Prisma.WebsiteCreateInput = {
      name: body.name,
      type: body.type,
      status: SiteStatus.STOPPED,
      dataPath: path.resolve(process.env.WEBSITE_DATA_ROOT ?? "./.data/websites", idSeed),
      buildCommand: body.buildCommand ?? null,
      startCommand: body.startCommand ?? null,
      outputDir: body.outputDir ?? null,
      port: await allocateWebPort(),
      users: { create: { user: { connect: { id: user.id } }, role: "owner" } },
      ...(body.domain ? { domains: { create: { domain: body.domain } } } : {})
    };
    const site = await prisma.website.create({ data });
    await auditLog({ userId: user.id, action: "website.create", targetType: "Website", targetId: site.id, metadata: { type: body.type } as Prisma.InputJsonObject });
    return ok({ id: site.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
