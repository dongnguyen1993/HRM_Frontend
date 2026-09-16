import { BaseTable } from '@/components/BaseTable';
import { PermissionGuard } from '@/components/PermissionGuard';
import { TableFilterCard } from '@/components/TableFilterCard';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import CalculateModal from './components/CalculateModal';
import { useWorkSummary } from './hooks/useWorkSummary';
import type { WorkSummaryItem } from './types';

const { RangePicker } = DatePicker;

export const WorkSummary: React.FC = () => {
  const {
    tableRef,
    searchKeyword,
    setSearchKeyword,
    filterUserGroup,
    setFilterUserGroup,
    filterStatus,
    setFilterStatus,
    filterWarning,
    setFilterWarning,
    dateRange,
    setDateRange,
    userGroupOptions,
    isCalculateModalOpen,
    setIsCalculateModalOpen,
    handleSearch,
    handleReset,
    handleOpenCalculate,
    handleExecuteCalculate,
  } = useWorkSummary();

  const columns: ProColumns<WorkSummaryItem>[] = [
    { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
    {
      title: 'Mã NV',
      dataIndex: 'userCode',
      width: 110,
      fixed: 'left',
      render: (text) => <b style={{ color: '#1890ff' }}>{text}</b>,
    },
    { title: 'Họ và Tên', dataIndex: 'fullName', width: 170, fixed: 'left' },
    {
      title: 'Bộ phận',
      dataIndex: 'userGroup',
      width: 130,
      render: (text: any) => (text ? <Tag color="blue">{text}</Tag> : '-'),
    },
    {
      title: 'Ngày làm việc',
      dataIndex: 'workDate',
      width: 120,
      render: (val: any) => <b>{dayjs(val).format('YYYY-MM-DD')}</b>,
    },
    {
      title: 'Ca làm',
      dataIndex: 'shiftName',
      width: 160,
      render: (text: any) => (text ? <Tag color="cyan">{text}</Tag> : '-'),
    },
    {
      title: 'Giờ Vào (Check-In)',
      dataIndex: 'checkInTime',
      width: 175,
      render: (val: any) =>
        val ? (
          <span style={{ color: '#00A651', fontWeight: 600 }}>
            {dayjs(val).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        ) : (
          <Tag color="red">Thiếu vào</Tag>
        ),
    },
    {
      title: 'Giờ Ra (Check-Out)',
      dataIndex: 'checkOutTime',
      width: 175,
      render: (val: any, record: any) => {
        if (!val) return <Tag color="red">Thiếu ra</Tag>;
        const isNextDay =
          dayjs(val).format('YYYY-MM-DD') !==
          dayjs(record.workDate).format('YYYY-MM-DD');
        return (
          <span
            style={{
              color: isNextDay ? '#722ed1' : '#1890ff',
              fontWeight: 600,
            }}
          >
            {dayjs(val).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        );
      },
    },
    {
      title: 'Công chuẩn',
      dataIndex: 'workUnits',
      width: 110,
      render: (val: any) => (
        <b
          style={{
            color: val >= 1.0 ? '#00A651' : val > 0 ? '#faad14' : '#ff4d4f',
          }}
        >
          {val} công
        </b>
      ),
    },
    {
      title: 'Tăng ca (OT)',
      dataIndex: 'otHours',
      width: 110,
      render: (val: any) =>
        val > 0 ? (
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            <b>+{val}h</b>
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Cảnh báo (Cờ đỏ)',
      dataIndex: 'isWarning',
      width: 130,
      render: (isWarn: any, r: WorkSummaryItem) =>
        isWarn ? (
          <Tooltip title={r.warningReason}>
            <Tag color="error" icon={<WarningOutlined />}>
              Cảnh báo
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Chuẩn
          </Tag>
        ),
    },
    {
      title: 'Ghi chú / Lý do',
      dataIndex: 'comment',
      width: 250,
      ellipsis: true,
    },
  ];

  return (
    <PageContainer title="Work Summary (Bảng Chấm Công Tổng Hợp - Hansol HRM)">
      {/* 1. KHỐI BỘ LỌC TÌM KIẾM */}
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Tìm kiếm:</span>
            <Input
              placeholder="Mã NV, Họ tên..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Bộ phận:</span>
            <Select
              placeholder="Tất cả Bộ phận"
              style={{ width: '100%' }}
              value={filterUserGroup}
              onChange={setFilterUserGroup}
              allowClear
              options={userGroupOptions.map((g) => ({ label: g, value: g }))}
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Thời gian:</span>
            <RangePicker
              style={{ width: '100%' }}
              value={
                dateRange
                  ? [dayjs(dateRange[0]), dayjs(dateRange[1])]
                  : undefined
              }
              format="YYYY-MM-DD"
              onChange={(_, dateStrings) => {
                setDateRange(
                  dateStrings[0] && dateStrings[1]
                    ? [dateStrings[0], dateStrings[1]]
                    : undefined,
                );
              }}
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Cảnh báo:</span>
            <Select
              placeholder="Tất cả bản ghi"
              style={{ width: '100%' }}
              value={filterWarning}
              onChange={setFilterWarning}
              allowClear
              options={[
                { label: '⚠️ Chỉ xem cờ đỏ (Thiếu quẹt/Lỗi)', value: true },
                { label: '✅ Công chuẩn hợp lệ', value: false },
              ]}
            />
          </Space>
        </Col>
      </TableFilterCard>

      {/* 2. BẢNG DỮ LIỆU CHÍNH */}
      <Card size="small">
        <BaseTable<WorkSummaryItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="logId"
          search={false}
          queryFile="WorkHours/WorkSummary/WorkSummaryQueries"
          queryKey="GetPagedWorkSummary"
          toolBarRender={() => [
            <PermissionGuard key="calculate-btn" action="save" routePath="/work-hours/work-summary">
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleOpenCalculate}
                style={{
                  backgroundColor: '#faad14',
                  borderColor: '#faad14',
                  color: '#000',
                  fontWeight: 'bold',
                }}
              >
                ⚡ Tính toán công (Calculate Engine)
              </Button>
            </PermissionGuard>,
          ]}
          request={async (params) => {
            const res = await request<any>('/api/work-summary', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword,
                userGroup: filterUserGroup,
                status: filterStatus,
                isWarning: filterWarning,
                fromDate: dateRange ? dateRange[0] : undefined,
                toDate: dateRange ? dateRange[1] : undefined,
              },
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

      {/* 3. MODAL KÍCH HOẠT TÍNH CÔNG */}
      <CalculateModal
        open={isCalculateModalOpen}
        onOpenChange={setIsCalculateModalOpen}
        onFinish={handleExecuteCalculate}
      />
    </PageContainer>
  );
};

export default WorkSummary;
