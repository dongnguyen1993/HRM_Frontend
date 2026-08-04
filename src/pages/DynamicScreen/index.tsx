import { BaseTable } from '@/components/BaseTable';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Card, message } from 'antd';
import React, { useEffect, useState } from 'react';

interface DynamicScreenProps {
  apiUrl: string;
  title: string;
}

export const DynamicScreen: React.FC<DynamicScreenProps> = ({
  apiUrl,
  title,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ProColumns<any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Tự động gọi API lấy MetaData định nghĩa cột & Dữ liệu
  const fetchData = async () => {
    if (!apiUrl) return;
    setLoading(true);
    try {
      const res = await request<any>(apiUrl, { method: 'GET' });
      if (res && res.isSuccess) {
        const list = res.data || [];
        setData(list);

        // 2. Tự động sinh Cột Bảng từ Dữ liệu JSON trả về 100% TỰ ĐỘNG
        if (list.length > 0 && columns.length === 0) {
          const autoCols: ProColumns<any>[] = [
            { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
            ...Object.keys(list[0]).map((key) => ({
              title: key.toUpperCase(),
              dataIndex: key,
              width: 150,
            })),
          ];
          setColumns(autoCols);
        }
      }
    } catch {
      message.error(`Lỗi khi nạp dữ liệu từ API: ${apiUrl}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  return (
    <PageContainer title={title}>
      <Card size="small" loading={loading}>
        <BaseTable
          search={false}
          dataSource={data}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </PageContainer>
  );
};

export default DynamicScreen;
