import { Form, message, Modal } from 'antd';
import { useRef, useState } from 'react';
import { bulkDeleteShifts, createShift, updateShift } from '../service';
import type { ShiftItem } from '../types';

export function useShift() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ShiftItem[]>([]);

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(true);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ShiftItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [form] = Form.useForm();
  const tableRef = useRef<any>();

  const handleSearch = () => tableRef.current?.reload();

  const handleReset = () => {
    setSearchKeyword('');
    setFilterStatus(true);
    setTimeout(() => tableRef.current?.reload(), 100);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      useFlag: true,
      startTime: '08:00:00',
      endTime: '17:00:00',
      gracePeriodMinutes: 15,
    });
    setModalVisible(true);
  };

  const handleEdit = () => {
    if (selectedRows.length !== 1) {
      message.warning('Vui lòng chọn duy nhất 1 ca làm việc để sửa!');
      return;
    }
    const item = selectedRows[0];
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const isUpdate = !!editingItem;
      const res = isUpdate
        ? await updateShift(editingItem.shiftId, values)
        : await createShift(values);

      if (res && res.isSuccess) {
        message.success(
          isUpdate ? 'Cập nhật ca làm việc thành công!' : 'Tạo mới thành công!',
        );
        setModalVisible(false);
        tableRef.current?.reload();
      }
    } catch {
      // Form validation
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = (status: number = 0) => {
    if (selectedRowKeys.length === 0) return;
    const isRestore = status === 1;
    const actionText = isRestore ? 'khôi phục' : 'xóa mềm';

    Modal.confirm({
      title: `Xác nhận ${actionText} ca làm việc`,
      content: `Bạn có chắc chắn muốn ${actionText} ${selectedRowKeys.length} ca làm việc đã chọn?`,
      okText: isRestore ? 'Khôi phục' : 'Xóa',
      okType: isRestore ? 'primary' : 'danger',
      onOk: async () => {
        try {
          const res = await bulkDeleteShifts(
            selectedRowKeys as number[],
            status,
          );
          if (res && res.isSuccess) {
            message.success(
              `Đã ${actionText} ${selectedRowKeys.length} ca làm việc thành công!`,
            );
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
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
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterStatus,
    setFilterStatus,
    modalVisible,
    setModalVisible,
    editingItem,
    saving,
    form,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleSave,
    handleBulkDelete,
  };
}
