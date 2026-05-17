"use client";

import { useState } from "react";
import { File, Folder, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useFileManager } from "@/hooks/useFileManager";
import { FileEditor } from "@/components/server/FileEditor";

export function FileManager({ serverId, initialPath = "." }: { serverId: string; initialPath?: string }) {
  const [directory, setDirectory] = useState(initialPath);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editorValue, setEditorValue] = useState("");
  const manager = useFileManager(serverId, directory);

  async function openFile(path: string) {
    const response = await fetch(`/api/servers/${serverId}/files?path=${encodeURIComponent(path)}&mode=read`);
    const payload = (await response.json()) as { ok: boolean; data?: { content: string }; error?: string };
    if (!payload.ok || !payload.data) {
      toast.error(payload.error ?? "Unable to read file");
      return;
    }
    setEditingPath(path);
    setEditorValue(payload.data.content);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="glass-card p-4">
        <div className="flex items-center gap-2">
          <Input value={directory} onChange={(event) => setDirectory(event.target.value)} />
          <Button variant="secondary" onClick={() => manager.files.refetch()}>
            Go
          </Button>
        </div>
        <div className="mt-4 space-y-1">
          {manager.files.isLoading ? <LoadingSpinner label="Reading directory" /> : null}
          {manager.files.isError ? <p className="text-sm text-ruby-200">{manager.files.error.message}</p> : null}
          {manager.files.data?.length === 0 ? <p className="text-sm text-white/45">This directory is empty.</p> : null}
          {manager.files.data?.map((entry) => (
            <div key={entry.path} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-white/[0.05]">
              {entry.type === "directory" ? <Folder className="h-4 w-4 text-ruby-300" /> : <File className="h-4 w-4 text-white/45" />}
              <button className="min-w-0 flex-1 truncate text-left" onClick={() => (entry.type === "directory" ? setDirectory(entry.path) : void openFile(entry.path))}>
                {entry.name}
              </button>
              <button
                className="rounded-md p-1 text-white/35 hover:bg-ruby-600/20 hover:text-ruby-100"
                aria-label={`Delete ${entry.name}`}
                onClick={() => manager.remove.mutate(entry.path)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </aside>
      <main className="min-w-0">
        {editingPath ? (
          <FileEditor
            path={editingPath}
            value={editorValue}
            onChange={setEditorValue}
            saving={manager.writeFile.isPending}
            onSave={() =>
              manager.writeFile.mutate(
                { path: editingPath, content: editorValue },
                { onSuccess: () => toast.success("File saved") }
              )
            }
          />
        ) : (
          <div className="glass-card grid min-h-[560px] place-items-center p-6 text-center">
            <div>
              <p className="text-xl font-semibold">Select a file to edit</p>
              <p className="mt-2 text-sm text-white/45">Ruby keeps reads and writes inside this server data directory.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
