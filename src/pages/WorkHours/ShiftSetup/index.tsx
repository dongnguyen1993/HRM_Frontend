import { BaseTable } from '@/components/BaseTable';
import { TableActionBar } from '@/components/TableActionBar';
import { TableFilterCard } from '@/components/TableFilterCard';
import {
  ClockCircleOutlined,
  EyeOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  Modal,
  Select,
  Space,
  Tag,
} from 'antd';
import React, { useState } from 'react';
import ShiftModal from './components/ShiftModal';
import { useShiftSetup } from './hooks/useShiftSetup';
import type { ShiftItem } from './types';

export const ShiftSetup: React.FC = () => {
  const {
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    selectedRows,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterStatus,
    setFilterStatus,
    isModalOpen,
    setIsModalOpen,
    modalType,
    currentRow,
    handleAdd,
    handleEdit,
    handleSaveShift,
    handleBulkDelete,
    handleSearch,
    handleReset,
  } = useShiftSetup();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ShiftItem | null>(null);

  const columns: ProColumns<ShiftItem>[] = [
    {
      title: 'STT',
      valueType: 'index',
      width: 65,
      fixed: 'left',
      render: (_, record, index, action) => {
        const current = action?.pageInfo?.current || 1;
        const pageSize = action?.pageInfo?.pageSize || 15;
        const stt = (current - 1) * pageSize + index + 1;
        return (
          <Button
            type="link"
            size="small"
            style={{ padding: 0, fontWeight: 'bold', color: '#1890ff' }}
            onClick={() => {
              setDetailRecord(record);
              setDetailModalOpen(true);
            }}
          >
            {stt}
          </Button>
        );
      },
    },
    {
      title: 'Mã Ca (Shift Code)',
      dataIndex: 'shiftCode',
      width: 140,
      fixed: 'left',
      render: (text) => <b style={{ color: '#1890ff' }}>{text}</b>,
    },
    { title: 'Tên Ca Làm Việc', dataIndex: 'shiftName', width: 220 },
    {
      title: 'Giờ Vào (Check-In)',
      dataIndex: 'startTime',
      width: 130,
      render: (text: any) => (
        <Tag color="green" icon={<ClockCircleOutlined />}>
          <b>{text}</b>
        </Tag>
      ),
    },
    {
      title: 'Giờ Ra (Check-Out)',
      dataIndex: 'endTime',
      width: 130,
      render: (text: any) => (
        <Tag color="volcano" icon={<ClockCircleOutlined />}>
          <b>{text}</b>
        </Tag>
      ),
    },
    {
      title: 'Nghỉ Giữa Ca',
      width: 150,
      render: (_, r) =>
        r.breakStartTime && r.breakEndTime ? (
          <span>
            {r.breakStartTime} - {r.breakEndTime}
          </span>
        ) : (
          <span style={{ color: '#bfbfbf' }}>Không nghỉ</span>
        ),
    },
    {
      title: 'Cho phép trễ',
      dataIndex: 'gracePeriodMinutes',
      width: 120,
      render: (val: any) => <Tag color="blue">{val} phút</Tag>,
    },
    {
      title: 'Công chuẩn',
      dataIndex: 'totalWorkHours',
      width: 110,
      render: (val: any) => <b style={{ color: '#00A651' }}>{val}h</b>,
    },
    {
      title: 'Loại Ca',
      dataIndex: 'isOvernight',
      width: 120,
      render: (isNight: any) => (
        <Tag color={isNight ? 'magenta' : 'cyan'}>
          {isNight ? 'Ca Đêm (Qua ngày)' : 'Ca Ngày'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 110,
      render: (status: any) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Hoạt động' : 'Đã xóa'}
        </Tag>
      ),
    },
  ];

  const isFilteringDeleted = filterStatus === 0;

  return (
    <PageContainer title="Shift Setup (Cấu hình Ca Làm Việc - Hansol Timesheet Engine)">
      {/* 1. KHỐI BỘ LỌC TÌM KIẾM */}
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Tìm kiếm:</span>
            <Input
              placeholder="Mã ca, Tên ca làm việc..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Trạng thái:</span>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { label: 'Hoạt động (Active)', value: 1 },
                { label: 'Đã xóa (Deleted)', value: 0 },
              ]}
            />
          </Space>
        </Col>
      </TableFilterCard>

      {/* 2. BẢNG DỮ LIỆU */}
      <Card size="small">
        <BaseTable<ShiftItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="shiftId"
          search={false}
          queryFile="WorkHours/ShiftSetup/ShiftSetupQueries"
          queryKey="GetPagedShifts"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, rows) => {
              setSelectedRowKeys(keys);
              setSelectedRows(rows);
            },
          }}
          toolBarRender={() => [
            isFilteringDeleted ? (
              <Button
                key="restore"
                icon={<UndoOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => handleBulkDelete(1)}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  color: '#fff',
                }}
              >
                BỎ XÓA ({selectedRowKeys.length})
              </Button>
            ) : (
              <TableActionBar
                key="actions"
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={() => handleBulkDelete(0)}
                addText="Thêm mới Ca"
                selectedCount={selectedRowKeys.length}
              />
            ),
          ]}
          request={async (params) => {
            const res = await request<any>('/api/shift-setup', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword,
                status: filterStatus,
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

      {/* 3. MODAL CHI TIẾT CA */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết Ca Làm Việc #{detailRecord?.shiftId}</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setDetailModalOpen(false)}
          >
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {detailRecord && (
          <Descriptions
            bordered
            column={2}
            size="small"
            style={{ marginTop: 12 }}
          >
            <Descriptions.Item label="Mã ca (Shift Code)" span={1}>
              <b style={{ color: '#1890ff' }}>{detailRecord.shiftCode}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Tên ca" span={1}>
              {detailRecord.shiftName}
            </Descriptions.Item>
            <Descriptions.Item label="Giờ vào ca (Check-In)" span={1}>
              <Tag color="green">{detailRecord.startTime}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Giờ kết thúc (Check-Out)" span={1}>
              <Tag color="volcano">{detailRecord.endTime}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Giờ nghỉ giữa ca" span={1}>
              {detailRecord.breakStartTime && detailRecord.breakEndTime
                ? `${detailRecord.breakStartTime} - ${detailRecord.breakEndTime}`
                : 'Không có'}
            </Descriptions.Item>
            <Descriptions.Item label="Cho phép trễ hợp lệ" span={1}>
              <Tag color="blue">{detailRecord.gracePeriodMinutes} phút</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng giờ công chuẩn" span={1}>
              <b style={{ color: '#00A651' }}>{detailRecord.totalWorkHours}h</b>
            </Descriptions.Item>
            <Descriptions.Item label="Ca qua đêm" span={1}>
              <Tag color={detailRecord.isOvernight ? 'magenta' : 'cyan'}>
                {detailRecord.isOvernight ? 'Có (Qua ngày)' : 'Không'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả / Ghi chú" span={2}>
              {detailRecord.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 4. MODAL THÊM / SỬA CA */}
      <ShiftModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        type={modalType}
        currentRow={currentRow}
        onFinish={handleSaveShift}
      />
    </PageContainer>
  );
};

export default ShiftSetup;
