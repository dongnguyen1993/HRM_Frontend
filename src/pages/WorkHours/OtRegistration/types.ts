export type { BaseResponse } from '@/types/api';

export interface OtRegistrationItem {
  registrationId: number;
  userCode: string;
  fullName: string;
  userGroup: string;
  workDate: string;
  shiftId: number;
  shiftName?: string;
  plannedStartTime: string;
  plannedEndTime: string;
  plannedHours: number;
  actualHours?: number;
  otType: 'WEEKDAY_150' | 'SUNDAY_200' | 'HOLIDAY_300';
  reason?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  approverComment?: string;
  status: number;
  createdAt: string;
}

export interface OtStatistics {
  totalRegistrations: number;
  totalPlannedHours: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}
