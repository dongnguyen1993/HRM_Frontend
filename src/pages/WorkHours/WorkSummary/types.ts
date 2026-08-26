export interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface WorkSummaryItem {
  logId: number;
  userId?: number;
  userCode: string;
  fullName: string;
  userGroup: string;
  workDate: string;
  shiftId?: number;
  shiftName?: string;
  shiftCode?: string;
  checkInTime?: string;
  checkInTimeStr?: string;
  checkOutTime?: string;
  checkOutTimeStr?: string;
  lateMinutes: number;
  earlyMinutes: number;
  workUnits: number;
  otHours: number;
  status: string;
  comment?: string;
  isWarning: boolean;
  warningReason?: string;
  createdAt: string;
}

export interface WorkSummaryStatistics {
  totalRecords: number;
  totalWorkUnits: number;
  totalOtHours: number;
  totalWarnings: number;
}
