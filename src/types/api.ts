export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type DashboardStats = {
  totalServers: number;
  runningServers: number;
  totalRamUsedMb: number;
  totalPlayersOnline: number;
  activity: Array<{
    id: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    createdAt: string;
    user: { username: string; email: string } | null;
  }>;
  resourceSeries: Array<{
    timestamp: string;
    cpuPercent: number;
    ramMb: number;
  }>;
};
