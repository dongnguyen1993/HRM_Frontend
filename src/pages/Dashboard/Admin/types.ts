export interface MetricCardItem {
  totalUsers: number;
  usersGrowth: string;
  newUsersThisMonth: number;
  attendanceRate: number;
  pendingRequests: number;
}

export interface TurnoverTrendItem {
  month: string;
  newHires: number;
  resignations: number;
}

export interface PlantDistItem {
  plant: string;
  count: number;
  percent: number;
}

export interface ActivityItem {
  time: string;
  load: number;
}

export interface RecentAuditLogItem {
  logId: number;
  operatorCode: string;
  action: string;
  tableName: string;
  createdAt: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  usersGrowth: string;
  newUsersThisMonth: number;
  attendanceRate: number;
  pendingRequests: number;
  turnoverTrend: TurnoverTrendItem[];
  plantDistribution: PlantDistItem[];
  activityData: ActivityItem[];
  recentAuditLogs: RecentAuditLogItem[];
}