export interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface AdminDashboardOverview {
  kpiStats: {
    totalEmployees: number;
    newHiresThisMonth: number;
    attendanceRateToday: number;
    pendingRequests: number;
  };
  turnoverTrend: {
    monthLabel: string;
    newHires: number;
    resignations: number;
  }[];
  distribution: {
    groupName: string;
    employeeCount: number;
  }[];
  apiLoad: {
    logDate: string;
    totalRequests: number;
  }[];
  recentAuditLogs: {
    logId: number;
    operatorName: string;
    action: string;
    endpointPath: string;
    createdAt: string;
  }[];
}
