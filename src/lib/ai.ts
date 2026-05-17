import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { safeJoin } from "@/lib/server-paths";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaChunk = {
  message?: { content?: string };
  done?: boolean;
  error?: string;
};

function asOllamaChunk(value: unknown): OllamaChunk {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as OllamaChunk;
}

async function readIfExists(filePath: string, maxBytes: number): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    return buffer.subarray(Math.max(0, buffer.length - maxBytes)).toString("utf8");
  } catch {
    return "";
  }
}

async function tree(dir: string, depth: number): Promise<string[]> {
  if (depth <= 0) {
    return [];
  }
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const lines: string[] = [];
    for (const entry of entries.slice(0, 80)) {
      lines.push(`${"  ".repeat(2 - depth)}${entry.isDirectory() ? "dir " : "file"} ${entry.name}`);
      if (entry.isDirectory()) {
        lines.push(...(await tree(path.join(dir, entry.name), depth - 1)));
      }
    }
    return lines;
  } catch {
    return [];
  }
}

export async function buildServerAiContext(serverId: string): Promise<string> {
  const server = await prisma.server.findUniqueOrThrow({
    where: { id: serverId },
    include: { stats: { orderBy: { timestamp: "desc" }, take: 1 } }
  });
  const latestStats = server.stats[0];
  const latestLog = await readIfExists(safeJoin(server.dataPath, "logs/latest.log"), 32_000);
  const files = await tree(server.dataPath, 2);
  const configs = await Promise.all(
    ["server.properties", "spigot.yml", "config/paper-global.yml", "config/paper-world-defaults.yml"].map(async (file) => ({
      file,
      content: await readIfExists(safeJoin(server.dataPath, file), 16_000)
    }))
  );
  return JSON.stringify(
    {
      system: "You are Ruby AI, an expert Minecraft server administrator. Give precise operational advice, prefer safe reversible changes, and explain server-impacting changes before proposing them.",
      context: {
        server: {
          name: server.name,
          type: server.type,
          version: server.version,
          status: server.status,
          ramMb: server.ramMb,
          cpuPercent: server.cpuPercent
        },
        stats: latestStats
          ? {
              tps: latestStats.tps,
              players: latestStats.playerCount,
              cpu: latestStats.cpuPercent,
              ram: latestStats.ramMb,
              entities: latestStats.entities,
              chunks: latestStats.chunks
            }
          : null,
        recentLogs: latestLog,
        fileTree: files.join("\n"),
        configs: Object.fromEntries(configs.map((config) => [config.file, config.content]))
      }
    },
    null,
    2
  );
}

export async function streamOllamaChat(messages: ChatMessage[], serverId: string): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const context = await buildServerAiContext(serverId);
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error("OLLAMA_CLOUD_API_KEY is not configured");
  }
  const response = await fetch(process.env.OLLAMA_CLOUD_BASE_URL ?? "https://ollama.com/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_CLOUD_MODEL ?? "deepseek-v4-pro:cloud",
      stream: true,
      messages: [{ role: "system", content: context }, ...messages]
    })
  });
  if (!response.ok || !response.body) {
    throw new Error(`Ollama Cloud request failed with status ${response.status}`);
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
            if (!trimmed) {
              continue;
            }
            const chunk = asOllamaChunk(JSON.parse(trimmed) as unknown);
            if (chunk.error) {
              controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: chunk.error })}\n\n`));
              continue;
            }
            const token = chunk.message?.content;
            if (token) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
            }
          }
        }
      } catch (error) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: error instanceof Error ? error.message : "AI stream failed" })}\n\n`));
        controller.close();
      }
    },
    cancel() {
      void reader.cancel();
    }
  });
}
