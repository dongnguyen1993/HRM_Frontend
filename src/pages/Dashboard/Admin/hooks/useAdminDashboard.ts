import { history } from '@umijs/max';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { getAdminDashboardStats } from '../service';
import type { AdminDashboardData } from '../types';

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await getAdminDashboardStats();
      if (res && res.isSuccess) {
        setData(res.data);
      }
    } catch {
      message.error('Lỗi khi tải dữ liệu Bảng điều khiển Admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Shortcut dẫn tới các phân hệ khẩn cấp
  const navigateToUsers = () => history.push('/system-mgmt/user-management');
  const navigateToPermissions = () =>
    history.push('/system-mgmt/permission-mapping');
  const navigateToAuditLogs = () => history.push('/system-mgmt/audit-logs');

  return {
    data,
    loading,
    fetchDashboardData,
    navigateToUsers,
    navigateToPermissions,
    navigateToAuditLogs,
  };
}
