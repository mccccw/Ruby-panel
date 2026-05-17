import type { ServerType } from "@prisma/client";

export type MinecraftVersion = {
  id: string;
  type: "release" | "snapshot" | "old_beta" | "old_alpha";
  url: string;
  time: string;
  releaseTime: string;
};

export type PaperBuild = {
  project: "paper";
  version: string;
  build: number;
  downloads: {
    application: {
      name: string;
      sha256: string;
    };
  };
};

export type ServerCreationInput = {
  name: string;
  description?: string;
  type: ServerType;
  version: string;
  ramMb: number;
  cpuPercent: number;
  diskGb: number;
  port?: number;
  jvmFlags: string[];
};
