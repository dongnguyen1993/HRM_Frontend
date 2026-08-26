import { BaseTable } from '@/components/BaseTable';
import { TableFilterCard } from '@/components/TableFilterCard';
import { DisconnectOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Popconfirm,
  Space,
  Tag,
} from 'antd';
import React from 'react';
import { useSignInLogs } from './hooks/useSignInLogs';
import type { SignInLogItem } from './types';

export const SignInLogList: React.FC = () => {
  const {
    tableRef,
    searchKeyword,
    setSearchKeyword,
    dateRange,
    setDateRange,
    handleSearch,
    handleReset,
    handleForceLogoutToken,
  } = useSignInLogs();

  const columns: ProColumns<SignInLogItem>[] = [
    { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
    { title: 'Mã NV', dataIndex: 'userCode', width: 110, fixed: 'left' },
    { title: 'Họ và Tên', dataIndex: 'fullName', width: 180 },
    {
      title: 'Trạng thái Phiên',
      dataIndex: 'sessionStatus',
      width: 140,
      render: (status: number) => {
        if (status === 1)
          return <Tag color="processing">🟢 Đang hoạt động</Tag>;
        if (status === 0) return <Tag color="error">🔴 Đã Force Logout</Tag>;
        return <Tag color="default">⚪ Hết hạn Token</Tag>;
      },
    },
    { title: 'IP Address', dataIndex: 'ipAddress', width: 130 },
    { title: 'Thiết bị / Trình duyệt', dataIndex: 'userAgent', width: 220 },
    {
      title: 'Thời gian Đăng nhập',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
    },
    {
      title: 'Hạn phiên (Expires)',
      dataIndex: 'expiresAt',
      valueType: 'dateTime',
      width: 160,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) =>
        record.sessionStatus === 1 ? (
          <Popconfirm
            title="Đăng xuất bắt buộc phiên này?"
            onConfirm={() =>
              handleForceLogoutToken(record.tokenId, record.userCode)
            }
            okText="Force Logout"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              type="primary"
              danger
              icon={<DisconnectOutlined />}
            >
              Force Logout
            </Button>
          </Popconfirm>
        ) : (
          <Tag color="default">Đã đóng</Tag>
        ),
    },
  ];

  return (
    <PageContainer title="Sign-in Logs (Lịch sử Đăng nhập & Quản lý Phiên)">
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={12}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Tìm kiếm:</span>
            <Input
              placeholder="Tìm theo Mã NV, Họ tên, IP..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={12}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 110 }}>
              Khoảng thời gian:
            </span>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Space>
        </Col>
      </TableFilterCard>

      <Card size="small">
        <BaseTable<SignInLogItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="tokenId"
          search={false}
          // BỔ SUNG 2 DÒNG NÀY ĐỂ KÍCH HOẠT NÚT SHOW SQL
          queryFile="SystemMgmt/SignInLogQueries"
          queryKey="GetPagedSignInLogs"
          request={async (params) => {
            const queryParams: Record<string, any> = {
              pageNumber: params.current,
              pageSize: params.pageSize,
              searchKeyword,
            };

            if (dateRange && dateRange.length === 2) {
              queryParams.fromDate = dateRange[0].format('YYYY-MM-DD');
              queryParams.toDate = dateRange[1].format('YYYY-MM-DD');
            }

            const res = await request<any>('/api/sign-in-logs', {
              method: 'GET',
              params: queryParams,
            });

            return {
              data: res.data || [],
              success: res.isSuccess,
              total: res.totalRecords,
            };
          }}
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </PageContainer>
  );
};

export default SignInLogList;
