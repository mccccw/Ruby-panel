import path from "node:path";

export function safeJoin(basePath: string, requestedPath: string): string {
  const normalizedBase = path.resolve(basePath);
  const target = path.resolve(normalizedBase, requestedPath.replace(/^[/\\]+/, ""));
  const relative = path.relative(normalizedBase, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path escapes the server data directory");
  }
  return target;
}
