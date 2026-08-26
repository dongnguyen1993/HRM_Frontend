import { message } from 'antd';
import { useRef, useState } from 'react';
import { approveWorkRequest } from '../service';

export function useRequests() {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const tableRef = useRef<any>();

  const handleSearch = () => tableRef.current?.reload();

  const handleReset = () => {
    setSearchKeyword('');
    setTimeout(() => tableRef.current?.reload(), 100);
  };

  const handleApprove = async (requestId: number, status: string) => {
    try {
      const res = await approveWorkRequest(requestId, status);
      if (res && res.isSuccess) {
        message.success(
          status === 'APPROVED' ? 'Đã phê duyệt đơn!' : 'Đã từ chối đơn!',
        );
        tableRef.current?.reload();
      }
    } catch {
      message.error('Lỗi khi phê duyệt đơn');
    }
  };

  return {
    tableRef,
    searchKeyword,
    setSearchKeyword,
    handleSearch,
    handleReset,
    handleApprove,
  };
}
