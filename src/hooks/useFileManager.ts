"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type FileEntry = {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  modifiedAt: string;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json()) as { ok: boolean; data?: T; error?: string };
  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error ?? "File operation failed");
  }
  return payload.data;
}

export function useFileManager(serverId: string, directory: string) {
  const queryClient = useQueryClient();
  const queryKey = ["files", serverId, directory] as const;
  const files = useQuery({
    queryKey,
    queryFn: () => requestJson<FileEntry[]>(`/api/servers/${serverId}/files?path=${encodeURIComponent(directory)}`)
  });
  const writeFile = useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      requestJson<{ path: string }>(`/api/servers/${serverId}/files`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "write", path, content })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
  const remove = useMutation({
    mutationFn: (path: string) =>
      requestJson<{ path: string }>(`/api/servers/${serverId}/files?path=${encodeURIComponent(path)}`, {
        method: "DELETE"
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
  return { files, writeFile, remove };
}
