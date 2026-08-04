import { history } from '@umijs/max';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { getUserDashboardStats, performCheckIn } from '../service';
import type { UserDashboardData } from '../types';

export function useUserDashboard() {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkInLoading, setCheckInLoading] = useState<boolean>(false);

  // Đồng hồ thời gian thực (Real-time Clock)
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('vi-VN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await getUserDashboardStats();
      if (res && res.isSuccess) {
        setData(res.data);
      }
    } catch {
      message.error('Lỗi khi tải dữ liệu Trang cá nhân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Xử lý sự kiện bấm nút CHECK-IN / CHECK-OUT
  const handleCheckIn = async (type: 'check-in' | 'check-out') => {
    setCheckInLoading(true);
    try {
      const res = await performCheckIn(type);
      if (res && res.isSuccess) {
        message.success(res.message || 'Ghi nhận chấm công thành công!');
        fetchDashboardData();
      }
    } catch {
      message.error('Lỗi hệ thống khi chấm công');
    } finally {
      setCheckInLoading(false);
    }
  };

  // Shortcuts chuyển hướng nhanh
  const navigateToLeaveRequest = () => history.push('/users/list');
  const navigateToAccountSettings = () => history.push('/account/settings');

  return {
    data,
    loading,
    checkInLoading,
    currentTime,
    handleCheckIn,
    navigateToLeaveRequest,
    navigateToAccountSettings,
  };
}
