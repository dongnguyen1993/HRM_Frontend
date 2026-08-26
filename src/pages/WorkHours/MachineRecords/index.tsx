import { BaseTable } from '@/components/BaseTable';
import { TableActionBar } from '@/components/TableActionBar';
import { TableFilterCard } from '@/components/TableFilterCard';
import {
  DownloadOutlined,
  EyeOutlined,
  SyncOutlined,
  UndoOutlined,
  UploadOutlined,
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
  message,
  Modal,
  Select,
  Space,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import BioStarSyncModal from './components/BioStarSyncModal';
import ImportModal from './components/ImportModal';
import RecordModal from './components/RecordModal';
import { useMachineRecords } from './hooks/useMachineRecords';
import * as recordService from './service';
import type { MachineRecordItem } from './types';

const { RangePicker } = DatePicker;

export const MachineRecords: React.FC = () => {
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
    filterUserGroup,
    setFilterUserGroup,
    filterDeviceName,
    setFilterDeviceName,
    dateRange,
    setDateRange,
    userGroupOptions,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    modalType,
    currentRow,
    handleAdd,
    handleEdit,
    handleOpenImportModal,
    handleSaveRecord,
    handleBulkDelete,
    handleSearch,
    handleReset,
  } = useMachineRecords();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<MachineRecordItem | null>(
    null,
  );
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  // XỬ LÝ ĐỒNG BỘ TRỰC TIẾP BIOSTAR 2
  const handleExecuteSyncBioStar = async (values: any) => {
    try {
      message.loading({
        content: 'Đang kết nối BioStar 2 và đồng bộ dữ liệu...',
        key: 'sync',
      });
      const res = await recordService.syncBioStar(values);
      if (res && res.isSuccess) {
        message.success({
          content: res.message || 'Đồng bộ BioStar 2 thành công!',
          key: 'sync',
        });
        setSyncModalOpen(false);
        tableRef.current?.reload();
        return true;
      }
      message.error({
        content: res?.message || 'Đồng bộ thất bại!',
        key: 'sync',
      });
      return false;
    } catch (err: any) {
      message.error({
        content: err?.message || 'Lỗi kết nối máy chủ BioStar 2!',
        key: 'sync',
      });
      return false;
    }
  };

  // XUẤT TỆP CSV EXCEL
  const handleExportExcel = async () => {
    try {
      message.loading({ content: 'Đang trích xuất dữ liệu...', key: 'export' });
      const blob = await recordService.exportMachineRecordsExcel({
        searchKeyword,
        userGroup: filterUserGroup,
        deviceName: filterDeviceName,
        status: filterStatus,
        fromDate: dateRange ? dateRange[0] : undefined,
        toDate: dateRange ? dateRange[1] : undefined,
      });

      const url = window.URL.createObjectURL(new Blob([blob as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Hansol_MachineRecords_${dayjs().format('YYYYMMDD_HHmmss')}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success({ content: 'Xuất tệp thành công!', key: 'export' });
    } catch {
      message.error({ content: 'Lỗi khi xuất tệp dữ liệu!', key: 'export' });
    }
  };

  const columns: ProColumns<MachineRecordItem>[] = [
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
      title: 'Mã NV',
      dataIndex: 'userCode',
      width: 110,
      fixed: 'left',
      render: (text) => <b style={{ color: '#1890ff' }}>{text}</b>,
    },
    { title: 'Tên nhân viên', dataIndex: 'userName', width: 170 },
    {
      title: 'Bộ phận',
      dataIndex: 'userGroup',
      width: 130,
      render: (text: any) => (text ? <Tag color="blue">{text}</Tag> : '-'),
    },
    {
      title: 'Ngày quẹt',
      dataIndex: 'logDate',
      width: 110,
      render: (_, r) => dayjs(r.logTimestamp).format('YYYY-MM-DD'),
    },
    {
      title: 'Giờ quẹt',
      dataIndex: 'logTime',
      width: 100,
      render: (_, r) => (
        <span style={{ fontWeight: 600, color: '#00A651' }}>
          {dayjs(r.logTimestamp).format('HH:mm:ss')}
        </span>
      ),
    },
    { title: 'Thiết bị / Cổng', dataIndex: 'deviceName', width: 170 },
    {
      title: 'Mô tả sự kiện',
      dataIndex: 'eventDescription',
      width: 260,
      ellipsis: true,
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
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      width: 160,
      render: (val: any) =>
        val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
  ];

  const isFilteringDeleted = filterStatus === 0;

  return (
    <PageContainer title="Machine Records (Quản lý Dữ liệu Máy Chấm công Thô)">
      {/* 1. KHỐI BỘ LỌC TÌM KIẾM */}
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Tìm kiếm:</span>
            <Input
              placeholder="Mã NV, Tên NV..."
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
            <span style={{ fontWeight: 500, minWidth: 65 }}>Thiết bị:</span>
            <Input
              placeholder="Tên thiết bị (GATE...)"
              value={filterDeviceName}
              onChange={(e) => setFilterDeviceName(e.target.value)}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Thời gian:</span>
            <RangePicker
              style={{ width: '100%' }}
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
        <BaseTable<MachineRecordItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="recordId"
          search={false}
          queryFile="WorkHours/MachineRecords/MachineRecordsQueries"
          queryKey="GetPagedMachineRecords"
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
                addText="Thêm mới"
                selectedCount={selectedRowKeys.length}
                extraButtons={
                  <Space>
                    <Button
                      type="primary"
                      icon={<SyncOutlined />}
                      onClick={() => setSyncModalOpen(true)}
                      style={{ backgroundColor: '#1890ff' }}
                    >
                      Đồng bộ BioStar 2
                    </Button>
                    <Button
                      icon={<UploadOutlined />}
                      onClick={handleOpenImportModal}
                    >
                      Nạp CSV/Excel
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleExportExcel}
                    >
                      Xuất Excel
                    </Button>
                  </Space>
                }
              />
            ),
          ]}
          request={async (params) => {
            const res = await request<any>('/api/machine-records', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword,
                userGroup: filterUserGroup,
                deviceName: filterDeviceName,
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

      {/* 3. MODAL CHI TIẾT DÒNG */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết lượt quẹt thẻ #{detailRecord?.recordId}</span>
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
            <Descriptions.Item label="Họ tên" span={1}>
              {detailRecord.userName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Bộ phận" span={1}>
              <Tag color="blue">{detailRecord.userGroup || 'N/A'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={detailRecord.status === 1 ? 'green' : 'red'}>
                {detailRecord.status === 1 ? 'Hoạt động' : 'Đã xóa'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian quẹt" span={2}>
              <b style={{ color: '#00A651' }}>
                {dayjs(detailRecord.logTimestamp).format('YYYY-MM-DD HH:mm:ss')}
              </b>
            </Descriptions.Item>
            <Descriptions.Item label="Thiết bị / Cổng" span={2}>
              {detailRecord.deviceName}
            </Descriptions.Item>
            <Descriptions.Item label="Tên tệp nguồn (File Import)" span={2}>
              {detailRecord.fileNameImport ? (
                <Tag color="geekblue">{detailRecord.fileNameImport}</Tag>
              ) : (
                'Tạo thủ công'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả sự kiện" span={2}>
              {detailRecord.eventDescription || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Chuỗi thô (Raw String)" span={2}>
              <code>{detailRecord.rawUserString || '-'}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian tạo bản ghi" span={2}>
              {dayjs(detailRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 4. MODAL THÊM / SỬA */}
      <RecordModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        type={modalType}
        currentRow={currentRow}
        userGroupOptions={userGroupOptions}
        onFinish={handleSaveRecord}
      />

      {/* 5. MODAL NẠP TỆP CSV */}
      <ImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSuccess={() => tableRef.current?.reload()}
      />

      {/* 6. MODAL ĐỒNG BỘ BIOSTAR 2 */}
      <BioStarSyncModal
        open={syncModalOpen}
        onOpenChange={setSyncModalOpen}
        onFinish={handleExecuteSyncBioStar}
      />
    </PageContainer>
  );
};

export default MachineRecords;
