import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { safeJoin } from "@/lib/server-paths";

const writeSchema = z.object({
  action: z.enum(["write", "mkdir", "extractZip"]),
  path: z.string().min(1),
  content: z.string().optional()
});

async function basePath(serverId: string): Promise<string> {
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  await fs.mkdir(server.dataPath, { recursive: true });
  return server.dataPath;
}

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.FILES_READ);
    const url = new URL(request.url);
    const requested = url.searchParams.get("path") ?? ".";
    const target = safeJoin(await basePath(serverId), requested);
    if (url.searchParams.get("mode") === "read") {
      const content = await fs.readFile(target, "utf8");
      return ok({ path: requested, content });
    }
    const entries = await fs.readdir(target, { withFileTypes: true });
    const data = await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(target, entry.name);
        const stat = await fs.stat(full);
        return {
          name: entry.name,
          path: path.posix.join(requested === "." ? "" : requested.replaceAll("\\", "/"), entry.name),
          type: entry.isDirectory() ? "directory" as const : "file" as const,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString()
        };
      })
    );
    return ok(data.sort((left, right) => Number(right.type === "directory") - Number(left.type === "directory") || left.name.localeCompare(right.name)));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.FILES_WRITE);
    const base = await basePath(serverId);
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const uploadPath = String(form.get("path") ?? ".");
      if (!(file instanceof File)) {
        throw new Error("Missing upload file");
      }
      const target = safeJoin(base, path.join(uploadPath, file.name));
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
      await auditLog({ userId: user.id, action: "file.upload", targetType: "Server", targetId: serverId, metadata: { path: uploadPath, file: file.name } });
      return ok({ path: uploadPath });
    }
    const body = writeSchema.parse(await request.json());
    const target = safeJoin(base, body.path);
    if (body.action === "mkdir") {
      await fs.mkdir(target, { recursive: true });
    }
    if (body.action === "write") {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, body.content ?? "", "utf8");
    }
    if (body.action === "extractZip") {
      const zip = await JSZip.loadAsync(await fs.readFile(target));
      for (const [name, entry] of Object.entries(zip.files)) {
        const destination = safeJoin(base, name);
        if (entry.dir) {
          await fs.mkdir(destination, { recursive: true });
        } else {
          await fs.mkdir(path.dirname(destination), { recursive: true });
          await fs.writeFile(destination, Buffer.from(await entry.async("uint8array")));
        }
      }
    }
    await auditLog({ userId: user.id, action: `file.${body.action}`, targetType: "Server", targetId: serverId, metadata: { path: body.path } });
    return ok({ path: body.path });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.FILES_WRITE);
    const url = new URL(request.url);
    const requested = url.searchParams.get("path");
    if (!requested) {
      throw new Error("Path is required");
    }
    await fs.rm(safeJoin(await basePath(serverId), requested), { recursive: true, force: true });
    await auditLog({ userId: user.id, action: "file.delete", targetType: "Server", targetId: serverId, metadata: { path: requested } });
    return ok({ path: requested });
  } catch (error) {
    return fail(error);
  }
}
