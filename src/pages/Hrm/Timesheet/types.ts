export interface TimesheetItem {
  logId: number;
  userId?: number;
  userCode: string;
  fullName: string;
  userGroup?: string;
  workDate: string;
  shiftName: string;
  checkInTime?: string;
  checkOutTime?: string;
  lateMinutes?: number;
  earlyMinutes?: number;
  workUnits: number;
  otHours: number;
  status: string;
  comment?: string;
  isWarning: boolean; // <--- BỔ SUNG CỜ ĐỎ
  warningReason?: string; // <--- LÝ DO GẮN CỜ ĐỎ
}

export interface RawDeviceLogItem {
  rawLogId: number;
  logTimestamp: string;
  deviceId: string;
  deviceName: string;
  userGroup: string;
  userCode: string;
  userName?: string;
  rawUserString: string;
  eventDescription: string;
  createdAt: string;
}

export interface UpdateTimesheetPayload {
  logId: number;
  checkInTime?: string;
  checkOutTime?: string;
  shiftName: string;
  workUnits: number;
  otHours: number;
  note?: string;
}
