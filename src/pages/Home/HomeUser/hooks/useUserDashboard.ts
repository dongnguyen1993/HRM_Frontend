import { message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import * as dashboardService from '../service';
import type { UserDashboardOverview } from '../types';

export function useUserDashboard() {
  const [data, setData] = useState<UserDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs().format('HH:mm:ss'));

  // ĐỒNG HỒ LIVE TICKING MỖI GIÂY
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getUserDashboardOverview();
      if (res && res.isSuccess) {
        setData(res.data);
      }
    } catch {
      message.error('Không thể tải dữ liệu bảng điều khiển cá nhân!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePunch = async (type: 'IN' | 'OUT') => {
    try {
      message.loading({ content: 'Đang ghi nhận lượt quẹt...', key: 'punch' });
      const res = await dashboardService.selfPunch(type);
      if (res && res.isSuccess) {
        message.success({ content: res.message, key: 'punch' });
        fetchData();
      } else {
        message.error({
          content: res?.message || 'Chấm công thất bại!',
          key: 'punch',
        });
      }
    } catch {
      message.error({ content: 'Lỗi kết nối máy chủ!', key: 'punch' });
    }
  };

  return {
    data,
    loading,
    currentTime,
    fetchData,
    handlePunch,
  };
}
