import path from "node:path";
import { Prisma, Role, ServerPermission, ServerStatus, ServerType } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { createServerContainer } from "@/lib/docker";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(280).optional(),
  type: z.nativeEnum(ServerType),
  version: z.string().min(2),
  ramMb: z.number().int().min(512).max(32768),
  cpuPercent: z.number().min(10).max(800),
  diskGb: z.number().min(1).max(2048),
  port: z.number().int().min(1).max(65535).optional(),
  jvmFlags: z.array(z.string()).default([]),
  autoBackup: z.boolean().default(false),
  backupSchedule: z.string().optional(),
  backupRetention: z.number().int().min(1).max(100).default(7)
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
  const used = new Set((await prisma.server.findMany({ select: { port: true } })).map((server) => server.port));
  for (let port = start; port <= end; port += 1) {
    if (!used.has(port)) {
      return port;
    }
  }
  throw new Error("No free Minecraft ports are available");
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const where: Prisma.ServerWhereInput =
      user.role === Role.USER || user.role === Role.MODERATOR ? { users: { some: { userId: user.id } } } : {};
    const servers = await prisma.server.findMany({ where, orderBy: { updatedAt: "desc" } });
    return ok(
      servers.map((server) => ({
        id: server.id,
        name: server.name,
        description: server.description,
        type: server.type,
        version: server.version,
        status: server.status,
        port: server.port,
        ramMb: server.ramMb,
        cpuPercent: server.cpuPercent,
        diskGb: server.diskGb,
        updatedAt: server.updatedAt.toISOString()
      }))
    );
  } catch (error) {
    return fail(error, 401);
  }
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const input = createSchema.parse(await request.json());
    const port = await allocatePort(input.port);
    const idSeed = `${slugify(input.name)}-${Date.now().toString(36)}`;
    const dataRoot = process.env.SERVER_DATA_ROOT ?? "./.data/servers";
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
        dataPath: path.resolve(dataRoot, idSeed),
        jvmFlags: input.jvmFlags,
        autoBackup: input.autoBackup,
        backupSchedule: input.backupSchedule ?? null,
        backupRetention: input.backupRetention,
        env: {} as Prisma.InputJsonObject,
        users: {
          create: {
            user: { connect: { id: user.id } },
            permissions: Object.values(ServerPermission)
          }
        }
      };
    const server = await prisma.server.create({ data });
    try {
      await createServerContainer(server.id);
    } catch (containerError) {
      const isInfraError =
        containerError instanceof Error &&
        (containerError.message.includes("ENOENT") ||
          containerError.message.includes("ECONNREFUSED") ||
          containerError.message.includes("EACCES") ||
          containerError.message.includes("socket") ||
          containerError.message.includes("docker"));
      if (!isInfraError) {
        throw containerError;
      }
    }
    await auditLog({ userId: user.id, action: "server.create", targetType: "Server", targetId: server.id, metadata: { port, type: input.type } });
    return ok({ id: server.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
