import { request } from '@umijs/max';

export async function getAdminDashboardStats() {
  return request<any>('/api/dashboard/admin-stats', {
    method: 'GET',
  });
}
