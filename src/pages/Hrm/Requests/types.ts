export interface WorkRequestItem {
  requestId: number;
  userId: number;
  userCode: string;
  fullName: string;
  requestType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
}
