import { request } from '@umijs/max';
import { Form, message } from 'antd';
import { useEffect, useState } from 'react';
import type { SystemSettingsConfig } from '../types';

export function useSystemSettings() {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [config, setConfig] = useState<SystemSettingsConfig | null>(null);
  const [form] = Form.useForm();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await request<any>('/api/system-settings', { method: 'GET' });
      if (res && res.isSuccess && res.data) {
        setConfig(res.data);
        form.setFieldsValue(res.data);
      }
    } catch {
      message.error('Lỗi khi tải tham số cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const res = await request<any>('/api/system-settings', {
        method: 'PUT',
        data: values,
      });

      if (res && res.isSuccess) {
        message.success('Cập nhật cấu hình tham số hệ thống thành công!');
        fetchSettings();
      } else {
        message.error(res?.message || 'Cập nhật thất bại');
      }
    } catch {
      // Form validation error
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    config,
    form,
    fetchSettings,
    handleSave,
  };
}
