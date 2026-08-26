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
      hideInSearch: true,
      fixed: 'left',
    },
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
      hideInSearch: true,
      fixed: 'left',
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      width: 110,
      valueType: 'select',
      valueEnum: {
        POST: { text: 'POST (Tạo mới/Xử lý)', status: 'Success' },
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
      hideInSearch: true,
    },
    {
      title: 'Khoảng thời gian',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
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
      hideInSearch: true,
    },
    {
      title: 'Chi tiết Body Payload',
      key: 'detail',
      width: 150,
      hideInSearch: true,
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
          // BỔ SUNG 2 DÒNG NÀY ĐỂ KÍCH HOẠT NÚT SHOW SQL
          queryFile="SystemMgmt/AuditLogQueries"
          queryKey="GetPagedAuditLogs"
          request={async (params) => {
            const queryParams: Record<string, any> = {
              pageNumber: params.current,
              pageSize: params.pageSize,
              searchKeyword: params.searchKeyword || '',
              action: params.action || '',
            };

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
