import { request } from '@umijs/max';
import { Form, message, Modal } from 'antd';
import { useRef, useState } from 'react';
import type { LaborContractItem } from '../types';

export function useContract() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<LaborContractItem[]>([]);
  
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterContractType, setFilterContractType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<number | undefined>(1);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<LaborContractItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [form] = Form.useForm();
  const tableRef = useRef<any>();

  const handleSearch = () => tableRef.current?.reload();

  const handleReset = () => {
    setSearchKeyword('');
    setFilterContractType(undefined);
    setFilterStatus(1);
    setTimeout(() => tableRef.current?.reload(), 100);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ status: 1, insuranceSalary: 7000000 });
    setModalVisible(true);
  };

  const handleEdit = () => {
    if (selectedRows.length !== 1) {
      message.warning('Vui lòng chọn duy nhất 1 hợp đồng để sửa!');
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
      const url = isUpdate ? `/api/labor-contracts/${editingItem.contractId}` : '/api/labor-contracts';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await request<any>(url, { method, data: values });
      if (res && res.isSuccess) {
        message.success(isUpdate ? 'Cập nhật hợp đồng thành công!' : 'Tạo mới hợp đồng thành công!');
        setModalVisible(false);
        tableRef.current?.reload();
      } else {
        message.error(res?.message || 'Lưu thất bại');
      }
    } catch {
      // Validation error
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = (status: number = 0) => {
    if (selectedRowKeys.length === 0) return;
    const isRestore = status === 1;
    const actionText = isRestore ? 'khôi phục' : 'xóa mềm';

    Modal.confirm({
      title: `Xác nhận ${actionText} hợp đồng`,
      content: `Bạn có chắc chắn muốn ${actionText} ${selectedRowKeys.length} hợp đồng đã chọn?`,
      okText: isRestore ? 'Khôi phục' : 'Xóa',
      okType: isRestore ? 'primary' : 'danger',
      onOk: async () => {
        try {
          const res = await request<any>('/api/labor-contracts/bulk-delete', {
            method: 'POST',
            data: { ids: selectedRowKeys, status },
          });
          if (res && res.isSuccess) {
            message.success(`Đã ${actionText} ${selectedRowKeys.length} hợp đồng thành công!`);
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
          }
        } catch {
          message.error(`Lỗi khi ${actionText} hợp đồng`);
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
    filterContractType,
    setFilterContractType,
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