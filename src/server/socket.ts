import { createServer } from "node:http";
import { Server } from "socket.io";
import { ServerStatus } from "@prisma/client";
import { execCommand, getStats } from "@/lib/docker";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

type ClientToServerEvents = {
  "console:join": (serverId: string) => void;
  "console:command": (payload: { serverId: string; command: string }) => void;
  "stats:join": (serverId: string) => void;
};

type ServerToClientEvents = {
  "console:history": (lines: string[]) => void;
  "console:line": (line: string) => void;
  "server:status": (data: { serverId: string; status: string }) => void;
  "stats:update": (payload: { cpuPercent: number; ramMb: number; ramLimitMb: number; playerCount: number; tps: number | null; netRxKb: number; netTxKb: number }) => void;
};

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (typeof token === "string" && token.length > 0) {
    next();
    return;
  }
  next(new Error("Missing socket auth token"));
});

async function safeRedisConnect() {
  try {
    const redis = getRedis();
    if (redis.status === "wait") await redis.connect();
    return redis;
  } catch {
    return null;
  }
}

io.on("connection", (socket) => {
  socket.on("console:join", async (serverId) => {
    await socket.join(`server:${serverId}:console`);
    try {
      const redis = await safeRedisConnect();
      if (redis) {
        const history = await redis.lrange(`console:${serverId}`, -1000, -1);
        socket.emit("console:history", history);
      }
    } catch {
      // Redis unavailable, no history
    }
  });

  socket.on("stats:join", async (serverId) => {
    await socket.join(`server:${serverId}:stats`);
  });

  socket.on("console:command", async ({ serverId, command }) => {
    try {
      const output = await execCommand(serverId, command);
      const line = output.trim() || `Command sent: ${command}`;
      try {
        const redis = await safeRedisConnect();
        if (redis) {
          await redis.rpush(`console:${serverId}`, line);
          await redis.ltrim(`console:${serverId}`, -1000, -1);
        }
      } catch {
        // Redis unavailable, skip history save
      }
      io.to(`server:${serverId}:console`).emit("console:line", line);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "command failed";
      const isDockerErr = msg.includes("ENOENT") || msg.includes("socket") || msg.includes("docker");
      io.to(`server:${serverId}:console`).emit(
        "console:line",
        isDockerErr ? `\x1b[31m[Panel] Docker not available: ${msg}\x1b[0m` : `\x1b[31m[Panel] Error: ${msg}\x1b[0m`
      );
    }
  });
});

setInterval(() => {
  void (async () => {
    try {
      const servers = await prisma.server.findMany({ where: { status: ServerStatus.RUNNING } });
      for (const server of servers) {
        try {
          const stats = await getStats(server.id);
          const snapshot = await prisma.serverStatSnapshot.create({
            data: {
              serverId: server.id,
              cpuPercent: stats.cpuPercent,
              ramMb: stats.ramMb,
              playerCount: 0,
              tps: null,
              netRxKb: stats.netRxKb,
              netTxKb: stats.netTxKb
            }
          });
          io.to(`server:${server.id}:stats`).emit("stats:update", {
            ...stats,
            playerCount: snapshot.playerCount,
            tps: snapshot.tps
          });
        } catch {
          // Docker or DB error for this server, skip
        }
      }
    } catch {
      // DB unavailable
    }
  })();
}, 10_000);

const port = Number(process.env.SOCKET_PORT ?? 3001);
httpServer.listen(port, () => {
  console.log(`Ruby Panel socket bridge listening on ${port}`);
});
