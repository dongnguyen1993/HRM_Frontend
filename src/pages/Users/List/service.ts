import type { BaseResponse, UserItem } from '@/pages/Users/List/types';
import { request } from '@umijs/max';

export async function getPagedUsers(params: Record<string, any>) {
  return request<BaseResponse<UserItem[]>>('/api/users', {
    method: 'GET',
    params,
  });
}

export async function createUser(data: Partial<UserItem>) {
  return request<BaseResponse<string>>('/api/users', {
    method: 'POST',
    data,
  });
}

export async function updateUser(id: string, data: Partial<UserItem>) {
  return request<BaseResponse<boolean>>(`/api/users/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function toggleUserStatus(id: string, status: number) {
  return request<BaseResponse<boolean>>(`/api/users/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

export async function bulkDeleteUsers(secureIds: string[], status: number = 0) {
  return request<BaseResponse<boolean>>('/api/users/bulk-delete', {
    method: 'POST',
    data: { secureIds, status },
  });
}

export async function uploadAvatar(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<BaseResponse<string>>(`/api/users/${id}/avatar`, {
    method: 'POST',
    data: formData, // Không ghi đè headers để Axios tự gắn boundary
  });
}

export async function uploadContract(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<BaseResponse<string>>(`/api/users/${id}/contract`, {
    method: 'POST',
    data: formData, // Không ghi đè headers để Axios tự gắn boundary
  });
}

export async function exportPdf(id: string): Promise<Blob> {
  return request<Blob>(`/api/export/users/${id}/pdf`, {
    method: 'GET',
    responseType: 'blob',
  });
}

export async function exportWord(id: string): Promise<Blob> {
  return request<Blob>(`/api/users/${id}/export/word`, {
    method: 'GET',
    responseType: 'blob',
  });
}

export async function getUserById(id: string) {
  return request<BaseResponse<UserItem>>(`/api/users/${id}`, {
    method: 'GET',
  });
}

export async function getPlants() {
  return request<BaseResponse<string[]>>('/api/users/plants', {
    method: 'GET',
  });
}

export async function getAuthorGroups() {
  return request<BaseResponse<any[]>>('/api/permission/groups', {
    method: 'GET',
  });
}

export async function exportExcel(params: Record<string, any>): Promise<Blob> {
  return request<Blob>('/api/users/export/excel', {
    method: 'GET',
    params,
    responseType: 'blob', // Nhận luồng nhị phân tệp tin Excel
  });
}

export async function deleteAttachment(attachmentId: number) {
  return request<BaseResponse<boolean>>(
    `/api/users/attachment/${attachmentId}`,
    {
      method: 'DELETE',
    },
  );
}

export async function downloadImportTemplate(): Promise<Blob> {
  return request<Blob>('/api/users/import/template', {
    method: 'GET',
    responseType: 'blob',
  });
}

export async function importUsers(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<BaseResponse<any>>('/api/users/import', {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
