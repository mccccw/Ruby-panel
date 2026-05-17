"use client";

import { Role } from "@prisma/client";
import { Check, Trash2, UserPlus, ShieldCheck, X, Server } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type User = {
  id: string;
  email: string;
  username: string;
  role: Role;
  isActive: boolean;
  totpEnabled: boolean;
  lastLoginAt: string | null;
};

type ServerRequest = {
  id: string;
  name: string;
  type: string;
  version: string;
  ramMb: number;
  cpuPercent: number;
  diskGb: number;
  status: string;
  adminNote: string | null;
  createdAt: string;
  user: { username: string; email: string };
};

type Props = {
  initialUsers: User[];
  initialServerRequests: ServerRequest[];
  currentUserId: string;
  currentUserRole: Role;
};

const ROLE_ORDER: Role[] = [Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR, Role.USER];

function roleBadgeClass(role: Role) {
  switch (role) {
    case Role.SUPERADMIN: return "bg-ruby-600/30 text-ruby-300 border border-ruby-600/40";
    case Role.ADMIN: return "bg-amber-600/20 text-amber-300 border border-amber-600/30";
    case Role.MODERATOR: return "bg-blue-600/20 text-blue-300 border border-blue-600/30";
    default: return "bg-white/10 text-white/60 border border-white/10";
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "APPROVED": return "bg-green-600/20 text-green-300";
    case "REJECTED": return "bg-red-600/20 text-red-300";
    default: return "bg-amber-600/20 text-amber-300";
  }
}

