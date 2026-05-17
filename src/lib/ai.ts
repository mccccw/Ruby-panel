import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { safeJoin } from "@/lib/server-paths";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function readIfExists(filePath: string, maxBytes: number): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    return buffer.subarray(Math.max(0, buffer.length - maxBytes)).toString("utf8");
  } catch {
    return "";
  }
}

async function tree(dir: string, depth: number): Promise<string[]> {
  if (depth <= 0) return [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const lines: string[] = [];
    for (const entry of entries.slice(0, 80)) {
      lines.push(`${"  ".repeat(2 - depth)}${entry.isDirectory() ? "dir " : "file"} ${entry.name}`);
      if (entry.isDirectory()) lines.push(...(await tree(path.join(dir, entry.name), depth - 1)));
    }
    return lines;
  } catch {
    return [];
  }
}

export async function buildServerSystemPrompt(serverId: string): Promise<string> {
  const server = await prisma.server.findUniqueOrThrow({
    where: { id: serverId },
    include: { stats: { orderBy: { timestamp: "desc" }, take: 1 } }
  });
  const latestStats = server.stats[0];
  const latestLog = await readIfExists(safeJoin(server.dataPath, "logs/latest.log"), 8000);
  const files = await tree(server.dataPath, 2);
  const serverProperties = await readIfExists(safeJoin(server.dataPath, "server.properties"), 4000);
  const spigotYml = await readIfExists(safeJoin(server.dataPath, "spigot.yml"), 2000);

  const parts: string[] = [
    "You are Ruby AI, an expert Minecraft server administrator assistant. Give concise, accurate, operational advice. Prefer safe reversible changes. Always explain what a change does before recommending it.",
    "",
    `== SERVER INFO ==`,
    `Name: ${server.name}`,
    `Type: ${server.type}`,
    `Version: ${server.version}`,
    `Status: ${server.status}`,
    `RAM limit: ${server.ramMb} MB`,
    `CPU limit: ${server.cpuPercent}%`,
    `Port: ${server.port}`,
  ];

  if (latestStats) {
    parts.push(
      "",
      "== CURRENT STATS ==",
      `CPU: ${latestStats.cpuPercent.toFixed(1)}%`,
      `RAM: ${latestStats.ramMb.toFixed(0)} MB`,
      `Players: ${latestStats.playerCount}`,
      latestStats.tps !== null ? `TPS: ${latestStats.tps}` : ""
    );
  }

  if (files.length > 0) {
    parts.push("", "== FILE TREE ==", ...files);
  }

  if (serverProperties) {
    parts.push("", "== server.properties ==", serverProperties);
  }

  if (spigotYml) {
    parts.push("", "== spigot.yml ==", spigotYml);
  }

  if (latestLog) {
    parts.push("", "== RECENT LOGS (last 8KB) ==", latestLog);
  }

  return parts.filter((p) => p !== undefined).join("\n");
}

export async function streamOllamaChat(messages: ChatMessage[], serverId: string): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const systemPrompt = await buildServerSystemPrompt(serverId);
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error("OLLAMA_CLOUD_API_KEY is not configured. Add it to .env.local.");
  }
  const model = process.env.OLLAMA_CLOUD_MODEL ?? "deepseek-v4-pro:cloud";
  const baseUrl = process.env.OLLAMA_CLOUD_BASE_URL ?? "https://ollama.com/api/chat";

  const requestBody = {
    model,
    stream: true,
    messages: [{ role: "system", content: systemPrompt }, ...messages]
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok || !response.body) {
    let errorBody = "";
    try {
      errorBody = await response.text();
    } catch {
      // ignore
    }
    throw new Error(
      `Ollama API error ${response.status}: ${errorBody || response.statusText}. Model: ${model}, URL: ${baseUrl}`
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffered = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
            controller.close();
            return;
          }
          buffered += decoder.decode(value, { stream: true });
          const lines = buffered.split("\n");
          buffered = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const chunk = JSON.parse(trimmed) as { message?: { content?: string }; done?: boolean; error?: string };
              if (chunk.error) {
                controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: chunk.error })}\n\n`));
                continue;
              }
              const token = chunk.message?.content;
              if (token) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: error instanceof Error ? error.message : "AI stream failed" })}\n\n`)
        );
        controller.close();
      }
    },
    cancel() {
      void reader.cancel();
    }
  });
}
