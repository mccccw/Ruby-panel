"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Task = { id: string; name: string; type: string; schedule: string; isEnabled: boolean; lastRun: string | null; nextRun: string | null };

export function TaskScheduler({ serverId }: { serverId: string }) {
  const [name, setName] = useState("Daily restart");
  const [type, setType] = useState("RESTART");
  const [schedule, setSchedule] = useState("0 4 * * *");
  const queryClient = useQueryClient();
  const tasks = useQuery({
    queryKey: ["tasks", serverId],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/tasks`);
      const payload = (await response.json()) as { ok: boolean; data?: Task[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to load tasks");
      }
      return payload.data;
    }
  });
  const create = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/tasks`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, type, schedule, payload: {} })
      });
      if (!response.ok) {
        throw new Error("Unable to create task");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", serverId] })
  });
  return (
    <div className="space-y-4">
      <div className="glass-card grid gap-3 p-4 md:grid-cols-[1fr_180px_180px_auto]">
        <Input value={name} onChange={(event) => setName(event.target.value)} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["RESTART", "BACKUP", "COMMAND", "ANNOUNCE", "START", "STOP"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input value={schedule} onChange={(event) => setSchedule(event.target.value)} />
        <Button onClick={() => create.mutate()} disabled={create.isPending}>Add task</Button>
      </div>
      <div className="glass-card divide-y divide-white/10 p-0">
        {tasks.data?.length === 0 ? <p className="p-5 text-sm text-white/45">No scheduled tasks yet.</p> : null}
        {tasks.data?.map((task) => (
          <div key={task.id} className="grid gap-2 p-5 text-sm md:grid-cols-5">
            <span className="font-medium">{task.name}</span>
            <span className="text-white/55">{task.type}</span>
            <span className="font-mono text-ruby-200">{task.schedule}</span>
            <span className="text-white/45">{task.lastRun ? new Date(task.lastRun).toLocaleString() : "Never run"}</span>
            <span className={task.isEnabled ? "text-emerald-300" : "text-white/35"}>{task.isEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
