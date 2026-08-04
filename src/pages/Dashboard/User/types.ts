export interface WeeklyWorkHourItem {
  day: string;
  hours: number;
  status: 'Punctual' | 'Late';
}

export interface MyRequestItem {
  requestId: number;
  type: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  statusText: string;
}

export interface CompanyFeedItem {
  feedId: number;
  title: string;
  date: string;
  tag: string;
}

export interface UserDashboardData {
  userCode: string;
  fullName: string;
  plant: string;
  remainingLeaveDays: number;
  totalOtHoursThisMonth: number;
  accumulatedWorkDays: number;
  checkInTime?: string;
  checkOutTime?: string;
  weeklyWorkHours: WeeklyWorkHourItem[];
  myRequests: MyRequestItem[];
  companyFeeds: CompanyFeedItem[];
}
