import { request } from '@umijs/max';

export async function getWorkRequests(params: Record<string, any>) {
  return request<any>('/api/timesheets/requests', { method: 'GET', params });
}

export async function approveWorkRequest(id: number, status: string) {
  return request<any>(`/api/timesheets/requests/${id}/approve`, {
    method: 'POST',
    data: status,
  });
}
