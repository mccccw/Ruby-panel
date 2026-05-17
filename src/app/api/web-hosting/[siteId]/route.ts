import { z } from "zod";
import { Prisma } from "@prisma/client";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(80).optional(),
  buildCommand: z.string().nullable().optional(),
  startCommand: z.string().nullable().optional(),
  outputDir: z.string().nullable().optional()
});

export async function GET(request: Request, context: { params: Promise<{ siteId: string }> }) {
  try {
    await requireUser(request);
    const { siteId } = await context.params;
    return ok(await prisma.website.findUniqueOrThrow({ where: { id: siteId }, include: { domains: true, envVars: true, deployments: true, databases: true } }));
  } catch (error) {
    return fail(error, 404);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ siteId: string }> }) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const { siteId } = await context.params;
    const body = schema.parse(await request.json());
    const data: Prisma.WebsiteUpdateInput = {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.buildCommand !== undefined ? { buildCommand: body.buildCommand } : {}),
      ...(body.startCommand !== undefined ? { startCommand: body.startCommand } : {}),
      ...(body.outputDir !== undefined ? { outputDir: body.outputDir } : {})
    };
    const site = await prisma.website.update({ where: { id: siteId }, data });
    await auditLog({ userId: user.id, action: "website.update", targetType: "Website", targetId: siteId });
    return ok(site);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ siteId: string }> }) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const { siteId } = await context.params;
    await prisma.website.delete({ where: { id: siteId } });
    await auditLog({ userId: user.id, action: "website.delete", targetType: "Website", targetId: siteId });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
