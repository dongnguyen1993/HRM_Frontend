export interface LeaveTypeItem {
  leaveTypeId: number;
  leaveTypeCode: string;
  leaveTypeName: string;
  daysPerYear: number;
  isPaid: boolean;
  useFlag: boolean;
  comment?: string;
  createdAt?: string;
  createdBy?: string;
}
