import fs from "node:fs/promises";
import path from "node:path";
import { ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { getModrinthVersions, searchModrinth } from "@/lib/plugins/modrinth";
import { searchCurseForge } from "@/lib/plugins/curseforge";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { safeJoin } from "@/lib/server-paths";

const installSchema = z.object({
  source: z.literal("modrinth"),
  projectId: z.string().min(1),
  versionId: z.string().optional()
});

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.PLUGINS);
    const query = new URL(request.url).searchParams.get("q") ?? "";
    const [modrinth, curseforge] = await Promise.all([searchModrinth(query), searchCurseForge(query)]);
    return ok([
      ...modrinth.map((item) => ({ id: item.project_id, source: "modrinth" as const, title: item.title, description: item.description, iconUrl: item.icon_url, downloads: item.downloads, updatedAt: item.date_modified })),
      ...curseforge.map((item) => ({ id: String(item.id), source: "curseforge" as const, title: item.name, description: item.summary, iconUrl: item.logo?.thumbnailUrl ?? null, downloads: item.downloadCount, updatedAt: item.dateModified }))
    ]);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.PLUGINS);
    const body = installSchema.parse(await request.json());
    const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
    const versions = await getModrinthVersions(body.projectId);
    const selected = versions.find((version) => version.id === body.versionId) ?? versions[0];
    const file = selected?.files.find((candidate) => candidate.primary) ?? selected?.files[0];
    if (!file) {
      throw new Error("No downloadable plugin file was found");
    }
    const response = await fetch(file.url);
    if (!response.ok) {
      throw new Error(`Plugin download failed: ${response.status}`);
    }
    const folder = server.type === "FABRIC" || server.type === "FORGE" || server.type === "NEOFORGE" || server.type === "QUILT" ? "mods" : "plugins";
    const target = safeJoin(server.dataPath, path.join(folder, file.filename));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
    await auditLog({ userId: user.id, action: "plugin.install", targetType: "Server", targetId: serverId, metadata: { source: body.source, projectId: body.projectId, file: file.filename } });
    return ok({ installed: file.filename, restartRequired: true });
  } catch (error) {
    return fail(error);
  }
}
