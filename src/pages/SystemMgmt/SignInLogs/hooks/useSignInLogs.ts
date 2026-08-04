import { request } from '@umijs/max';
import { message, Modal } from 'antd';
import { useRef, useState } from 'react';

export function useSignInLogs() {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<any>(null);
  const tableRef = useRef<any>();

  const handleSearch = () => {
    tableRef.current?.reload();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setDateRange(null);
    setTimeout(() => {
      tableRef.current?.reload();
    }, 100);
  };

  // FORCE LOGOUT 1 PHIÊN ĐĂNG NHẬP
  const handleForceLogoutToken = (tokenId: number, userCode: string) => {
    Modal.confirm({
      title: 'Xác nhận Đăng xuất bắt buộc (Force Logout)',
      content: `Bạn có chắc chắn muốn ngắt kết nối phiên đăng nhập của nhân viên [${userCode}] không?`,
      okText: 'Force Logout',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await request<any>(
            `/api/sign-in-logs/force-logout-token/${tokenId}`,
            {
              method: 'POST',
            },
          );
          if (res && res.isSuccess) {
            message.success('Đã ngắt kết nối phiên đăng nhập thành công!');
            tableRef.current?.reload();
          } else {
            message.error(res?.message || 'Thao tác thất bại');
          }
        } catch {
          message.error('Lỗi khi thực hiện Force Logout');
        }
      },
    });
  };

  return {
    tableRef,
    searchKeyword,
    setSearchKeyword,
    dateRange,
    setDateRange,
    handleSearch,
    handleReset,
    handleForceLogoutToken,
  };
}
