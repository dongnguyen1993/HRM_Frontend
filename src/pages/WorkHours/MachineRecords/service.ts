import { request } from '@umijs/max';
import type { BaseResponse, MachineRecordItem } from './types';

const BASE_URL = '/api/machine-records';

export async function getPagedMachineRecords(params: Record<string, any>) {
  return request<any>(BASE_URL, {
    method: 'GET',
    params,
  });
}

export async function createMachineRecord(data: Partial<MachineRecordItem>) {
  return request<BaseResponse<boolean>>(BASE_URL, {
    method: 'POST',
    data,
  });
}

export async function updateMachineRecord(data: Partial<MachineRecordItem>) {
  return request<BaseResponse<boolean>>(BASE_URL, {
    method: 'PUT',
    data,
  });
}

export async function bulkUpdateMachineRecordsStatus(
  recordIds: number[],
  status: number = 0,
) {
  return request<BaseResponse<boolean>>(`${BASE_URL}/bulk-status`, {
    method: 'POST',
    data: { ids: recordIds, status },
  });
}

// NẠP NHIỀU FILE CÙNG LÚC + THAM SỐ FORCE IMPORT
export async function importMachineRecordsCsv(
  files: File[],
  forceImport: boolean = false,
) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  return request<BaseResponse<any>>(`${BASE_URL}/import-csv`, {
    method: 'POST',
    params: { forceImport },
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function getDistinctUserGroups() {
  return request<BaseResponse<string[]>>(`${BASE_URL}/groups`, {
    method: 'GET',
  });
}

export async function exportMachineRecordsExcel(params: Record<string, any>) {
  return request(`${BASE_URL}/export-excel`, {
    method: 'GET',
    params,
    responseType: 'blob',
  });
}

export async function downloadMachineRecordsTemplate() {
  return request(`${BASE_URL}/template`, {
    method: 'GET',
    responseType: 'blob',
  });
}

export async function syncBioStar(params: {
  fromTime?: string;
  toTime?: string;
}) {
  return request<BaseResponse<any>>(`${BASE_URL}/sync-biostar`, {
    method: 'POST',
    data: params,
  });
}
