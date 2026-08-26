import { request } from '@umijs/max';
import type { AdminDashboardOverview, BaseResponse } from './types';

const BASE_URL = '/api/home/admin';

export async function getAdminDashboardOverview() {
  return request<BaseResponse<AdminDashboardOverview>>(`${BASE_URL}/overview`, {
    method: 'GET',
  });
}
