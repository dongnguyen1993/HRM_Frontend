import { BaseTable } from '@/components/BaseTable';
import { TableActionBar } from '@/components/TableActionBar';
import { TableFilterCard } from '@/components/TableFilterCard';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FireOutlined,
  HourglassOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import OtModal from '../OtRegistration/components/OtModal';
import { useOtRegistration } from '../OtRegistration/hooks/useOtRegistration';
import type { OtRegistrationItem } from './types';

const { RangePicker } = DatePicker;

export const OtRegistration: React.FC = () => {
  const {
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    selectedRows,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterUserGroup,
    setFilterUserGroup,
    filterApprovalStatus,
    setFilterApprovalStatus,
    filterOtType,
    setFilterOtType,
    filterStatus,
    setFilterStatus,
    dateRange,
    setDateRange,
    userGroupOptions,
    stats,
    isModalOpen,
    setIsModalOpen,
    modalType,
    currentRow,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleSaveOt,
    handleApproveBatch,
    handleRejectBatch,
    handleBulkDelete,
  } = useOtRegistration();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<OtRegistrationItem | null>(
    null,
  );

  const columns: ProColumns<OtRegistrationItem>[] = [
    {
      title: 'STT',
      valueType: 'index',
      width: 60,
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
      title: 'Ngày OT',
      dataIndex: 'workDate',
      width: 120,
      render: (val: any) => <b>{dayjs(val).format('YYYY-MM-DD')}</b>,
    },
    {
      title: 'Ca làm',
      dataIndex: 'shiftName',
      width: 150,
      render: (text: any) => <Tag color="cyan">{text || 'Ca Ngày'}</Tag>,
    },
    {
      title: 'Giờ bắt đầu',
      dataIndex: 'plannedStartTime',
      width: 165,
      render: (val: any) =>
        val ? (
          <span style={{ color: '#00A651', fontWeight: 600 }}>
            {dayjs(val).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: 'Giờ kết thúc',
      dataIndex: 'plannedEndTime',
      width: 165,
      render: (val: any) =>
        val ? (
          <span style={{ color: '#1890ff', fontWeight: 600 }}>
            {dayjs(val).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: 'Số Giờ Đăng Ký',
      dataIndex: 'plannedHours',
      width: 130,
      render: (val: any) => (
        <Tag
          color="orange"
          icon={<ClockCircleOutlined />}
          style={{ fontSize: 13, fontWeight: 'bold' }}
        >
          +{val}h
        </Tag>
      ),
    },
    {
      title: 'Loại Tăng Ca',
      dataIndex: 'otType',
      width: 150,
      render: (type: any) => {
        if (type === 'SUNDAY_200')
          return <Tag color="volcano">Chủ nhật (x200%)</Tag>;
        if (type === 'HOLIDAY_300')
          return <Tag color="red">Lễ tết (x300%)</Tag>;
        return <Tag color="gold">Ngày thường (x150%)</Tag>;
      },
    },
    {
      title: 'Trạng Thái Duyệt',
      dataIndex: 'approvalStatus',
      width: 140,
      render: (status: any) => {
        if (status === 'APPROVED')
          return (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Đã duyệt
            </Tag>
          );
        if (status === 'REJECTED')
          return (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              Từ chối
            </Tag>
          );
        return (
          <Tag color="warning" icon={<HourglassOutlined />}>
            Chờ duyệt
          </Tag>
        );
      },
    },
    {
      title: 'Lý do tăng ca',
      dataIndex: 'reason',
      width: 200,
      ellipsis: true,
    },
  ];

  const isFilteringDeleted = filterStatus === 0;

  return (
    <PageContainer title="OT Registration (Quản Lý & Đăng Ký Tăng Ca - Hansol HRM)">
      {/* 1. KHỐI THỐNG KÊ NHANH */}
      <Row gutter={16} style={{ marginBottom: 14 }}>
        <Col xs={24} sm={6}>
          <Card
            size="small"
            bordered={false}
            style={{ backgroundColor: '#fffbe6' }}
          >
            <Statistic
              title="Tổng số đơn tăng ca"
              value={stats.totalRegistrations}
              prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
              suffix="đơn"
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            size="small"
            bordered={false}
            style={{ backgroundColor: '#fcffe6' }}
          >
            <Statistic
              title="Tổng giờ OT đăng ký"
              value={stats.totalPlannedHours}
              precision={1}
              prefix={<ClockCircleOutlined style={{ color: '#7cb305' }} />}
              suffix="giờ"
              valueStyle={{ color: '#7cb305', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            size="small"
            bordered={false}
            style={{ backgroundColor: '#f6ffed' }}
          >
            <Statistic
              title="Đơn đã được duyệt"
              value={stats.approvedCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="đơn"
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            size="small"
            bordered={false}
            style={{ backgroundColor: '#fff1f0' }}
          >
            <Statistic
              title="Đơn đang chờ duyệt"
              value={stats.pendingCount}
              prefix={<HourglassOutlined style={{ color: '#faad14' }} />}
              suffix="đơn"
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 2. BỘ LỌC TÌM KIẾM */}
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
            <span style={{ fontWeight: 500, minWidth: 65 }}>Xét duyệt:</span>
            <Select
              placeholder="Tất cả trạng thái"
              style={{ width: '100%' }}
              value={filterApprovalStatus}
              onChange={setFilterApprovalStatus}
              allowClear
              options={[
                { label: '⏳ Chờ duyệt (Pending)', value: 'PENDING' },
                { label: '✅ Đã duyệt (Approved)', value: 'APPROVED' },
                { label: '❌ Từ chối (Rejected)', value: 'REJECTED' },
              ]}
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Chu kỳ:</span>
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
      </TableFilterCard>

      {/* 3. BẢNG DỮ LIỆU */}
      <Card size="small">
        <BaseTable<OtRegistrationItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="registrationId"
          search={false}
          queryFile="WorkHours/OtRegistration/OtRegistrationQueries"
          queryKey="GetPagedOtRegistrations"
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
                addText="Đăng ký Tăng ca"
                selectedCount={selectedRowKeys.length}
                extraButtons={
                  <Space>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      disabled={selectedRowKeys.length === 0}
                      onClick={handleApproveBatch}
                      style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                      }}
                    >
                      Duyệt OT ({selectedRowKeys.length})
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      disabled={selectedRowKeys.length === 0}
                      onClick={handleRejectBatch}
                    >
                      Từ chối ({selectedRowKeys.length})
                    </Button>
                  </Space>
                }
              />
            ),
          ]}
          request={async (params) => {
            const res = await request<any>('/api/ot-registration', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword,
                userGroup: filterUserGroup,
                approvalStatus: filterApprovalStatus,
                otType: filterOtType,
                status: filterStatus,
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

      {/* 4. MODAL CHI TIẾT ĐƠN */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <span>
              Chi tiết Đơn Đăng Ký Tăng Ca #{detailRecord?.registrationId}
            </span>
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
        width={650}
      >
        {detailRecord && (
          <Descriptions
            bordered
            column={2}
            size="small"
            style={{ marginTop: 12 }}
          >
            <Descriptions.Item label="Mã nhân viên" span={1}>
              <b style={{ color: '#1890ff' }}>{detailRecord.userCode}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Họ và Tên" span={1}>
              {detailRecord.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Bộ phận / Chuyền" span={1}>
              <Tag color="blue">{detailRecord.userGroup}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tăng ca" span={1}>
              <b>{detailRecord.workDate}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Ca làm việc" span={1}>
              <Tag color="cyan">{detailRecord.shiftName || 'Ca Ngày'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số giờ đăng ký" span={1}>
              <b style={{ color: '#fa8c16' }}>+{detailRecord.plannedHours}h</b>
            </Descriptions.Item>
            <Descriptions.Item label="Khung giờ OT dự kiến" span={2}>
              {detailRecord.plannedStartTime} $\rightarrow${' '}
              {detailRecord.plannedEndTime}
            </Descriptions.Item>
            <Descriptions.Item label="Loại tăng ca" span={1}>
              {detailRecord.otType}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái phê duyệt" span={1}>
              <Tag
                color={
                  detailRecord.approvalStatus === 'APPROVED'
                    ? 'green'
                    : detailRecord.approvalStatus === 'REJECTED'
                    ? 'red'
                    : 'gold'
                }
              >
                {detailRecord.approvalStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Người phê duyệt" span={1}>
              {detailRecord.approvedBy || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian duyệt" span={1}>
              {detailRecord.approvedAt || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do đăng ký" span={2}>
              {detailRecord.reason || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 5. MODAL ĐĂNG KÝ / SỬA ĐƠN OT */}
      <OtModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        type={modalType}
        currentRow={currentRow}
        userGroupOptions={userGroupOptions}
        onFinish={handleSaveOt}
      />
    </PageContainer>
  );
};

export default OtRegistration;
