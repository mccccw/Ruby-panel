import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AiChatMessage = {
  id: string;
  serverId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type AiState = {
  messages: AiChatMessage[];
  addMessage: (message: AiChatMessage) => void;
  updateMessage: (id: string, content: string) => void;
  clearServer: (serverId: string) => void;
};

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((message) => (message.id === id ? { ...message, content } : message))
        })),
      clearServer: (serverId) => set((state) => ({ messages: state.messages.filter((message) => message.serverId !== serverId) }))
    }),
    { name: "ruby-ai-history" }
  )
);
