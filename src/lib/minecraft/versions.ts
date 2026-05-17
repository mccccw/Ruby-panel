import type { MinecraftVersion, PaperBuild } from "@/types/minecraft";

type VersionManifest = {
  latest: { release: string; snapshot: string };
  versions: MinecraftVersion[];
};

export async function getMinecraftVersions(): Promise<VersionManifest> {
  const response = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json", {
    next: { revalidate: 60 * 60 }
  });
  if (!response.ok) {
    throw new Error(`Failed to load Minecraft versions: ${response.status}`);
  }
  return (await response.json()) as VersionManifest;
}

export async function getPaperBuilds(version: string): Promise<PaperBuild[]> {
  const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`, {
    next: { revalidate: 60 * 15 }
  });
  if (!response.ok) {
    return [];
  }
  const payload = (await response.json()) as { builds: PaperBuild[] };
  return payload.builds;
}
