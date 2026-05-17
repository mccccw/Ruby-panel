"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Console({ serverId }: { serverId: string }) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<Terminal | null>(null);
  const socket = useRef<Socket | null>(null);
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }
    const term = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily: "var(--font-geist-mono), JetBrains Mono, monospace",
      fontSize: 13,
      theme: {
        background: "#080809",
        foreground: "#f8f8f8",
        cursor: "#fb7185",
        selectionBackground: "#e11d4860"
      }
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());
    term.open(terminalRef.current);
    fit.fit();
    term.writeln("\x1b[31mRuby Console\x1b[0m connected to the panel bridge.");
    terminal.current = term;
    const nextSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
      transports: ["websocket"],
      auth: { token: "browser-session" }
    });
    socket.current = nextSocket;
    nextSocket.on("connect", () => {
      setConnected(true);
      nextSocket.emit("console:join", serverId);
    });
    nextSocket.on("disconnect", () => setConnected(false));
    nextSocket.on("console:history", (lines: string[]) => lines.forEach((line) => term.writeln(line)));
    nextSocket.on("console:line", (line: string) => term.writeln(line));
    const resize = () => fit.fit();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      nextSocket.disconnect();
      term.dispose();
    };
  }, [serverId]);

  function send() {
    const trimmed = command.trim();
    if (!trimmed) {
      return;
    }
    socket.current?.emit("console:command", { serverId, command: trimmed });
    terminal.current?.writeln(`\x1b[90m> ${trimmed}\x1b[0m`);
    setCommand("");
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-semibold">Live console</p>
          <p className="text-xs text-white/45">{connected ? "Socket bridge online" : "Waiting for socket bridge"}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => terminal.current?.clear()}>
          Clear
        </Button>
      </div>
      <div ref={terminalRef} className="h-[58vh] bg-black p-3" />
      <form
        className="flex gap-2 border-t border-white/10 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <Input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="say Hello from Ruby Panel" />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
