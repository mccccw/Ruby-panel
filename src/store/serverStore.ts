import { create } from "zustand";

type ServerState = {
  activeServerId: string | null;
  setActiveServerId: (serverId: string | null) => void;
};

export const useServerStore = create<ServerState>((set) => ({
  activeServerId: null,
  setActiveServerId: (activeServerId) => set({ activeServerId })
}));
