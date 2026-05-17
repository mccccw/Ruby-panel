import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { BackupStatus, BackupType, ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().min(2).max(120) });

function runTar(source: string, target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("tar", ["-czf", target, "-C", source, "."], { stdio: "ignore" });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`tar exited with ${code}`))));
  });
}

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.BACKUPS);
    const backups = await prisma.backup.findMany({ where: { serverId }, orderBy: { createdAt: "desc" } });
    return ok(backups.map((backup) => ({ ...backup, createdAt: backup.createdAt.toISOString(), completedAt: backup.completedAt?.toISOString() ?? null })));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.BACKUPS);
    const body = schema.parse(await request.json());
    const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
    const backup = await prisma.backup.create({ data: { serverId, name: body.name, type: BackupType.MANUAL, status: BackupStatus.RUNNING } });
    const backupRoot = path.resolve(process.env.SERVER_DATA_ROOT ?? "./.data/servers", "..", "backups", serverId);
    await fs.mkdir(backupRoot, { recursive: true });
    const filePath = path.join(backupRoot, `${backup.id}.tar.gz`);
    try {
      await runTar(server.dataPath, filePath);
      const file = await fs.readFile(filePath);
      const checksum = crypto.createHash("sha256").update(file).digest("hex");
      const stat = await fs.stat(filePath);
      await prisma.backup.update({ where: { id: backup.id }, data: { status: BackupStatus.COMPLETED, filePath, sizeMb: stat.size / 1024 / 1024, checksum, completedAt: new Date() } });
    } catch (error) {
      await prisma.backup.update({ where: { id: backup.id }, data: { status: BackupStatus.FAILED, errorMsg: error instanceof Error ? error.message : "Backup failed" } });
      throw error;
    }
    await auditLog({ userId: user.id, action: "backup.create", targetType: "Server", targetId: serverId, metadata: { backupId: backup.id } });
    return ok({ id: backup.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
