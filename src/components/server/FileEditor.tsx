"use client";

import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

export function FileEditor({
  path,
  value,
  onChange,
  onSave,
  saving
}: {
  path: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const extension = path.split(".").pop()?.toLowerCase();
  const language = extension === "yml" || extension === "yaml" ? "yaml" : extension === "properties" ? "ini" : extension === "ts" ? "typescript" : extension === "js" ? "javascript" : extension ?? "plaintext";
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="font-mono text-sm text-white/70">{path}</p>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      <Editor
        height="520px"
        theme="vs-dark"
        language={language}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        options={{
          minimap: { enabled: true },
          wordWrap: "on",
          fontFamily: "JetBrains Mono, var(--font-geist-mono), monospace",
          fontSize: 13,
          automaticLayout: true
        }}
      />
    </div>
  );
}
