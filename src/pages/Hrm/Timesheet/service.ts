import { request } from '@umijs/max';
import type { UpdateTimesheetPayload } from './types';

// Các API cũ giữ nguyên 100%
export async function getTimesheets(params: Record<string, any>) {
  return request<any>('/api/timesheets', { method: 'GET', params });
}

export async function getWorkRequests(params: Record<string, any>) {
  return request<any>('/api/timesheets/requests', { method: 'GET', params });
}

export async function approveWorkRequest(id: number, status: string) {
  return request<any>(`/api/timesheets/requests/${id}/approve`, {
    method: 'POST',
    data: status,
  });
}

export async function calculateTimesheet(fromDate: string, toDate: string) {
  return request<any>('/api/timesheets/calculate', {
    method: 'POST',
    data: { fromDate, toDate },
  });
}

export async function importAttendanceCsv(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<any>('/api/timesheets/import-csv', {
    method: 'POST',
    data: formData,
  });
}

export async function syncBiostar(fromDate: string, toDate: string) {
  return request<any>('/api/timesheets/sync-biostar', {
    method: 'POST',
    data: { fromDate, toDate },
  });
}

export async function getRawDeviceLogs(params: Record<string, any>) {
  return request<any>('/api/timesheets/raw-logs', { method: 'GET', params });
}

export async function getRawUserGroups() {
  return request<any>('/api/timesheets/raw-logs/groups', { method: 'GET' });
}

// API BỔ SUNG: Chỉnh sửa thủ công & Gỡ cờ đỏ cho HR
export async function updateTimesheetRow(data: UpdateTimesheetPayload) {
  return request<any>('/api/timesheets/manual-update', {
    method: 'PUT',
    data,
  });
}

// API BỔ SUNG: Phê duyệt nhanh nhiều dòng đã chọn
export async function batchApproveTimesheets(logIds: number[]) {
  return request<any>('/api/timesheets/batch-approve', {
    method: 'POST',
    data: logIds,
  });
}