export function UserManagement({ initialUsers, initialServerRequests, currentUserId, currentUserRole }: Props) {
  const [tab, setTab] = useState<"users" | "requests">("users");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [requests, setRequests] = useState<ServerRequest[]>(initialServerRequests);
  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<Role>(Role.USER);
  const [creating, setCreating] = useState(false);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const canAssignRole = (role: Role) => {
    if (currentUserRole === Role.SUPERADMIN) return true;
    if (currentUserRole === Role.ADMIN) return role !== Role.SUPERADMIN;
    if (currentUserRole === Role.MODERATOR) return role === Role.USER || role === Role.MODERATOR;
    return false;
  };

  async function updateRole(userId: string, role: Role) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role })
    });
    const payload = await res.json() as { ok: boolean; error?: string };
    if (!payload.ok) { toast.error(payload.error ?? "Failed to update role"); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    toast.success("Role updated");
  }

  async function toggleActive(userId: string, isActive: boolean) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive })
    });
    const payload = await res.json() as { ok: boolean; error?: string };
    if (!payload.ok) { toast.error(payload.error ?? "Failed to update status"); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive } : u));
    toast.success(isActive ? "User activated" : "User suspended");
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const payload = await res.json() as { ok: boolean; error?: string };
    if (!payload.ok) { toast.error(payload.error ?? "Failed to delete user"); return; }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success("User deleted");
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (!createEmail || !createUsername || !createPassword) { toast.error("All fields are required"); return; }
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: createEmail, username: createUsername, password: createPassword, role: createRole })
    });
    const payload = await res.json() as { ok: boolean; data?: { id: string }; error?: string };
    setCreating(false);
    if (!payload.ok) { toast.error(payload.error ?? "Failed to create user"); return; }
    toast.success("User created");
    setShowCreate(false);
    setCreateEmail(""); setCreateUsername(""); setCreatePassword(""); setCreateRole(Role.USER);
    const refreshRes = await fetch("/api/admin/users");
    const refreshPayload = await refreshRes.json() as { ok: boolean; data?: User[] };
    if (refreshPayload.ok && refreshPayload.data) setUsers(refreshPayload.data);
  }

  async function handleRequest(requestId: string, status: "APPROVED" | "REJECTED") {
    const note = adminNotes[requestId] ?? "";
    const res = await fetch(`/api/admin/server-requests?id=${requestId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, adminNote: note || undefined })
    });
    const payload = await res.json() as { ok: boolean; error?: string };
    if (!payload.ok) { toast.error(payload.error ?? "Failed to update request"); return; }
    setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status, adminNote: note || null } : r));
    toast.success(status === "APPROVED" ? "Request approved" : "Request rejected");
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 w-fit">
        <button
          onClick={() => setTab("users")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "users" ? "bg-ruby-600 text-white" : "text-white/55 hover:text-white"}`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "requests" ? "bg-ruby-600 text-white" : "text-white/55 hover:text-white"}`}
        >
          <Server className="h-3.5 w-3.5" />
          Server Requests
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black leading-none">{pendingCount}</span>
          )}
        </button>
      </div>

      {tab === "users" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/45">{users.length} user{users.length !== 1 ? "s" : ""}</p>
            {(currentUserRole === Role.SUPERADMIN || currentUserRole === Role.ADMIN) && (
              <Button onClick={() => setShowCreate(!showCreate)} variant="secondary" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Create user
              </Button>
            )}
          </div>

          {showCreate && (
            <form onSubmit={createUser} className="glass-card grid gap-4 p-5 border border-ruby-600/20">
              <p className="font-semibold text-white">New user</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Email<Input className="mt-1" type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} required /></Label></div>
                <div><Label>Username<Input className="mt-1" value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} required /></Label></div>
                <div><Label>Password (min 12 chars)<Input className="mt-1" type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} required minLength={12} /></Label></div>
                <div>
                  <Label>Role
                    <Select value={createRole} onValueChange={(v) => setCreateRole(v as Role)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLE_ORDER.filter(canAssignRole).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          )}

          <div className="glass-card overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-white/45">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">2FA</th>
                  <th className="p-4">Last login</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => {
                  const isProtected = user.email === "cattech3d@gmail.com";
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-white">{user.username}</p>
                        <p className="text-white/45">{user.email}</p>
                        {isProtected && <span className="inline-flex items-center gap-1 mt-1 text-xs text-ruby-400"><ShieldCheck className="h-3 w-3" />Protected</span>}
                      </td>
                      <td className="p-4">
                        {canAssignRole(user.role) && !isProtected ? (
                          <Select value={user.role} onValueChange={(v) => updateRole(user.id, v as Role)}>
                            <SelectTrigger className={`h-7 w-36 text-xs ${roleBadgeClass(user.role)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_ORDER.filter(canAssignRole).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}>{user.role}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${user.totpEnabled ? "bg-green-600/20 text-green-300" : "bg-white/10 text-white/40"}`}>
                          {user.totpEnabled ? "On" : "Off"}
                        </span>
                      </td>
                      <td className="p-4 text-white/45 text-xs">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => !isProtected && toggleActive(user.id, !user.isActive)}
                          disabled={isProtected}
                          className={`inline-block rounded-full px-2 py-0.5 text-xs transition-opacity ${isProtected ? "opacity-50 cursor-default" : "cursor-pointer hover:opacity-80"} ${user.isActive ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"}`}
                          title={isProtected ? "Protected account" : user.isActive ? "Click to suspend" : "Click to activate"}
                        >
                          {user.isActive ? "Active" : "Suspended"}
                        </button>
                      </td>
                      <td className="p-4">
                        {!isProtected && !isSelf && (currentUserRole === Role.SUPERADMIN || currentUserRole === Role.ADMIN) && (
                          <button
                            onClick={() => deleteUser(user.id, user.email)}
                            className="rounded-lg p-1.5 text-white/30 hover:bg-red-600/20 hover:text-red-400 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "requests" && (
        <div className="space-y-3">
          {requests.length === 0 && (
            <div className="glass-card p-8 text-center text-white/40 text-sm">No server requests yet.</div>
          )}
          {requests.map((req) => (
            <div key={req.id} className="glass-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{req.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(req.status)}`}>{req.status}</span>
                  </div>
                  <p className="text-xs text-white/45 mt-0.5">
                    {req.type} {req.version} · {req.ramMb} MB RAM · {req.cpuPercent}% CPU · {req.diskGb} GB
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Requested by <span className="text-white/60">{req.user.username}</span> ({req.user.email}) · {new Date(req.createdAt).toLocaleString()}
                  </p>
                  {req.adminNote && (
                    <p className="mt-1 text-xs text-white/50 italic">Note: {req.adminNote}</p>
                  )}
                </div>
                {req.status === "PENDING" && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <Input
                      value={adminNotes[req.id] ?? ""}
                      onChange={(e) => setAdminNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                      placeholder="Admin note (optional)"
                      className="h-7 text-xs w-48"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleRequest(req.id, "APPROVED")}
                        className="flex items-center gap-1 rounded-lg bg-green-600/20 px-3 py-1.5 text-xs text-green-300 hover:bg-green-600/30 transition-colors"
                      >
                        <Check className="h-3 w-3" />Approve
                      </button>
                      <button
                        onClick={() => handleRequest(req.id, "REJECTED")}
                        className="flex items-center gap-1 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-600/30 transition-colors"
                      >
                        <X className="h-3 w-3" />Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
