import { request } from '@umijs/max';
import type { BaseResponse, DeviceSetupItem } from './types';

const BASE_URL = '/api/device-setup';

export async function getPagedDevices(params: Record<string, any>) {
  return request<any>(BASE_URL, {
    method: 'GET',
    params,
  });
}

export async function createDevice(data: Partial<DeviceSetupItem>) {
  return request<BaseResponse<boolean>>(BASE_URL, {
    method: 'POST',
    data,
  });
}

export async function updateDevice(data: Partial<DeviceSetupItem>) {
  return request<BaseResponse<boolean>>(BASE_URL, {
    method: 'PUT',
    data,
  });
}

export async function bulkUpdateDevicesStatus(
  deviceIds: number[],
  status: number = 0,
) {
  return request<BaseResponse<boolean>>(`${BASE_URL}/bulk-status`, {
    method: 'POST',
    data: { ids: deviceIds, status },
  });
}

export async function getDistinctDeviceGroups() {
  return request<BaseResponse<string[]>>(`${BASE_URL}/groups`, {
    method: 'GET',
  });
}
