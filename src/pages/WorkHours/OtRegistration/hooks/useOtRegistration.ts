import { message, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import * as otService from '../service';
import type { OtRegistrationItem, OtStatistics } from '../types';

export const getDefaultTimesheetCycle = (): [string, string] => {
  const now = dayjs();
  const fromDate = now.date(11).format('YYYY-MM-DD');
  const toDate = now.add(1, 'month').date(10).format('YYYY-MM-DD');
  return [fromDate, toDate];
};

export function useOtRegistration() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<OtRegistrationItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterUserGroup, setFilterUserGroup] = useState<string | undefined>(
    undefined,
  );
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<
    string | undefined
  >(undefined);
  const [filterOtType, setFilterOtType] = useState<string | undefined>(
    undefined,
  );
  const [filterStatus, setFilterStatus] = useState<number | undefined>(1);
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(
    getDefaultTimesheetCycle(),
  );
  const [userGroupOptions, setUserGroupOptions] = useState<string[]>([]);

  const [stats, setStats] = useState<OtStatistics>({
    totalRegistrations: 0,
    totalPlannedHours: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'update'>('create');
  const [currentRow, setCurrentRow] = useState<OtRegistrationItem | undefined>(
    undefined,
  );

  const tableRef = useRef<any>();

  const fetchStats = async () => {
    try {
      const res = await otService.getOtStatistics({
        fromDate: dateRange ? dateRange[0] : undefined,
        toDate: dateRange ? dateRange[1] : undefined,
        userGroup: filterUserGroup,
      });
      if (res && res.isSuccess) {
        setStats(res.data);
      }
    } catch {}
  };

  useEffect(() => {
    otService.getDistinctUserGroups().then((res) => {
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
  }, [
    searchKeyword,
    filterUserGroup,
    filterApprovalStatus,
    filterOtType,
    filterStatus,
    dateRange,
  ]);

  const handleSearch = () => {
    tableRef.current?.reload();
    fetchStats();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setFilterUserGroup(undefined);
    setFilterApprovalStatus(undefined);
    setFilterOtType(undefined);
    setFilterStatus(1);
    setDateRange(getDefaultTimesheetCycle());
  };

  const handleAdd = () => {
    setModalType('create');
    setCurrentRow(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedRows.length !== 1) {
      message.warning('Vui lòng chọn duy nhất 1 đơn để chỉnh sửa!');
      return;
    }
    if (selectedRows[0].approvalStatus !== 'PENDING') {
      message.warning('Chỉ có thể chỉnh sửa đơn đang ở trạng thái Chờ duyệt!');
      return;
    }
    setCurrentRow(selectedRows[0]);
    setModalType('update');
    setIsModalOpen(true);
  };

  const handleSaveOt = async (values: any) => {
    try {
      if (modalType === 'create') {
        const payload = {
          userCodes: Array.isArray(values.userCodes)
            ? values.userCodes
            : [values.userCode],
          userGroup: values.userGroup,
          workDate: dayjs(values.workDate).format('YYYY-MM-DD'),
          shiftId: values.shiftId,
          plannedStartTime: dayjs(values.plannedStartTime).format(
            'YYYY-MM-DDTHH:mm:ss',
          ),
          plannedEndTime: dayjs(values.plannedEndTime).format(
            'YYYY-MM-DDTHH:mm:ss',
          ),
          plannedHours: Number(values.plannedHours),
          otType: values.otType,
          reason: values.reason,
        };

        const res = await otService.createOtRegistration(payload);
        if (res && res.isSuccess) {
          message.success('Đăng ký tăng ca thành công!');
          setIsModalOpen(false);
          tableRef.current?.reload();
          fetchStats();
          return true;
        }
        message.error(res?.message || 'Đăng ký thất bại!');
        return false;
      } else if (currentRow) {
        const payload = {
          registrationId: currentRow.registrationId,
          workDate: dayjs(values.workDate).format('YYYY-MM-DD'),
          shiftId: values.shiftId,
          plannedStartTime: dayjs(values.plannedStartTime).format(
            'YYYY-MM-DDTHH:mm:ss',
          ),
          plannedEndTime: dayjs(values.plannedEndTime).format(
            'YYYY-MM-DDTHH:mm:ss',
          ),
          plannedHours: Number(values.plannedHours),
          otType: values.otType,
          reason: values.reason,
        };

        const res = await otService.updateOtRegistration(payload);
        if (res && res.isSuccess) {
          message.success('Cập nhật đơn tăng ca thành công!');
          setIsModalOpen(false);
          tableRef.current?.reload();
          fetchStats();
          return true;
        }
        message.error(res?.message || 'Cập nhật thất bại!');
        return false;
      }
      return false;
    } catch {
      message.error('Lỗi khi gửi dữ liệu lên máy chủ!');
      return false;
    }
  };

  // PHÊ DUYỆT HÀNG LOẠT
  const handleApproveBatch = () => {
    const ids = selectedRows.map((r) => r.registrationId);
    if (ids.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 đơn để phê duyệt!');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận phê duyệt tăng ca',
      content: `Bạn có chắc chắn muốn PHÊ DUYỆT ${ids.length} đơn đăng ký tăng ca đã chọn?`,
      okText: 'Phê duyệt',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await otService.approveOtBatch(ids);
          if (res && res.isSuccess) {
            message.success(res.message || 'Phê duyệt thành công!');
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
            fetchStats();
          } else {
            message.error(res?.message || 'Phê duyệt thất bại!');
          }
        } catch {
          message.error('Lỗi hệ thống khi phê duyệt!');
        }
      },
    });
  };

  // TỪ CHỐI HÀNG LOẠT
  const handleRejectBatch = () => {
    const ids = selectedRows.map((r) => r.registrationId);
    if (ids.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 đơn để từ chối!');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận từ chối tăng ca',
      content: `Bạn có chắc chắn muốn TỪ CHỐI ${ids.length} đơn đăng ký tăng ca đã chọn?`,
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await otService.rejectOtBatch(
            ids,
            'Quản lý từ chối duyệt OT',
          );
          if (res && res.isSuccess) {
            message.success(res.message || 'Đã từ chối đơn tăng ca!');
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
            fetchStats();
          } else {
            message.error(res?.message || 'Từ chối thất bại!');
          }
        } catch {
          message.error('Lỗi hệ thống khi từ chối!');
        }
      },
    });
  };

  const handleBulkDelete = (status: number = 0) => {
    const ids = selectedRows.map((r) => r.registrationId);
    if (ids.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 đơn!');
      return;
    }

    const isRestore = status === 1;
    const actionText = isRestore ? 'khôi phục' : 'xóa mềm';

    Modal.confirm({
      title: `Xác nhận ${actionText} đơn tăng ca`,
      content: `Bạn có chắc chắn muốn ${actionText} ${ids.length} đơn đã chọn?`,
      okText: isRestore ? 'Khôi phục' : 'Xóa',
      okType: isRestore ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await otService.bulkUpdateOtStatus(ids, status);
          if (res && res.isSuccess) {
            message.success(`Đã ${actionText} ${ids.length} đơn thành công!`);
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
            fetchStats();
          } else {
            message.error(res?.message || 'Thao tác thất bại');
          }
        } catch {
          message.error(`Lỗi khi ${actionText} đơn`);
        }
      },
    });
  };

  return {
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    selectedRows,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterUserGroup,
    setFilterUserGroup,
    filterApprovalStatus,
    setFilterApprovalStatus,
    filterOtType,
    setFilterOtType,
    filterStatus,
    setFilterStatus,
    dateRange,
    setDateRange,
    userGroupOptions,
    stats,
    isModalOpen,
    setIsModalOpen,
    modalType,
    currentRow,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleSaveOt,
    handleApproveBatch,
    handleRejectBatch,
    handleBulkDelete,
  };
}
