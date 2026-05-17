import fs from "node:fs/promises";
import path from "node:path";
import { Prisma, Role, ServerPermission, ServerStatus, ServerType } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const importSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(280).optional(),
  type: z.nativeEnum(ServerType),
  version: z.string().min(2),
  sourcePath: z.string().min(1, "Source path is required"),
  ramMb: z.number().int().min(512).max(32768).default(2048),
  cpuPercent: z.number().min(10).max(800).default(100),
  diskGb: z.number().min(1).max(2048).default(20),
  port: z.number().int().min(1).max(65535).optional()
});

async function allocatePort(preferred?: number): Promise<number> {
  if (preferred) {
    const used = await prisma.server.findUnique({ where: { port: preferred } });
    if (used) {
      throw new Error(`Port ${preferred} is already allocated`);
    }
    return preferred;
  }
  const start = Number(process.env.MC_PORT_RANGE_START ?? 25565);
  const end = Number(process.env.MC_PORT_RANGE_END ?? 25665);
  const used = new Set((await prisma.server.findMany({ select: { port: true } })).map((s) => s.port));
  for (let port = start; port <= end; port += 1) {
    if (!used.has(port)) {
      return port;
    }
  }
  throw new Error("No free Minecraft ports are available");
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    if (user.role !== Role.SUPERADMIN && user.role !== Role.ADMIN) {
      return fail(new Error("Only admins can import servers"), 403);
    }
    const input = importSchema.parse(await request.json());

    const sourceStat = await fs.stat(input.sourcePath).catch(() => null);
    if (!sourceStat?.isDirectory()) {
      return fail(new Error("Source path does not exist or is not a directory"), 400);
    }

    const port = await allocatePort(input.port);
    const idSeed = `${slugify(input.name)}-${Date.now().toString(36)}`;
    const dataRoot = process.env.SERVER_DATA_ROOT ?? "./.data/servers";
    const targetPath = path.resolve(dataRoot, idSeed);

    await fs.cp(input.sourcePath, targetPath, { recursive: true });

    const data: Prisma.ServerCreateInput = {
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      version: input.version,
      status: ServerStatus.STOPPED,
      containerName: `ruby-${idSeed}`,
      port,
      ramMb: input.ramMb,
      cpuPercent: input.cpuPercent,
      diskGb: input.diskGb,
      dataPath: targetPath,
      jvmFlags: [],
      env: {} as Prisma.InputJsonObject,
      users: {
        create: {
          user: { connect: { id: user.id } },
          permissions: Object.values(ServerPermission)
        }
      }
    };
    const server = await prisma.server.create({ data });
    await auditLog({ userId: user.id, action: "server.import", targetType: "Server", targetId: server.id, metadata: { sourcePath: input.sourcePath, port, type: input.type } });
    return ok({ id: server.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
