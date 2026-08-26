import { message, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import * as deviceService from '../service';
import type { DeviceSetupItem } from '../types';

export function useDeviceSetup() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DeviceSetupItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string | undefined>(undefined);
  const [filterDirection, setFilterDirection] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<number | undefined>(1);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'update'>('create');
  const [currentRow, setCurrentRow] = useState<DeviceSetupItem | undefined>(undefined);

  const tableRef = useRef<any>();

  useEffect(() => {
    deviceService.getDistinctDeviceGroups().then((res) => {
      if (res && res.isSuccess && res.data) {
        setGroupOptions(res.data);
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      tableRef.current?.reload();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword, filterGroup, filterDirection, filterStatus]);

  const handleSearch = () => {
    tableRef.current?.reload();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setFilterGroup(undefined);
    setFilterDirection(undefined);
    setFilterStatus(1);
  };

  const handleAdd = () => {
    setModalType('create');
    setCurrentRow(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedRows.length !== 1) {
      message.warning('Vui lòng chọn duy nhất 1 thiết bị để sửa!');
      return;
    }
    setCurrentRow(selectedRows[0]);
    setModalType('update');
    setIsModalOpen(true);
  };

  const handleSaveDevice = async (values: any) => {
    try {
      if (modalType === 'create') {
        const res = await deviceService.createDevice(values);
        if (res && res.isSuccess) {
          message.success('Thêm mới thiết bị thành công!');
          setIsModalOpen(false);
          tableRef.current?.reload();
          return true;
        }
        message.error(res?.message || 'Thêm thiết bị thất bại!');
        return false;
      } else if (currentRow) {
        const res = await deviceService.updateDevice({
          ...values,
          deviceId: currentRow.deviceId,
        });
        if (res && res.isSuccess) {
          message.success('Cập nhật thiết bị thành công!');
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
    const ids: number[] = selectedRows.length > 0
      ? selectedRows.map((r) => Number(r.deviceId))
      : selectedRowKeys.map((k) => Number(k));

    if (ids.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 thiết bị!');
      return;
    }

    const isRestore = status === 1;
    const actionText = isRestore ? 'khôi phục' : 'xóa mềm';

    Modal.confirm({
      title: `Xác nhận ${actionText} thiết bị`,
      content: `Bạn có chắc chắn muốn ${actionText} ${ids.length} thiết bị đã chọn?`,
      okText: isRestore ? 'Khôi phục' : 'Xóa',
      okType: isRestore ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await deviceService.bulkUpdateDevicesStatus(ids, status);
          if (res && res.isSuccess) {
            message.success(`Đã ${actionText} ${ids.length} thiết bị thành công!`);
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
          } else {
            message.error(res?.message || 'Thao tác thất bại');
          }
        } catch {
          message.error(`Lỗi khi ${actionText} thiết bị`);
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
    filterGroup,
    setFilterGroup,
    filterDirection,
    setFilterDirection,
    filterStatus,
    setFilterStatus,
    groupOptions,
    isModalOpen,
    setIsModalOpen,
    modalType,
    currentRow,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleSaveDevice,
    handleBulkDelete,
  };
}