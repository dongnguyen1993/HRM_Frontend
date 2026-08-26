import { message, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import * as shiftService from '../service';
import type { ShiftItem } from '../types';

export function useShiftSetup() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ShiftItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>(1);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'create' | 'update'>('create');
  const [currentRow, setCurrentRow] = useState<ShiftItem | undefined>(
    undefined,
  );

  const tableRef = useRef<any>();

  // TỰ ĐỘNG TÌM KIẾM THEO THỜI GIAN THỰC (DEBOUNCE 300MS)
  useEffect(() => {
    const timer = setTimeout(() => {
      tableRef.current?.reload();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword, filterStatus]);

  const handleSearch = () => {
    tableRef.current?.reload();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setFilterStatus(1);
  };

  const handleAdd = () => {
    setModalType('create');
    setCurrentRow(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedRows.length !== 1) {
      message.warning('Vui lòng chọn duy nhất 1 ca để chỉnh sửa!');
      return;
    }
    setCurrentRow(selectedRows[0]);
    setModalType('update');
    setIsModalOpen(true);
  };

  const handleSaveShift = async (values: any) => {
    try {
      if (modalType === 'create') {
        const payload = {
          shiftCode: values.shiftCode?.trim().toUpperCase(),
          shiftName: values.shiftName?.trim(),
          startTime: values.startTime,
          endTime: values.endTime,
          breakStartTime: values.breakStartTime,
          breakEndTime: values.breakEndTime,
          gracePeriodMinutes: Number(values.gracePeriodMinutes || 5),
          totalWorkHours: Number(values.totalWorkHours || 9.6),
          isOvernight: !!values.isOvernight,
          description: values.description,
        };

        const res = await shiftService.createShift(payload);
        if (res && res.isSuccess) {
          message.success('Thêm mới ca làm việc thành công!');
          setIsModalOpen(false);
          tableRef.current?.reload();
          return true;
        }
        message.error(res?.message || 'Thêm ca thất bại!');
        return false;
      } else if (currentRow) {
        const payload = {
          shiftId: currentRow.shiftId,
          shiftName: values.shiftName?.trim(),
          startTime: values.startTime,
          endTime: values.endTime,
          breakStartTime: values.breakStartTime,
          breakEndTime: values.breakEndTime,
          gracePeriodMinutes: Number(values.gracePeriodMinutes || 5),
          totalWorkHours: Number(values.totalWorkHours || 9.6),
          isOvernight: !!values.isOvernight,
          description: values.description,
        };

        const res = await shiftService.updateShift(payload);
        if (res && res.isSuccess) {
          message.success('Cập nhật ca làm việc thành công!');
          setIsModalOpen(false);
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

  const handleBulkDelete = (status: number = 0) => {
    const ids: number[] =
      selectedRows.length > 0
        ? selectedRows.map((r) => Number(r.shiftId))
        : selectedRowKeys.map((k) => Number(k));

    if (ids.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 ca làm việc!');
      return;
    }

    const isRestore = status === 1;
    const actionText = isRestore ? 'khôi phục' : 'xóa mềm';

    Modal.confirm({
      title: `Xác nhận ${actionText} ca làm việc`,
      content: `Bạn có chắc chắn muốn ${actionText} ${ids.length} ca đã chọn?`,
      okText: isRestore ? 'Khôi phục' : 'Xóa',
      okType: isRestore ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await shiftService.bulkUpdateShiftsStatus(ids, status);
          if (res && res.isSuccess) {
            message.success(
              `Đã ${actionText} ${ids.length} ca làm việc thành công!`,
            );
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
          } else {
            message.error(res?.message || 'Thao tác thất bại');
          }
        } catch {
          message.error(`Lỗi khi ${actionText} ca làm việc`);
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
    isModalOpen,
    setIsModalOpen,
    modalType,
    currentRow,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleSaveShift,
    handleBulkDelete,
  };
}
