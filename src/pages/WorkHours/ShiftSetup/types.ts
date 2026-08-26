export interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface ShiftItem {
  shiftId: number;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  gracePeriodMinutes: number;
  totalWorkHours: number;
  isOvernight: boolean;
  description?: string;
  status: number; // 1: Active, 0: Deleted
  createdAt?: string;
}

export interface ShiftPageRequest {
  pageNumber: number;
  pageSize: number;
  searchKeyword?: string;
  status?: number;
}