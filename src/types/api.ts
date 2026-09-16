/**
 * Chuẩn hóa các Interface RESTful API dùng chung cho toàn bộ Frontend HRM
 */

// Định dạng phản hồi chuẩn từ Backend BaseResponse<T>
export interface BaseResponse<T = any> {
  success?: boolean;
  isSuccess?: boolean;
  message?: string;
  data: T;
  errors?: string[];
  timestamp?: string;
}

// Tham số phân trang và lọc chuẩn
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Cấu trúc dữ liệu phân trang
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

// Bộ cờ 6 quyền chức năng (Dynamic RBAC)
export interface ActionPermission {
  canSearch: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canSave: boolean;
  canPrint: boolean;
}

// Định dạng thông báo thời gian thực từ SignalR NotificationHub
export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  link?: string;
  isRead?: boolean;
}
