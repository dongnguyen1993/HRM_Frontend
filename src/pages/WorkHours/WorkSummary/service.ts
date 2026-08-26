import { request } from '@umijs/max';
import type { BaseResponse } from './types';

const BASE_URL = '/api/work-summary';

export async function getPagedWorkSummary(params: Record<string, any>) {
  return request<any>(BASE_URL, {
    method: 'GET',
    params,
  });
}

export async function calculateTimesheet(data: {
  fromDate: string;
  toDate: string;
  userCodeFilter?: string;
}) {
  return request<BaseResponse<boolean>>(`${BASE_URL}/calculate`, {
    method: 'POST',
    data,
  });
}

export async function getDistinctUserGroups() {
  return request<BaseResponse<string[]>>('/api/machine-records/groups', {
    method: 'GET',
  });
}
