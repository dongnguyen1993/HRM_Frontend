export type { BaseResponse } from '@/types/api';

export interface UserDashboardOverview {
  profile: {
    userId: number;
    userCode: string;
    fullName: string;
    userGroup: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  todayPunch: {
    todayDate: string;
    checkInTime?: string;
    checkInDevice?: string;
    checkOutTime?: string;
    checkOutDevice?: string;
  };
  kpiStats: {
    totalWorkUnits: number;
    totalOtHours: number;
    totalWorkingDays: number;
    totalWarnings: number;
    totalAnnualLeaveQuota: number;
    remainingAnnualLeave: number;
  };
  weeklyHours: {
    workDate: string;
    dayOfWeekName: string;
    standardHours: number;
    otHours: number;
  }[];
  monthlyCalendar: {
    workDate: string;
    shiftId: number;
    shiftName?: string;
    checkInTime?: string;
    checkOutTime?: string;
    workUnits: number;
    otHours: number;
    isWarning: boolean;
    warningReason?: string;
    status: string;
  }[];
  recentRequests: {
    registrationId: number;
    requestType: string;
    workDate: string;
    createdAt: string;
    plannedHours: number;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason?: string;
  }[];
  announcements: {
    id: number;
    title: string;
    createdAt: string;
    tag: string;
  }[];
}