import { request } from '@umijs/max';

export async function getShifts(params: Record<string, any>) {
  return request<any>('/api/shifts', { method: 'GET', params });
}

export async function createShift(data: any) {
  return request<any>('/api/shifts', { method: 'POST', data });
}

export async function updateShift(id: number, data: any) {
  return request<any>(`/api/shifts/${id}`, { method: 'PUT', data });
}

export async function bulkDeleteShifts(ids: number[], status: number = 0) {
  return request<any>('/api/shifts/bulk-delete', {
    method: 'POST',
    data: { ids, status },
  });
}