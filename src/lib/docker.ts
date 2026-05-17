import fs from "node:fs/promises";
import path from "node:path";
import Docker from "dockerode";
import { ServerStatus, type Server, type ServerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ContainerStats = {
  cpuPercent: number;
  ramMb: number;
  ramLimitMb: number;
  netRxKb: number;
  netTxKb: number;
};

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET ?? "/var/run/docker.sock" });

function dockerType(type: ServerType): string {
  const map: Record<ServerType, string> = {
    VANILLA: "VANILLA",
    PAPER: "PAPER",
    PURPUR: "PURPUR",
    SPIGOT: "SPIGOT",
    FABRIC: "FABRIC",
    FORGE: "FORGE",
    NEOFORGE: "NEOFORGE",
    QUILT: "QUILT",
    BEDROCK: "BEDROCK",
    VELOCITY: "VELOCITY",
    WATERFALL: "WATERFALL",
    BUNGEECORD: "BUNGEECORD",
    CUSTOM: "CUSTOM"
  };
  return map[type];
}

async function pullImage(image: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (pullError: Error | null, stream?: NodeJS.ReadableStream) => {
      if (pullError) {
        reject(pullError);
        return;
      }
      if (!stream) {
        reject(new Error("Docker pull did not return a stream"));
        return;
      }
      docker.modem.followProgress(stream, (progressError: Error | null) => {
        if (progressError) {
          reject(progressError);
          return;
        }
        resolve();
      });
    });
  });
}

export async function ensureServerDataDir(server: Pick<Server, "dataPath">): Promise<void> {
  await fs.mkdir(server.dataPath, { recursive: true });
}

export async function createServerContainer(serverId: string): Promise<string> {
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.CREATING } });
  await ensureServerDataDir(server);
  const image = "itzg/minecraft-server:latest";
  await pullImage(image);
  const memoryBytes = server.ramMb * 1024 * 1024;
  const cpuQuota = Math.max(10000, Math.round(server.cpuPercent * 1000));
  const container = await docker.createContainer({
    Image: image,
    name: server.containerName,
    Env: [
      "EULA=TRUE",
      `TYPE=${dockerType(server.type)}`,
      `VERSION=${server.version}`,
      `MEMORY=${server.ramMb}M`,
      `JVM_OPTS=${server.jvmFlags.join(" ")}`,
      ...Object.entries((server.env ?? {}) as Record<string, string>).map(([key, value]) => `${key}=${value}`)
    ],
    ExposedPorts: { "25565/tcp": {} },
    HostConfig: {
      Binds: [`${path.resolve(server.dataPath)}:/data`],
      PortBindings: { "25565/tcp": [{ HostPort: String(server.port) }] },
      Memory: memoryBytes,
      CpuQuota: cpuQuota,
      CpuPeriod: 100000,
      RestartPolicy: { Name: "unless-stopped" }
    }
  });
  await prisma.server.update({
    where: { id: serverId },
    data: { containerId: container.id, status: ServerStatus.STOPPED }
  });
  return container.id;
}

async function containerFor(serverId: string) {
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  if (!server.containerId) {
    const containerId = await createServerContainer(serverId);
    return docker.getContainer(containerId);
  }
  return docker.getContainer(server.containerId);
}

export async function startServer(serverId: string): Promise<void> {
  const container = await containerFor(serverId);
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STARTING } });
  await container.start();
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.RUNNING } });
}

export async function stopServer(serverId: string): Promise<void> {
  const container = await containerFor(serverId);
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STOPPING } });
  await container.stop({ t: 30 });
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STOPPED } });
}

export async function restartServer(serverId: string): Promise<void> {
  const container = await containerFor(serverId);
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STOPPING } });
  await container.restart({ t: 30 });
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.RUNNING } });
}

export async function killServer(serverId: string): Promise<void> {
  const container = await containerFor(serverId);
  await container.kill();
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STOPPED } });
}

export async function deleteServerContainer(serverId: string, deleteData: boolean): Promise<void> {
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  if (server.containerId) {
    const container = docker.getContainer(server.containerId);
    try {
      await container.remove({ force: true, v: true });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("no such container")) {
        throw error;
      }
    }
  }
  if (deleteData) {
    const root = path.resolve(process.env.SERVER_DATA_ROOT ?? "./.data/servers");
    const target = path.resolve(server.dataPath);
    if (!target.startsWith(root)) {
      throw new Error("Refusing to remove data outside SERVER_DATA_ROOT");
    }
    await fs.rm(target, { recursive: true, force: true });
  }
  await prisma.server.delete({ where: { id: serverId } });
}

export async function execCommand(serverId: string, command: string): Promise<string> {
  const container = await containerFor(serverId);
  const exec = await container.exec({
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ["mc-send-to-console", command]
  });
  const stream = await exec.start({ hijack: true, stdin: false });
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

type RawStats = {
  cpu_stats: { cpu_usage: { total_usage: number; percpu_usage?: number[] }; system_cpu_usage?: number };
  precpu_stats: { cpu_usage: { total_usage: number }; system_cpu_usage?: number };
  memory_stats: { usage?: number; limit?: number };
  networks?: Record<string, { rx_bytes: number; tx_bytes: number }>;
};

export async function getStats(serverId: string): Promise<ContainerStats> {
  const container = await containerFor(serverId);
  const raw = (await container.stats({ stream: false })) as RawStats;
  const cpuDelta = raw.cpu_stats.cpu_usage.total_usage - raw.precpu_stats.cpu_usage.total_usage;
  const systemDelta = (raw.cpu_stats.system_cpu_usage ?? 0) - (raw.precpu_stats.system_cpu_usage ?? 0);
  const onlineCpus = raw.cpu_stats.cpu_usage.percpu_usage?.length ?? 1;
  const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * onlineCpus * 100 : 0;
  const ramMb = (raw.memory_stats.usage ?? 0) / 1024 / 1024;
  const ramLimitMb = (raw.memory_stats.limit ?? 0) / 1024 / 1024;
  const networkTotals = Object.values(raw.networks ?? {}).reduce(
    (acc, network) => ({ rx: acc.rx + network.rx_bytes, tx: acc.tx + network.tx_bytes }),
    { rx: 0, tx: 0 }
  );
  return {
    cpuPercent,
    ramMb,
    ramLimitMb,
    netRxKb: networkTotals.rx / 1024,
    netTxKb: networkTotals.tx / 1024
  };
}
