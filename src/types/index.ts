import type { Role, ServerPermission, ServerStatus, ServerType, SiteStatus, SiteType } from "@prisma/client";

export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: Role;
  apiKeyId?: string;
};

export type ServerSummary = {
  id: string;
  name: string;
  description: string | null;
  type: ServerType;
  version: string;
  status: ServerStatus;
  port: number;
  ramMb: number;
  cpuPercent: number;
  diskGb: number;
  updatedAt: string;
};

export type WebsiteSummary = {
  id: string;
  name: string;
  type: SiteType;
  status: SiteStatus;
  port: number;
  updatedAt: string;
};

export type PermissionCheck = {
  userId: string;
  serverId: string;
  permission: ServerPermission;
};
