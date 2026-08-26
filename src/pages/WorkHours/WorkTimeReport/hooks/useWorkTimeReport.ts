import { message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import * as reportService from '../service';
import type { WorkTimeReportSummaryStats } from '../types';

export const getDefaultTimesheetCycle = (): [string, string] => {
  const now = dayjs();
  const fromDate = now.date(11).format('YYYY-MM-DD');
  const toDate = now.add(1, 'month').date(10).format('YYYY-MM-DD');
  return [fromDate, toDate];
};

export function useWorkTimeReport() {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterUserGroup, setFilterUserGroup] = useState<string | undefined>(
    undefined,
  );
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(
    getDefaultTimesheetCycle(),
  );
  const [userGroupOptions, setUserGroupOptions] = useState<string[]>([]);

  const [stats, setStats] = useState<WorkTimeReportSummaryStats>({
    totalEmployees: 0,
    totalWorkUnits: 0,
    totalStandardHours: 0,
    totalOtHours: 0,
    totalCombinedHours: 0,
    totalWarnings: 0,
  });

  const [selectedUserCode, setSelectedUserCode] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tableRef = useRef<any>();

  const fetchStats = async () => {
    try {
      const res = await reportService.getWorkTimeReportStats({
        fromDate: dateRange ? dateRange[0] : undefined,
        toDate: dateRange ? dateRange[1] : undefined,
        userGroup: filterUserGroup,
      });
      if (res && res.isSuccess && res.data) {
        setStats(res.data);
      }
    } catch {}
  };

  useEffect(() => {
    reportService.getDistinctUserGroups().then((res) => {
      if (res && res.isSuccess && res.data) {
        setUserGroupOptions(res.data);
      }
    });
  }, []);

  useEffect(() => {
    fetchStats();
    const timer = setTimeout(() => {
      tableRef.current?.reload();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword, filterUserGroup, dateRange]);

  const handleSearch = () => {
    tableRef.current?.reload();
    fetchStats();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setFilterUserGroup(undefined);
    setDateRange(getDefaultTimesheetCycle());
  };

  const handleOpenDetail = (userCode: string, fullName: string) => {
    setSelectedUserCode(userCode);
    setSelectedUserName(fullName);
    setDrawerOpen(true);
  };

  const handleExportExcel = async () => {
    try {
      message.loading({
        content: 'Đang trích xuất báo cáo Excel...',
        key: 'exp',
      });
      const blob = await reportService.exportWorkTimeReportExcel({
        searchKeyword,
        userGroup: filterUserGroup,
        fromDate: dateRange ? dateRange[0] : undefined,
        toDate: dateRange ? dateRange[1] : undefined,
      });

      const url = window.URL.createObjectURL(new Blob([blob as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Hansol_WorkTimeReport_${dayjs().format('YYYYMMDD_HHmmss')}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success({ content: 'Xuất báo cáo thành công!', key: 'exp' });
    } catch {
      message.error({ content: 'Lỗi khi xuất tệp báo cáo!', key: 'exp' });
    }
  };

  return {
    tableRef,
    searchKeyword,
    setSearchKeyword,
    filterUserGroup,
    setFilterUserGroup,
    dateRange,
    setDateRange,
    userGroupOptions,
    stats,
    selectedUserCode,
    selectedUserName,
    drawerOpen,
    setDrawerOpen,
    handleSearch,
    handleReset,
    handleOpenDetail,
    handleExportExcel,
  };
}
