import fs from "node:fs/promises";
import path from "node:path";
import { getPaperBuilds } from "@/lib/minecraft/versions";

export async function downloadPaperJar(version: string, destinationDir: string): Promise<string> {
  const builds = await getPaperBuilds(version);
  const build = builds.at(-1);
  if (!build) {
    throw new Error(`No Paper builds are available for Minecraft ${version}`);
  }
  const jarName = build.downloads.application.name;
  const url = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build.build}/downloads/${jarName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download Paper jar: ${response.status}`);
  }
  await fs.mkdir(destinationDir, { recursive: true });
  const target = path.join(destinationDir, jarName);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(target, buffer);
  return target;
}
