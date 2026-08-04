import { request } from '@umijs/max';
import { Form, message, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { CommonCodeItem } from '../types';

export function useCommonCode() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<CommonCodeItem[]>([]);

  // Filter States
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterGroupCode, setFilterGroupCode] = useState<string | undefined>(
    undefined,
  );
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(
    undefined,
  );

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<CommonCodeItem | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [form] = Form.useForm();
  const tableRef = useRef<any>();

  const fetchGroupOptions = async () => {
    try {
      const res = await request<any>('/api/common-code/groups', {
        method: 'GET',
      });
      if (res && res.isSuccess) {
        setGroups(res.data || []);
      }
    } catch {
      message.error('Lỗi khi tải danh sách Nhóm mã');
    }
  };

  useEffect(() => {
    fetchGroupOptions();
  }, []);

  const handleSearch = () => {
    tableRef.current?.reload();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setFilterGroupCode(undefined);
    setFilterStatus(undefined);
    setTimeout(() => {
      tableRef.current?.reload();
    }, 100);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      useFlag: true,
      sortOrder: 1,
      groupCode: filterGroupCode || '',
    });
    setModalVisible(true);
  };

  const handleEdit = () => {
    if (selectedRows.length !== 1) {
      message.warning('Vui lòng chọn duy nhất 1 bản ghi để sửa!');
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
      setActionLoading(true);
      const isUpdate = !!editingItem;
      const url = isUpdate
        ? `/api/common-code/${editingItem.codeId}`
        : '/api/common-code';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await request<any>(url, { method, data: values });
      if (res && res.isSuccess) {
        message.success(
          isUpdate ? 'Cập nhật thành công!' : 'Tạo mới thành công!',
        );
        setModalVisible(false);
        fetchGroupOptions();
        tableRef.current?.reload();
      } else {
        message.error(res?.message || 'Lưu thất bại');
      }
    } catch {
      // Form validation
    } finally {
      setActionLoading(false);
    }
  };

  // XỬ LÝ XÓA MỀM (Status = 0) HỎAC BỎ XÓA / KHÔI PHỤC (Status = 1)
  const handleBulkDelete = (status: number = 0) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 bản ghi!');
      return;
    }

    const isRestore = status === 1;
    const actionText = isRestore ? 'khôi phục' : 'xóa mềm';

    Modal.confirm({
      title: `Xác nhận ${actionText} hàng loạt`,
      content: `Bạn có chắc chắn muốn ${actionText} ${selectedRowKeys.length} mã dùng chung đã chọn?`,
      okText: isRestore ? 'Khôi phục' : 'Xóa',
      okType: isRestore ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await request<any>('/api/common-code/bulk-delete', {
            method: 'POST',
            data: { ids: selectedRowKeys, status }, // Gửi status: 0 hoặc 1
          });

          if (res && res.isSuccess) {
            message.success(
              `Đã ${actionText} ${selectedRowKeys.length} mã thành công!`,
            );
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
          } else {
            message.error(res?.message || 'Thao tác thất bại');
          }
        } catch {
          message.error(`Lỗi khi ${actionText} hàng loạt`);
        }
      },
    });
  };

  return {
    groups,
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    selectedRows,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterGroupCode,
    setFilterGroupCode,
    filterStatus,
    setFilterStatus,
    modalVisible,
    setModalVisible,
    editingItem,
    actionLoading,
    form,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleSave,
    handleBulkDelete,
  };
}
