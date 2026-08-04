import { request } from '@umijs/max';

export async function getUserDashboardStats() {
  return request<any>('/api/dashboard/user-stats', { method: 'GET' });
}

export async function performCheckIn(actionType: 'check-in' | 'check-out') {
  return request<any>('/api/dashboard/check-in', {
    method: 'POST',
    data: { actionType },
  });
}
