"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export function useConsole(serverId: string) {
  const [lines, setLines] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:3001` : "http://localhost:3001");
    const socket: Socket = io(socketUrl, {
      transports: ["websocket"],
      auth: { token: "browser-session" }
    });
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("console:join", serverId);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("console:line", (line: string) => setLines((current) => [...current.slice(-999), line]));
    return () => {
      socket.disconnect();
    };
  }, [serverId]);

  return {
    connected,
    lines,
    sendCommand(command: string) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:3001` : "http://localhost:3001");
      const socket: Socket = io(socketUrl, {
        transports: ["websocket"],
        auth: { token: "browser-session" }
      });
      socket.emit("console:command", { serverId, command });
      socket.disconnect();
    },
    clear() {
      setLines([]);
    }
  };
}
