"use client";

import { Role } from "@prisma/client";
import { Trash2, UserPlus, ShieldCheck } from "lucide-react";
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

type Props = {
  initialUsers: User[];
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

export function UserManagement({ initialUsers, currentUserId, currentUserRole }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<Role>(Role.USER);
  const [creating, setCreating] = useState(false);

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
    if (!createEmail || !createUsername || !createPassword) {
      toast.error("All fields are required");
      return;
    }
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

  return (
    <div className="space-y-4">
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
                      className={`inline-block rounded-full px-2 py-0.5 text-xs cursor-pointer transition-opacity ${isProtected ? "opacity-50 cursor-default" : "hover:opacity-80"} ${user.isActive ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"}`}
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
    </div>
  );
}
