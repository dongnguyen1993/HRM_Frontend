import { request } from '@umijs/max';
import { Form, message } from 'antd';
import React, { useEffect, useState } from 'react';
import type { ProgramMenuItem } from '../types';

export const toSlug = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function useProgramList() {
  const [treeData, setTreeData] = useState<ProgramMenuItem[]>([]);
  const [flatList, setFlatList] = useState<ProgramMenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ProgramMenuItem | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  const getAllKeys = (nodes: ProgramMenuItem[]): React.Key[] => {
    let keys: React.Key[] = [];
    nodes.forEach((node) => {
      keys.push(node.programKey);
      if (node.children && node.children.length > 0) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  const flattenTree = (nodes: ProgramMenuItem[]): ProgramMenuItem[] => {
    let result: ProgramMenuItem[] = [];
    nodes.forEach((node) => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children));
      }
    });
    return result;
  };

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await request<any>('/api/program-menu/tree', {
        method: 'GET',
      });
      if (res && res.isSuccess) {
        const tree = res.data || [];
        setTreeData(tree);
        const flattened = flattenTree(tree);
        setFlatList(flattened);

        const allKeys = getAllKeys(tree);
        setExpandedKeys(allKeys);

        if (flattened.length > 0 && !selectedItem) {
          selectProgram(flattened[0]);
        }
      }
    } catch {
      message.error('Lỗi khi tải danh mục Program List');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const selectProgram = (item: ProgramMenuItem) => {
    setSelectedItem(item);
    form.setFieldsValue({
      programId: item.programId,
      programKey: item.programKey,
      parentProgramKey: item.parentProgramKey || '',
      programName: item.programName,
      programGroup: item.programGroup || 'System Config',
      path: item.path || '',
      apiUrl: item.apiUrl || '',
      useFlag: item.useFlag,
      menuFlag: item.menuFlag,
      sortOrder: item.sortOrder,
      comment: item.comment,
      createdAt: item.createdAt,
      createdBy: item.createdBy,
      updatedAt: item.updatedAt,
      updatedBy: item.updatedBy,
    });
  };

  const handleNew = () => {
    setSelectedItem(null);
    form.resetFields();
    form.setFieldsValue({
      useFlag: true,
      menuFlag: true,
      programGroup: 'System Config',
      sortOrder: 0,
    });
  };

  const handleProgramNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!selectedItem) {
      const parentKey = form.getFieldValue('parentProgramKey');
      const parentItem = flatList.find((i) => i.programKey === parentKey);

      const parentPrefix = parentItem?.path ? parentItem.path : '/system-mgmt';
      const slug = toSlug(name);
      const autoPath = slug ? `${parentPrefix}/${slug}` : parentPrefix;

      form.setFieldsValue({ path: autoPath });
    }
  };

  const handleExpandAll = () => setExpandedKeys(getAllKeys(treeData));
  const handleCollapseAll = () => setExpandedKeys([]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const res = await request<any>('/api/program-menu', {
        method: 'POST',
        data: values,
      });

      if (res && res.isSuccess) {
        message.success('Tạo mới Program thành công!');
        fetchTree();
      } else {
        message.error(res?.message || 'Tạo mới thất bại');
      }
    } catch {
      // Validation error
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) {
      message.warning('Vui lòng chọn một Program để cập nhật!');
      return;
    }

    try {
      const values = await form.validateFields();
      setSaving(true);
      const res = await request<any>(
        `/api/program-menu/${selectedItem.programId}`,
        {
          method: 'PUT',
          data: values,
        },
      );

      if (res && res.isSuccess) {
        message.success('Cập nhật Program thành công!');
        fetchTree();
      } else {
        message.error(res?.message || 'Cập nhật thất bại');
      }
    } catch {
      // Validation error
    } finally {
      setSaving(false);
    }
  };

  return {
    treeData,
    flatList,
    selectedItem,
    loading,
    saving,
    form,
    expandedKeys,
    setExpandedKeys,
    fetchTree,
    selectProgram,
    handleNew,
    handleProgramNameChange,
    handleExpandAll,
    handleCollapseAll,
    handleCreate,
    handleUpdate,
  };
}
