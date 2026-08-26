import { request } from '@umijs/max';

export async function getLeaveTypes(params: Record<string, any>) {
  return request<any>('/api/leave-types', { method: 'GET', params });
}

export async function createLeaveType(data: any) {
  return request<any>('/api/leave-types', { method: 'POST', data });
}

export async function updateLeaveType(id: number, data: any) {
  return request<any>(`/api/leave-types/${id}`, { method: 'PUT', data });
}

export async function bulkDeleteLeaveTypes(ids: number[], status: number = 0) {
  return request<any>('/api/leave-types/bulk-delete', {
    method: 'POST',
    data: { ids, status },
  });
}
