import { request } from '@umijs/max';
import type { BaseResponse, OtStatistics } from './types';

const BASE_URL = '/api/ot-registration';

export async function getPagedOtRegistrations(params: Record<string, any>) {
  return request<any>(BASE_URL, {
    method: 'GET',
    params,
  });
}

export async function createOtRegistration(data: any) {
  return request<BaseResponse<boolean>>(BASE_URL, {
    method: 'POST',
    data,
  });
}

export async function updateOtRegistration(data: any) {
  return request<BaseResponse<boolean>>(BASE_URL, {
    method: 'PUT',
    data,
  });
}

export async function approveOtBatch(
  registrationIds: number[],
  comment?: string,
) {
  return request<BaseResponse<boolean>>(`${BASE_URL}/approve`, {
    method: 'POST',
    data: { registrationIds, comment },
  });
}

export async function rejectOtBatch(
  registrationIds: number[],
  comment?: string,
) {
  return request<BaseResponse<boolean>>(`${BASE_URL}/reject`, {
    method: 'POST',
    data: { registrationIds, comment },
  });
}

export async function bulkUpdateOtStatus(ids: number[], status: number = 0) {
  return request<BaseResponse<boolean>>(`${BASE_URL}/bulk-status`, {
    method: 'POST',
    data: { ids, status },
  });
}

export async function getOtStatistics(params: Record<string, any>) {
  return request<BaseResponse<OtStatistics>>(`${BASE_URL}/statistics`, {
    method: 'GET',
    params,
  });
}

export async function getDistinctUserGroups() {
  return request<BaseResponse<string[]>>('/api/machine-records/groups', {
    method: 'GET',
  });
}
