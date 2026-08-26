export interface ShiftItem {
  shiftId: number;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  gracePeriodMinutes: number;
  useFlag: boolean;
  comment?: string;
  createdAt?: string;
  createdBy?: string;
}
