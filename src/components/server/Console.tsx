"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { io, type Socket } from "socket.io-client";
import { Check, Copy, Play, RefreshCw, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  serverId: string;
  serverPort: number;
  serverStatus: string;
};

export function Console({ serverId, serverPort, serverStatus }: Props) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<Terminal | null>(null);
  const socket = useRef<Socket | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);
  const [powerBusy, setPowerBusy] = useState(false);
  const [status, setStatus] = useState(serverStatus);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;
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
    fitRef.current = fit;
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
    nextSocket.on("server:status", (data: { serverId: string; status: string }) => {
      if (data.serverId === serverId) setStatus(data.status);
    });

    const resize = () => fit.fit();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      nextSocket.disconnect();
      term.dispose();
    };
  }, [serverId]);

  async function power(action: "start" | "stop" | "restart") {
    setPowerBusy(true);
    terminal.current?.writeln(`\x1b[33m[Panel] Sending ${action}...\x1b[0m`);
    try {
      const res = await fetch(`/api/servers/${serverId}/power`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action })
      });
      const payload = await res.json() as { ok: boolean; error?: string };
      if (!payload.ok) {
        throw new Error(payload.error ?? "Power action failed");
      }
      toast.success(`Server ${action} command sent`);
      terminal.current?.writeln(`\x1b[32m[Panel] ${action} command accepted.\x1b[0m`);
      if (action === "start") setStatus("STARTING");
      if (action === "stop") setStatus("STOPPING");
      if (action === "restart") setStatus("STOPPING");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Power action failed";
      toast.error(msg);
      terminal.current?.writeln(`\x1b[31m[Panel] Error: ${msg}\x1b[0m`);
    } finally {
      setPowerBusy(false);
    }
  }

  function send() {
    const trimmed = command.trim();
    if (!trimmed) return;
    socket.current?.emit("console:command", { serverId, command: trimmed });
    terminal.current?.writeln(`\x1b[90m> ${trimmed}\x1b[0m`);
    setCommand("");
  }

  function copyIp() {
    const ip = `${window.location.hostname}:${serverPort}`;
    void navigator.clipboard.writeText(ip).then(() => {
      setCopied(true);
      toast.success("Server IP copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isRunning = status === "RUNNING";
  const isStopped = status === "STOPPED";

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-semibold">Live console</p>
          <p className="text-xs text-white/45">{connected ? "Socket bridge online" : "Waiting for socket bridge"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyIp}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {window?.location?.hostname ?? "localhost"}:{serverPort}
          </button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-1.5 bg-green-600/20 text-green-300 hover:bg-green-600/30 border border-green-600/30"
            disabled={powerBusy || isRunning}
            onClick={() => power("start")}
          >
            <Play className="h-3.5 w-3.5" />
            Start
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-1.5 bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-600/30"
            disabled={powerBusy || isStopped}
            onClick={() => power("stop")}
          >
            <Square className="h-3.5 w-3.5" />
            Stop
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-1.5 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-600/30"
            disabled={powerBusy || isStopped}
            onClick={() => power("restart")}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restart
          </Button>

          <Button variant="secondary" size="sm" onClick={() => terminal.current?.clear()}>
            Clear
          </Button>
        </div>
      </div>

      <div ref={terminalRef} className="h-[55vh] bg-black p-3" />

      <form
        className="flex gap-2 border-t border-white/10 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <Input
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="say Hello · give @a diamond · stop"
          className="font-mono text-sm"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
