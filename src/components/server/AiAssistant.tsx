"use client";

import { Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiStream } from "@/hooks/useAiStream";
import { useAiStore } from "@/store/aiStore";

export function AiAssistant({ serverId }: { serverId: string }) {
  const [input, setInput] = useState("");
  const { messages, addMessage, updateMessage, clearServer } = useAiStore();
  const current = useMemo(() => messages.filter((message) => message.serverId === serverId), [messages, serverId]);
  const stream = useAiStream(serverId);

  async function submit() {
    const text = input.trim();
    if (!text || stream.streaming) {
      return;
    }
    const userMessage = { id: crypto.randomUUID(), serverId, role: "user" as const, content: text, createdAt: new Date().toISOString() };
    const assistantId = crypto.randomUUID();
    addMessage(userMessage);
    addMessage({ id: assistantId, serverId, role: "assistant", content: "", createdAt: new Date().toISOString() });
    setInput("");
    let content = "";
    await stream.send(
      [...current, userMessage].map((message) => ({ role: message.role, content: message.content })),
      (token) => {
        content += token;
        updateMessage(assistantId, content);
      }
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section className="glass-card flex min-h-[650px] flex-col p-0">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">Ruby AI Assistant</h2>
          <p className="text-sm text-white/45">Context-aware guidance with server metadata, logs, file tree, and configs injected per request.</p>
        </div>
        <div className="flex-1 space-y-4 overflow-auto p-5">
          {current.length === 0 ? <p className="text-sm text-white/45">Ask Ruby to diagnose lag, tune JVM flags, inspect plugins, or prepare safe config changes.</p> : null}
          {current.map((message) => (
            <article key={message.id} className={message.role === "user" ? "ml-auto max-w-2xl rounded-2xl bg-ruby-600 p-4" : "max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-4"}>
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content || (message.role === "assistant" ? "Ruby is thinking..." : "")}</p>
            </article>
          ))}
          {stream.error ? <p className="rounded-lg border border-ruby-500/30 bg-ruby-600/10 p-3 text-sm text-ruby-100">{stream.error}</p> : null}
        </div>
        <form
          className="border-t border-white/10 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Fix my server lag and explain the safest changes..." />
          <div className="mt-3 flex justify-between">
            <Button type="button" variant="secondary" onClick={() => clearServer(serverId)}>
              Clear
            </Button>
            <Button type="submit" disabled={stream.streaming}>
              <Send className="h-4 w-4" />
              {stream.streaming ? "Streaming..." : "Send"}
            </Button>
          </div>
        </form>
      </section>
      <aside className="glass-card p-5">
        <h3 className="font-semibold">Injected context</h3>
        <ul className="mt-4 space-y-3 text-sm text-white/55">
          <li>Server status, type, version, CPU and RAM limits</li>
          <li>Latest stored stats snapshot</li>
          <li>Last 100 lines of latest.log</li>
          <li>Top two levels of the data directory</li>
          <li>server.properties and Paper/Spigot configs when present</li>
        </ul>
      </aside>
    </div>
  );
}
