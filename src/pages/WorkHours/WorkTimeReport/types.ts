export interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface WorkTimeReportItem {
  userCode: string;
  fullName: string;
  userGroup: string;
  totalWorkingDays: number;
  totalWorkUnits: number;
  totalStandardHours: number;
  totalOtHours: number;
  totalCombinedHours: number;
  totalDayShifts: number;
  totalNightShifts: number;
  warningCount: number;
}

export interface WorkTimeReportSummaryStats {
  totalEmployees: number;
  totalWorkUnits: number;
  totalStandardHours: number;
  totalOtHours: number;
  totalCombinedHours: number;
  totalWarnings: number;
}

export interface EmployeeDailyDetail {
  logId: number;
  workDate: string;
  shiftName?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workUnits: number;
  otHours: number;
  status: string;
  isWarning: boolean;
  warningReason?: string;
  comment?: string;
}

export interface MonthlyMatrixRow {
  userCode: string;
  fullName: string;
  userGroup: string;
  dailyCells: Record<
    string,
    { text: string; type: string; workUnits: number; otHours: number }
  >;
  dayWorkHours: number;
  nightWorkHours: number;
  totalActualHours: number;
  standardMonthHours: number;
  totalOtHours: number;
  totalPaidLeaveHours: number;
  totalUnpaidLeaveHours: number;
}
