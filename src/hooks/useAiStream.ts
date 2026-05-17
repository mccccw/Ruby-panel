"use client";

import { useState } from "react";

export function useAiStream(serverId: string) {
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(messages: Array<{ role: "user" | "assistant"; content: string }>, onToken: (token: string) => void) {
    setStreaming(true);
    setError(null);
    try {
      const response = await fetch(`/api/servers/${serverId}/ai`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages })
      });
      if (!response.ok || !response.body) {
        throw new Error(`AI request failed: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const data = event.split("\n").find((line) => line.startsWith("data: "));
          if (!data) {
            continue;
          }
          const parsed = JSON.parse(data.slice(6)) as { token?: string; error?: string };
          if (parsed.token) {
            onToken(parsed.token);
          }
          if (parsed.error) {
            throw new Error(parsed.error);
          }
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI request failed");
    } finally {
      setStreaming(false);
    }
  }

  return { send, streaming, error };
}
