"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export type LiveStats = {
  cpuPercent: number;
  ramMb: number;
  ramLimitMb: number;
  playerCount: number;
  tps: number | null;
  netRxKb: number;
  netTxKb: number;
};

export function useServerStats(serverId: string) {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:3001` : "http://localhost:3001");
    const socket: Socket = io(socketUrl, {
      transports: ["websocket"],
      auth: { token: "browser-session" }
    });
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("stats:join", serverId);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("stats:update", (payload: LiveStats) => setStats(payload));
    return () => {
      socket.disconnect();
    };
  }, [serverId]);

  return { stats, connected };
}
