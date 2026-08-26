import { message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import * as summaryService from '../service';

// HÀM TÍNH CHU KỲ CHẤM CÔNG HANSOL: TỪ NGÀY 11 THÁNG HIỆN TẠI ĐẾN NGÀY 10 THÁNG SAU
export const getDefaultTimesheetCycle = (): [string, string] => {
  const now = dayjs();
  const fromDate = now.date(11).format('YYYY-MM-DD');
  const toDate = now.add(1, 'month').date(10).format('YYYY-MM-DD');
  return [fromDate, toDate];
};

export function useWorkSummary() {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterUserGroup, setFilterUserGroup] = useState<string | undefined>(
    undefined,
  );
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );
  const [filterWarning, setFilterWarning] = useState<boolean | undefined>(
    undefined,
  );
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(
    getDefaultTimesheetCycle(),
  );
  const [userGroupOptions, setUserGroupOptions] = useState<string[]>([]);

  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);
  const tableRef = useRef<any>();

  // Tải danh mục phòng ban động
  useEffect(() => {
    summaryService.getDistinctUserGroups().then((res) => {
      if (res && res.isSuccess && res.data) {
        setUserGroupOptions(res.data);
      }
    });
  }, []);

  // Tự động tìm kiếm Live-Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      tableRef.current?.reload();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword, filterUserGroup, filterStatus, filterWarning, dateRange]);

  const handleSearch = () => {
    tableRef.current?.reload();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setFilterUserGroup(undefined);
    setFilterStatus(undefined);
    setFilterWarning(undefined);
    setDateRange(getDefaultTimesheetCycle());
  };

  const handleOpenCalculate = () => {
    setIsCalculateModalOpen(true);
  };

  const handleExecuteCalculate = async (values: any) => {
    try {
      message.loading({
        content: 'Đang chạy động cơ tính công...',
        key: 'calc',
      });

      const fromDateStr = values.dateRange?.[0]
        ? dayjs(values.dateRange[0]).format('YYYY-MM-DD')
        : getDefaultTimesheetCycle()[0];

      const toDateStr = values.dateRange?.[1]
        ? dayjs(values.dateRange[1]).format('YYYY-MM-DD')
        : getDefaultTimesheetCycle()[1];

      const res = await summaryService.calculateTimesheet({
        fromDate: fromDateStr,
        toDate: toDateStr,
        userCodeFilter: values.userCodeFilter?.trim() || undefined,
      });

      if (res && res.isSuccess) {
        message.success({
          content: res.message || 'Tính toán công thành công!',
          key: 'calc',
        });
        setIsCalculateModalOpen(false);
        tableRef.current?.reload();
        return true;
      }
      message.error({
        content: res?.message || 'Tính công thất bại!',
        key: 'calc',
      });
      return false;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Lỗi hệ thống khi tính công!';
      message.error({ content: errorMsg, key: 'calc' });
      return false;
    }
  };

  return {
    tableRef,
    searchKeyword,
    setSearchKeyword,
    filterUserGroup,
    setFilterUserGroup,
    filterStatus,
    setFilterStatus,
    filterWarning,
    setFilterWarning,
    dateRange,
    setDateRange,
    userGroupOptions,
    isCalculateModalOpen,
    setIsCalculateModalOpen,
    handleSearch,
    handleReset,
    handleOpenCalculate,
    handleExecuteCalculate,
  };
}
