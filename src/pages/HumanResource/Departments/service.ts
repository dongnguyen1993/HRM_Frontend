import { request } from '@umijs/max';

export async function getDepartmentTree() {
  return request<any>('/api/departments/tree', { method: 'GET' });
}

export async function createDepartment(data: any) {
  return request<any>('/api/departments', { method: 'POST', data });
}

export async function updateDepartment(id: number, data: any) {
  return request<any>(`/api/departments/${id}`, { method: 'PUT', data });
}

export async function deleteDepartment(id: number) {
  return request<any>(`/api/departments/${id}`, { method: 'DELETE' });
}
