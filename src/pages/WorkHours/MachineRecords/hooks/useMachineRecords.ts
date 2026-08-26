import { message, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import * as recordService from '../../MachineRecords/service';
import type { MachineRecordItem } from '../../MachineRecords/types';

export function useMachineRecords() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<MachineRecordItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>(1);
  const [filterUserGroup, setFilterUserGroup] = useState<string | undefined>(
    undefined,
  );
  const [filterDeviceName, setFilterDeviceName] = useState<string | undefined>(
    undefined,
  );
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(
    undefined,
  );
  const [userGroupOptions, setUserGroupOptions] = useState<string[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'create' | 'update'>('create');
  const [currentRow, setCurrentRow] = useState<MachineRecordItem | undefined>(
    undefined,
  );

  const tableRef = useRef<any>();

  // Tải danh mục phòng ban
  useEffect(() => {
    recordService.getDistinctUserGroups().then((res) => {
      if (res && res.isSuccess && res.data) {
        setUserGroupOptions(res.data);
      }
    });
  }, []);

  // TỰ ĐỘNG TÌM KIẾM THEO THỜI GIAN THỰC (DEBOUNCE 300MS)
  useEffect(() => {
    const timer = setTimeout(() => {
      tableRef.current?.reload();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    searchKeyword,
    filterDeviceName,
    filterUserGroup,
    filterStatus,
    dateRange,
  ]);

  const handleSearch = () => {
    tableRef.current?.reload();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setFilterStatus(1);
    setFilterUserGroup(undefined);
    setFilterDeviceName(undefined);
    setDateRange(undefined);
  };

  const handleAdd = () => {
    setModalType('create');
    setCurrentRow(undefined);
    setIsCreateModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedRows.length !== 1) {
      message.warning('Vui lòng chọn duy nhất 1 bản ghi để sửa!');
      return;
    }
    setCurrentRow(selectedRows[0]);
    setModalType('update');
    setIsCreateModalOpen(true);
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  // LƯU DỮ LIỆU (THÊM MỚI / CHỈNH SỬA)
  const handleSaveRecord = async (values: any) => {
    try {
      const formattedTimestamp = values.logTimestamp
        ? dayjs(values.logTimestamp).format('YYYY-MM-DDTHH:mm:ss')
        : dayjs().format('YYYY-MM-DDTHH:mm:ss');

      const selectedReason = Array.isArray(values.reason)
        ? values.reason[0]
        : values.reason || 'Bấm sai giờ ra/vào';

      if (modalType === 'create') {
        const payload = {
          userCode: String(values.userCode || '').trim(),
          userName: values.userName
            ? String(values.userName).trim()
            : undefined,
          userGroup: values.userGroup || '3in1',
          logTimestamp: formattedTimestamp,
          deviceName: String(values.deviceName || 'GATE_IN_65.238').trim(),
          deviceId: String(values.deviceName || 'GATE_IN_65.238').trim(),
          eventDescription: '1:N authentication succeeded (Fingerprint)', // Luôn chuẩn xác
          fileNameImport: `Manual_Entry: ${selectedReason}`, // Đánh dấu thêm tay + Lý do
        };

        const res = await recordService.createMachineRecord(payload);
        if (res && res.isSuccess) {
          message.success('Thêm mới lượt quẹt thẻ thành công!');
          setIsCreateModalOpen(false);
          tableRef.current?.reload();
          return true;
        }
        message.error(res?.message || 'Thêm mới thất bại!');
        return false;
      } else if (currentRow) {
        const targetId = Number(
          currentRow.recordId ?? (currentRow as any).RecordId,
        );
        const payload = {
          recordId: targetId,
          userCode: currentRow.userCode,
          userName: currentRow.userName,
          userGroup: values.userGroup || currentRow.userGroup,
          logTimestamp: formattedTimestamp,
          deviceName: String(values.deviceName || 'GATE_IN_65.238').trim(),
          deviceId: String(values.deviceName || 'GATE_IN_65.238').trim(),
          eventDescription: '1:N authentication succeeded (Fingerprint)',
          fileNameImport: `Manual_Updated: ${selectedReason}`, // Đánh dấu sửa tay + Lý do
        };

        const res = await recordService.updateMachineRecord(payload);
        if (res && res.isSuccess) {
          message.success('Cập nhật lượt quẹt thẻ thành công!');
          setIsCreateModalOpen(false);
          tableRef.current?.reload();
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

  // XÓA MỀM (Status = 0) / KHÔI PHỤC (Status = 1)
  const handleBulkDelete = (status: number = 0) => {
    // Lấy danh sách ID an toàn từ selectedRows hoặc selectedRowKeys
    const ids: number[] =
      selectedRows.length > 0
        ? selectedRows.map((r: any) => Number(r.recordId ?? r.RecordId ?? r.id))
        : selectedRowKeys.map((k) => Number(k));

    if (ids.length === 0 || isNaN(ids[0])) {
      message.warning('Vui lòng chọn ít nhất 1 bản ghi hợp lệ!');
      return;
    }

    const isRestore = status === 1;
    const actionText = isRestore ? 'khôi phục' : 'xóa mềm';

    Modal.confirm({
      title: `Xác nhận ${actionText} bản ghi`,
      content: `Bạn có chắc chắn muốn ${actionText} ${ids.length} bản ghi đã chọn?`,
      okText: isRestore ? 'Khôi phục' : 'Xóa',
      okType: isRestore ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await recordService.bulkUpdateMachineRecordsStatus(
            ids,
            status,
          );
          if (res && res.isSuccess) {
            message.success(
              `Đã ${actionText} ${ids.length} bản ghi thành công!`,
            );
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
          } else {
            message.error(res?.message || 'Thao tác thất bại');
          }
        } catch {
          message.error(`Lỗi hệ thống khi ${actionText} bản ghi`);
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
    filterStatus,
    setFilterStatus,
    filterUserGroup,
    setFilterUserGroup,
    filterDeviceName,
    setFilterDeviceName,
    dateRange,
    setDateRange,
    userGroupOptions,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    modalType,
    currentRow,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleOpenImportModal,
    handleSaveRecord,
    handleBulkDelete,
  };
}
