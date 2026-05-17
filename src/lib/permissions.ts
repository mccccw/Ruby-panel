import { Role, ServerPermission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthenticatedUser } from "@/types";

const elevatedRoles: Role[] = [Role.SUPERADMIN, Role.ADMIN];

export function canAccessAdmin(user: AuthenticatedUser): boolean {
  return elevatedRoles.includes(user.role);
}

export async function hasServerPermission(
  user: AuthenticatedUser,
  serverId: string,
  permission: ServerPermission
): Promise<boolean> {
  if (elevatedRoles.includes(user.role)) {
    return true;
  }
  const link = await prisma.serverUser.findUnique({
    where: { serverId_userId: { serverId, userId: user.id } },
    select: { permissions: true }
  });
  if (!link) {
    return false;
  }
  return link.permissions.includes(ServerPermission.MANAGE) || link.permissions.includes(permission);
}

export async function requireServerPermission(
  user: AuthenticatedUser,
  serverId: string,
  permission: ServerPermission
): Promise<void> {
  const allowed = await hasServerPermission(user, serverId, permission);
  if (!allowed) {
    throw new Error(`Missing server permission: ${permission}`);
  }
}
