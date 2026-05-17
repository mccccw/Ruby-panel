import { createServer } from "node:http";
import { Server } from "socket.io";
import { ServerStatus } from "@prisma/client";
import { execCommand, getStats } from "@/lib/docker";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

type ClientToServerEvents = {
  "console:join": (serverId: string) => void;
  "console:command": (payload: { serverId: string; command: string }) => void;
  "stats:join": (serverId: string) => void;
};

type ServerToClientEvents = {
  "console:history": (lines: string[]) => void;
  "console:line": (line: string) => void;
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

io.on("connection", (socket) => {
  socket.on("console:join", async (serverId) => {
    await socket.join(`server:${serverId}:console`);
    const redis = getRedis();
    if (redis.status === "wait") await redis.connect();
    const history = await redis.lrange(`console:${serverId}`, -1000, -1);
    socket.emit("console:history", history);
  });

  socket.on("stats:join", async (serverId) => {
    await socket.join(`server:${serverId}:stats`);
  });

  socket.on("console:command", async ({ serverId, command }) => {
    try {
      const output = await execCommand(serverId, command);
      const line = output.trim() || `Command sent: ${command}`;
      const redis = getRedis();
      if (redis.status === "wait") await redis.connect();
      await redis.rpush(`console:${serverId}`, line);
      await redis.ltrim(`console:${serverId}`, -1000, -1);
      io.to(`server:${serverId}:console`).emit("console:line", line);
    } catch (error) {
      io.to(`server:${serverId}:console`).emit("console:line", `Ruby socket error: ${error instanceof Error ? error.message : "command failed"}`);
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
        } catch (error) {
          console.error(`Stats collection failed for ${server.id}`, error);
        }
      }
    } catch (error) {
      console.error("Socket interval database error:", error);
    }
  })();
}, 10_000);

const port = Number(process.env.SOCKET_PORT ?? 3001);
httpServer.listen(port, () => {
  console.log(`Ruby Panel socket bridge listening on ${port}`);
});
