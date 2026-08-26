import { request } from '@umijs/max';
import type {
  BaseResponse,
  EmployeeDailyDetail,
  MonthlyMatrixRow,
  WorkTimeReportSummaryStats,
} from './types';

const BASE_URL = '/api/work-time-report';

export async function getPagedWorkTimeReport(params: Record<string, any>) {
  return request<any>(BASE_URL, {
    method: 'GET',
    params,
  });
}

export async function getWorkTimeReportStats(params: Record<string, any>) {
  return request<BaseResponse<WorkTimeReportSummaryStats>>(
    `${BASE_URL}/stats`,
    {
      method: 'GET',
      params,
    },
  );
}

export async function getEmployeeMonthlyDetail(params: {
  userCode: string;
  fromDate?: string;
  toDate?: string;
}) {
  return request<BaseResponse<EmployeeDailyDetail[]>>(
    `${BASE_URL}/employee-detail`,
    {
      method: 'GET',
      params,
    },
  );
}

export async function getMonthlyMatrix(params: Record<string, any>) {
  return request<BaseResponse<MonthlyMatrixRow[]>>(`${BASE_URL}/matrix`, {
    method: 'GET',
    params,
  });
}

export async function exportWorkTimeReportExcel(params: Record<string, any>) {
  return request(`${BASE_URL}/export-excel`, {
    method: 'GET',
    params,
    responseType: 'blob',
  });
}

export async function getDistinctUserGroups() {
  return request<BaseResponse<string[]>>('/api/machine-records/groups', {
    method: 'GET',
  });
}
