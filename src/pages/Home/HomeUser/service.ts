import { request } from '@umijs/max';
import type { BaseResponse, UserDashboardOverview } from './types';

// ĐÃ ĐỔI TỪ DASHBOARD SANG HOME
const BASE_URL = '/api/home/personal';

export async function getUserDashboardOverview() {
  return request<BaseResponse<UserDashboardOverview>>(`${BASE_URL}/overview`, {
    method: 'GET',
  });
}

export async function selfPunch(punchType: 'IN' | 'OUT') {
  return request<BaseResponse<boolean>>(`${BASE_URL}/punch`, {
    method: 'POST',
    data: { punchType },
  });
}
