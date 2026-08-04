import { BaseTable } from '@/components/BaseTable';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Card, Modal, Tag } from 'antd';
import React, { useState } from 'react';

export const AuditLogList: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const columns: ProColumns<any>[] = [
    {
      title: 'STT',
      valueType: 'index',
      width: 60,
      search: false,
      fixed: 'left',
    },
    // Ô TÌM KIẾM CHUNG (MÃ NV / ĐƯỜNG DẪN API)
    {
      title: 'Từ khóa (User / API)',
      dataIndex: 'searchKeyword',
      hideInTable: true,
      fieldProps: {
        placeholder: 'Nhập Mã NV hoặc đường dẫn API...',
      },
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'operatorCode',
      width: 130,
      search: false,
      fixed: 'left',
    },
    // TÌM KIẾM THEO LOẠI HÀNH ĐỘNG
    {
      title: 'Hành động',
      dataIndex: 'action',
      width: 110,
      valueType: 'select',
      valueEnum: {
        POST: { text: 'POST (Tạo/Xử lý)', status: 'Success' },
        PUT: { text: 'PUT (Cập nhật)', status: 'Warning' },
        DELETE: { text: 'DELETE (Xóa)', status: 'Error' },
      },
      render: (action: any) => {
        let color = 'blue';
        if (action === 'DELETE') color = 'red';
        if (action === 'PUT') color = 'orange';
        if (action === 'POST') color = 'green';
        return <Tag color={color}>{action}</Tag>;
      },
    },
    {
      title: 'API Endpoint / Path',
      dataIndex: 'tableName',
      width: 240,
      search: false,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      width: 130,
      search: false, // BỎ Ô TÌM KIẾM BẰNG IP
    },
    // TÌM KIẾM THEO KHOẢNG NGÀY THUẦN (BỎ GIỜ / PHÚT / GIÂY)
    {
      title: 'Khoảng thời gian',
      dataIndex: 'dateRange',
      valueType: 'dateRange', // DẠNG DATE RANGE CHỌN NGÀY CHUẨN ANTD
      hideInTable: true,
      fieldProps: {
        placeholder: ['Từ ngày', 'Đến ngày'],
      },
    },
    {
      title: 'Thời gian thực hiện',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 170,
      search: false,
    },
    {
      title: 'Chi tiết Body Payload',
      key: 'detail',
      width: 150,
      search: false, // BỎ Ô TÌM KIẾM BẰNG BODY PAYLOAD
      render: (_, record) => (
        <a
          className="text-blue-500 font-bold cursor-pointer"
          onClick={() => {
            setSelectedLog(record);
            setModalVisible(true);
          }}
        >
          🔍 Xem Payload JSON
        </a>
      ),
    },
  ];

  return (
    <PageContainer title="Audit Logs (Nhật ký Hệ thống)">
      <Card size="small">
        <BaseTable
          columns={columns}
          request={async (params) => {
            // Mapping dữ liệu tìm kiếm truyền sang Backend API
            const queryParams: Record<string, any> = {
              pageNumber: params.current,
              pageSize: params.pageSize,
              searchKeyword: params.searchKeyword || '',
              action: params.action || '',
            };

            // Tách mảng Ngày [Từ ngày, Đến ngày]
            if (params.dateRange && params.dateRange.length === 2) {
              queryParams.fromDate = params.dateRange[0];
              queryParams.toDate = params.dateRange[1];
            }

            const res = await request<any>('/api/audit-logs', {
              method: 'GET',
              params: queryParams,
            });

            return {
              data: res.data || [],
              success: res.isSuccess,
              total: res.totalRecords,
            };
          }}
          rowKey="logId"
          pagination={{ pageSize: 15 }}
        />
      </Card>

      <Modal
        title="Chi tiết Dữ liệu Nhật ký Thao tác"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedLog && (
          <div className="space-y-3">
            <div>
              <b>API Path:</b>{' '}
              <Tag color="geekblue">{selectedLog.tableName}</Tag>
            </div>
            <div>
              <b>Nội dung JSON Body (Request Body):</b>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs mt-1 overflow-x-auto font-mono">
                {selectedLog.newValues || 'Không có dữ liệu Body'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default AuditLogList;
