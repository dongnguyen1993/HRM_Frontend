import { BaseTable } from '@/components/BaseTable';
import { TableActionBar } from '@/components/TableActionBar';
import { TableFilterCard } from '@/components/TableFilterCard';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  HddOutlined,
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
import DeviceModal from './components/DeviceModal';
import { useDeviceSetup } from './hooks/useDeviceSetup';
import type { DeviceSetupItem } from './types';

export const DeviceSetup: React.FC = () => {
  const {
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    selectedRows,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterGroup,
    setFilterGroup,
    filterDirection,
    setFilterDirection,
    filterStatus,
    setFilterStatus,
    groupOptions,
    isModalOpen,
    setIsModalOpen,
    modalType,
    currentRow,
    handleAdd,
    handleEdit,
    handleSaveDevice,
    handleBulkDelete,
    handleSearch,
    handleReset,
  } = useDeviceSetup();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<DeviceSetupItem | null>(
    null,
  );

  const columns: ProColumns<DeviceSetupItem>[] = [
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
      title: 'Device ID',
      dataIndex: 'bioStarDeviceId',
      width: 120,
      fixed: 'left',
      render: (text) => <b style={{ color: '#1890ff' }}>{text}</b>,
    },
    {
      title: 'Tên Thiết Bị / Cổng',
      dataIndex: 'deviceName',
      width: 200,
      render: (text) => (
        <Space>
          <HddOutlined style={{ color: '#00A651' }} />
          <b>{text}</b>
        </Space>
      ),
    },
    {
      title: 'Nhóm Thiết Bị',
      dataIndex: 'deviceGroup',
      width: 180,
      render: (text: any) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Chiều Quẹt (Direction)',
      dataIndex: 'gateDirection',
      width: 160,
      render: (dir: any) => {
        if (dir === 'GATE_IN') return <Tag color="green">🟢 CỔNG VÀO (IN)</Tag>;
        if (dir === 'GATE_OUT')
          return <Tag color="volcano">🔴 CỔNG RA (OUT)</Tag>;
        if (dir === 'WORKSHOP') return <Tag color="purple">🟣 PHÂN XƯỞNG</Tag>;
        return <Tag color="geekblue">🔵 VĂN PHÒNG</Tag>;
      },
    },
    {
      title: 'Địa Chỉ IP',
      dataIndex: 'ipAddress',
      width: 140,
      render: (ip) => <code>{ip}</code>,
    },
    { title: 'Loại Thiết Bị', dataIndex: 'deviceType', width: 130 },
    {
      title: 'Trạng Thái Máy',
      dataIndex: 'deviceStatus',
      width: 130,
      render: (status: any) => (
        <Tag
          color={status === 'Normal' ? 'success' : 'error'}
          icon={
            status === 'Normal' ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {status === 'Normal' ? 'Hoạt động' : 'Mất kết nối'}
        </Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      width: 100,
      render: (status: any) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Active' : 'Đã xóa'}
        </Tag>
      ),
    },
  ];

  const isFilteringDeleted = filterStatus === 0;

  return (
    <PageContainer title="Device Setup (Cấu hình Thiết bị & Cổng Chấm Công - BioStar 2)">
      {/* 1. KHỐI BỘ LỌC TÌM KIẾM */}
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Tìm kiếm:</span>
            <Input
              placeholder="Tên cổng, Device ID, IP..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Nhóm:</span>
            <Select
              placeholder="Tất cả nhóm thiết bị"
              style={{ width: '100%' }}
              value={filterGroup}
              onChange={setFilterGroup}
              allowClear
              options={groupOptions.map((g) => ({ label: g, value: g }))}
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Chiều quẹt:</span>
            <Select
              placeholder="Tất cả chiều quẹt"
              style={{ width: '100%' }}
              value={filterDirection}
              onChange={setFilterDirection}
              allowClear
              options={[
                { label: '🟢 Cổng Vào (GATE_IN)', value: 'GATE_IN' },
                { label: '🔴 Cổng Ra (GATE_OUT)', value: 'GATE_OUT' },
                { label: '🟣 Phân Xưởng (WORKSHOP)', value: 'WORKSHOP' },
                { label: '🔵 Khối Văn Phòng (OFFICE)', value: 'OFFICE' },
                { label: '🟠 Nhà Ăn (CANTEEN)', value: 'CANTEEN' },
              ]}
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
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
        <BaseTable<DeviceSetupItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="deviceId"
          search={false}
          queryFile="WorkHours/DeviceSetup/DeviceSetupQueries"
          queryKey="GetPagedDevices"
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
                addText="Thêm Thiết Bị"
                selectedCount={selectedRowKeys.length}
              />
            ),
          ]}
          request={async (params) => {
            const res = await request<any>('/api/device-setup', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword,
                deviceGroup: filterGroup,
                gateDirection: filterDirection,
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

      {/* 3. MODAL CHI TIẾT THIẾT BỊ */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết Thiết Bị #{detailRecord?.bioStarDeviceId}</span>
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
            <Descriptions.Item label="Mã BioStar ID" span={1}>
              <b style={{ color: '#1890ff' }}>{detailRecord.bioStarDeviceId}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Tên thiết bị" span={1}>
              {detailRecord.deviceName}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm thiết bị" span={1}>
              <Tag color="blue">{detailRecord.deviceGroup}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Chiều quẹt" span={1}>
              <Tag color="purple">{detailRecord.gateDirection}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ IP" span={1}>
              <code>{detailRecord.ipAddress}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Cổng Port" span={1}>
              {detailRecord.port}
            </Descriptions.Item>
            <Descriptions.Item label="Loại máy" span={1}>
              {detailRecord.deviceType}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái kết nối" span={1}>
              <Tag
                color={detailRecord.deviceStatus === 'Normal' ? 'green' : 'red'}
              >
                {detailRecord.deviceStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {detailRecord.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 4. MODAL THÊM / SỬA */}
      <DeviceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        type={modalType}
        currentRow={currentRow}
        groupOptions={groupOptions}
        onFinish={handleSaveDevice}
      />
    </PageContainer>
  );
};

export default DeviceSetup;
