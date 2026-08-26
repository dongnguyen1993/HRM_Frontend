import { request } from '@umijs/max';
import type { BaseResponse, ShiftItem } from './types';

const BASE_URL = '/api/shift-setup';

export async function getPagedShifts(params: Record<string, any>) {
  return request<any>(BASE_URL, {
    method: 'GET',
    params,
  });
}

export async function createShift(data: Partial<ShiftItem>) {
  return request<BaseResponse<boolean>>(BASE_URL, {
    method: 'POST',
    data,
  });
}

export async function updateShift(data: Partial<ShiftItem>) {
  return request<BaseResponse<boolean>>(BASE_URL, {
    method: 'PUT',
    data,
  });
}

export async function deleteShift(id: number) {
  return request<BaseResponse<boolean>>(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkUpdateShiftsStatus(
  shiftIds: number[],
  status: number = 0,
) {
  return request<BaseResponse<boolean>>(`${BASE_URL}/bulk-status`, {
    method: 'POST',
    data: { ids: shiftIds, status },
  });
}

export async function getActiveShifts() {
  return request<BaseResponse<ShiftItem[]>>(`${BASE_URL}/active`, {
    method: 'GET',
  });
}
