import { BaseTable } from '@/components/BaseTable';
import { TableFilterCard } from '@/components/TableFilterCard';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { Button, Card, Col, Input, Popconfirm, Space, Tag, Typography } from 'antd';
import React from 'react';
import { useRequests } from './hooks/useRequests';
import { getWorkRequests } from './service';
import type { WorkRequestItem } from './types';

const { Text } = Typography;

export const RequestManagement: React.FC = () => {
  const {
    tableRef,
    searchKeyword,
    setSearchKeyword,
    handleSearch,
    handleReset,
    handleApprove,
  } = useRequests();

  const columns: ProColumns<WorkRequestItem>[] = [
    { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
    { title: 'Mã NV', dataIndex: 'userCode', width: 110, fixed: 'left' },
    { title: 'Họ và Tên', dataIndex: 'fullName', width: 180 },
    {
      title: 'Loại Đơn',
      dataIndex: 'requestType',
      width: 150,
      render: (t: string) => {
        if (t === 'LEAVE') return <Tag color="blue">Xin Nghỉ Phép</Tag>;
        if (t === 'OVERTIME') return <Tag color="orange">Đăng ký OT</Tag>;
        return <Tag color="purple">Giải Trình Chấm Công</Tag>;
      },
    },
    { title: 'Thời Gian Bắt Đầu', dataIndex: 'startDate', valueType: 'dateTime', width: 160 },
    { title: 'Thời Gian Kết Thúc', dataIndex: 'endDate', valueType: 'dateTime', width: 160 },
    { title: 'Lý Do', dataIndex: 'reason', width: 220 },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      width: 130,
      render: (st: string) => {
        if (st === 'APPROVED') return <Tag color="green">🟢 Đã Duyệt</Tag>;
        if (st === 'REJECTED') return <Tag color="red">🔴 Từ Chối</Tag>;
        return <Tag color="gold">🟡 Chờ Duyệt</Tag>;
      },
    },
    {
      title: 'Thao Tác Duyệt',
      key: 'actions',
      width: 130,
      fixed: 'right',
      render: (_, record) =>
        record.status === 'PENDING' ? (
          <Space size={4}>
            <Popconfirm title="Phê duyệt đơn này?" onConfirm={() => handleApprove(record.requestId, 'APPROVED')} okText="Phê duyệt" cancelText="Hủy">
              <Button size="small" type="primary" icon={<CheckOutlined />} style={{ backgroundColor: '#52c41a' }} />
            </Popconfirm>
            <Popconfirm title="Từ chối đơn này?" onConfirm={() => handleApprove(record.requestId, 'REJECTED')} okText="Từ chối" cancelText="Hủy" okButtonProps={{ danger: true }}>
              <Button size="small" danger icon={<CloseOutlined />} />
            </Popconfirm>
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>{record.approvedBy ? `Bởi ${record.approvedBy}` : 'Đã xử lý'}</Text>
        ),
    },
  ];

  return (
    <PageContainer title="Request Management (Phê Duyệt Đơn Từ Cá Nhân)">
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={12}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Tìm kiếm:</span>
            <Input placeholder="Tìm theo Mã NV, Họ tên..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onPressEnter={handleSearch} allowClear />
          </Space>
        </Col>
      </TableFilterCard>

      <Card size="small">
        <BaseTable<WorkRequestItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="requestId"
          search={false}
          queryFile="Hrm/TimesheetQueries"
          queryKey="GetPagedWorkRequests"
          request={async (params) => {
            const res = await getWorkRequests({ pageNumber: params.current, pageSize: params.pageSize, searchKeyword });
            return { data: res.data || [], success: res.isSuccess, total: res.totalRecords };
          }}
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </PageContainer>
  );
};

export default RequestManagement;