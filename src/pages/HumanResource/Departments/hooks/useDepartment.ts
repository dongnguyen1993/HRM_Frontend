import { Form, message } from 'antd';
import { useEffect, useState } from 'react';
import {
  createDepartment,
  getDepartmentTree,
  updateDepartment,
} from '../service';
import type { DepartmentItem } from '../types';

export function useDepartment() {
  const [treeData, setTreeData] = useState<DepartmentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DepartmentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [form] = Form.useForm();

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentTree();
      if (res && res.isSuccess) {
        setTreeData(res.data || []);
      }
    } catch {
      message.error('Lỗi khi tải cơ cấu phòng ban');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const selectNode = (item: DepartmentItem) => {
    setSelectedItem(item);
    form.setFieldsValue(item);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const isUpdate = !!selectedItem;
      const res = isUpdate
        ? await updateDepartment(selectedItem.departmentId, values)
        : await createDepartment(values);

      if (res && res.isSuccess) {
        message.success(
          isUpdate ? 'Cập nhật thành công!' : 'Tạo mới thành công!',
        );
        fetchTree();
      }
    } catch {
      // Validation error
    } finally {
      setSaving(false);
    }
  };

  return {
    treeData,
    selectedItem,
    loading,
    saving,
    form,
    fetchTree,
    selectNode,
    handleSave,
  };
}
