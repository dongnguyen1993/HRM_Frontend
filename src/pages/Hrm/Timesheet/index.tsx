import { BaseTable } from '@/components/BaseTable';
import { TableFilterCard } from '@/components/TableFilterCard';
import {
  ReloadOutlined,
  ThunderboltOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Modal,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { RawLogEditModal } from './components/RawLogEditModal';
import { useTimesheet } from './hooks/useTimesheet';
import { getRawDeviceLogs, getTimesheets } from './service';
import type { RawDeviceLogItem, TimesheetItem } from './types';

const { Text } = Typography;

export const TimesheetManagement: React.FC = () => {
  const {
    tableRef,
    activeTab,
    setActiveTab,
    searchKeyword,
    setSearchKeyword,
    filterUserGroup,
    setFilterUserGroup,
    filterDateRange,
    setFilterDateRange,
    userGroupOptions,
    calcModalVisible,
    setCalcModalVisible,
    calcDateRange,
    setCalcDateRange,
    calculating,
    csvModalVisible,
    setCsvModalVisible,
    csvFileList,
    setCsvFileList,
    uploading,
    handleSearch,
    handleReset,
    handleSyncBiostar,
    handleRunTimesheetEngine,
    handleImportCsv,
  } = useTimesheet();

  // State cho Modal Sửa Dữ Liệu Thô khi Double Click Row
  const [rawModalOpen, setRawModalOpen] = useState<boolean>(false);
  const [selectedTimesheetRow, setSelectedTimesheetRow] =
    useState<TimesheetItem | null>(null);
  const [clickedRowId, setClickedRowId] = useState<number | null>(null);
  const formatPunchTime = (timeStr?: string, workDateStr?: string) => {
    if (!timeStr) return <Text type="secondary">-</Text>;
    const punchObj = dayjs(timeStr);
    const formatted = punchObj.format('HH:mm');

    if (!workDateStr) return formatted;
    const diffDays = punchObj
      .startOf('day')
      .diff(dayjs(workDateStr).startOf('day'), 'day');

    if (diffDays > 0) {
      return (
        <Space size={4}>
          <b style={{ color: '#2f54eb' }}>{formatted}</b>
          <Tag
            color="purple"
            style={{
              fontSize: 10,
              margin: 0,
              padding: '0 4px',
              fontWeight: 'bold',
            }}
          >
            +{diffDays}
          </Tag>
        </Space>
      );
    }
    return <b>{formatted}</b>;
  };

  // YÊU CẦU 2: ĐÃ BỎ CỘT RÀ SOÁT VÀ CỘT THAO TÁC. NHÌN VÀO CỘT CÔNG ĐỂ BIẾT DÒNG LỖI!
  const timesheetColumns: ProColumns<TimesheetItem>[] = [
    { title: 'STT', valueType: 'index', width: 50, fixed: 'left' },
    {
      title: 'Mã NV',
      dataIndex: 'userCode',
      width: 110,
      fixed: 'left',
      sorter: (a, b) => a.userCode.localeCompare(b.userCode),
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      width: 170,
      sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
    },
    {
      title: 'Nhóm',
      dataIndex: 'userGroup',
      width: 110,
      render: (g: string) =>
        g ? <Tag color="blue">{g}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Ngày Làm Việc',
      dataIndex: 'workDate',
      valueType: 'date',
      width: 120,
      sorter: (a, b) =>
        new Date(a.workDate).getTime() - new Date(b.workDate).getTime(),
    },
    { title: 'Ca Áp Dụng', dataIndex: 'shiftName', width: 190 },
    {
      title: 'Giờ Vào',
      dataIndex: 'checkInTime',
      width: 110,
      render: (_, record) =>
        formatPunchTime(record.checkInTime, record.workDate),
    },
    {
      title: 'Giờ Ra',
      dataIndex: 'checkOutTime',
      width: 110,
      render: (_, record) =>
        formatPunchTime(record.checkOutTime, record.workDate),
    },
    // NHÌN VÀO CỘT CÔNG MÀU ĐỎ ĐỂ BIẾT DÒNG CẦN RÀ SOÁT (0 CÔNG)
    {
      title: 'Công',
      dataIndex: 'workUnits',
      width: 100,
      sorter: (a, b) => a.workUnits - b.workUnits,
      render: (u: number) => {
        if (u === 1.0)
          return (
            <Tag color="success" style={{ fontWeight: 'bold' }}>
              9.6h công
            </Tag>
          );
        if (u === 0.5)
          return (
            <Tag color="warning" style={{ fontWeight: 'bold' }}>
              4.8h công
            </Tag>
          );
        return (
          <Tag color="error" style={{ fontWeight: 'bold' }}>
            0 công
          </Tag>
        );
      },
    },
    {
      title: 'Giờ OT',
      dataIndex: 'otHours',
      width: 90,
      render: (ot: number) =>
        ot > 0 ? (
          <Tag color="processing">+{ot}h OT</Tag>
        ) : (
          <Text type="secondary">0h</Text>
        ),
    },
    {
      title: 'Lý Do Cảnh Báo / Ghi Chú',
      dataIndex: 'warningReason',
      width: 250,
    },
  ];

  const rawLogColumns: ProColumns<RawDeviceLogItem>[] = [
    { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
    {
      title: 'Thời Gian Quẹt',
      dataIndex: 'logTimestamp',
      valueType: 'dateTime',
      width: 160,
      fixed: 'left',
    },
    { title: 'Mã NV', dataIndex: 'userCode', width: 110 },
    { title: 'Tên Nhân Viên', dataIndex: 'userName', width: 180 },
    { title: 'Nhóm', dataIndex: 'userGroup', width: 130 },
    { title: 'Tên Thiết Bị', dataIndex: 'deviceName', width: 200 },
    { title: 'Mô Tả Sự Kiện', dataIndex: 'eventDescription', width: 250 },
  ];

  return (
    <PageContainer
      header={{
        title: 'Timesheet Management (Bảng Chấm Công Tổng Hợp)',
        extra: [
          <Space key="header-actions">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleSyncBiostar}
            >
              🔄 ĐỒNG BỘ SUPREMA BIOSTAR 2
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setCsvModalVisible(true)}
              style={{ backgroundColor: '#00A651', color: '#fff' }}
            >
              📥 NHẬP FILE MÁY CHẤM CÔNG (CSV)
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => setCalcModalVisible(true)}
              style={{ backgroundColor: '#faad14' }}
            >
              ⚡ CHẠY TÍNH CÔNG TỰ ĐỘNG
            </Button>
          </Space>,
        ],
      }}
    >
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span>Tìm kiếm:</span>
            <Input
              placeholder="Mã NV, Họ tên..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span>Nhóm User:</span>
            <Select
              placeholder="Tất cả Nhóm"
              style={{ width: '100%' }}
              value={filterUserGroup}
              onChange={setFilterUserGroup}
              allowClear
              options={userGroupOptions.map((g) => ({ label: g, value: g }))}
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span>Thời gian:</span>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={filterDateRange}
              onChange={setFilterDateRange}
            />
          </Space>
        </Col>
      </TableFilterCard>

      <Card size="small">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'timesheet',
              label: '📋 Bảng Chấm Công Tổng Hợp',
              children: (
                <BaseTable<TimesheetItem>
                  actionRef={tableRef}
                  columns={timesheetColumns}
                  rowKey="logId"
                  search={false}
                  params={{ searchKeyword, filterUserGroup, filterDateRange }}
                  queryFile="Hrm/TimesheetQueries"
                  queryKey="GetPagedTimesheets"
                  // YÊU CẦU 3: BẤM DOUBLE CLICK VÀO DÒNG ĐỂ MỞ MODAL SỬA DỮ LIỆU THÔ
                  onRow={(record) => ({
                    onClick: () => {
                      setClickedRowId(record.logId); // Tô màu hàng khi nhấp đơn
                    },
                    onDoubleClick: () => {
                      setSelectedTimesheetRow(record);
                      setRawModalOpen(true);
                    },
                  })}
                  rowClassName={(record) => {
                    if (record.logId === clickedRowId) {
                      return 'bg-blue-100 font-medium border-l-4 border-blue-500 cursor-pointer'; // Hàng đang chọn
                    }
                    if (record.workUnits === 0) {
                      return 'bg-red-50 cursor-pointer'; // Hàng bị lỗi công
                    }
                    return 'cursor-pointer hover:bg-gray-50';
                  }}
                  request={async (params) => {
                    const queryParams: Record<string, any> = {
                      pageNumber: params.current,
                      pageSize: params.pageSize,
                      searchKeyword,
                      userGroup: filterUserGroup || '',
                    };
                    if (filterDateRange && filterDateRange.length === 2) {
                      queryParams.fromDate =
                        filterDateRange[0].format('YYYY-MM-DD');
                      queryParams.toDate =
                        filterDateRange[1].format('YYYY-MM-DD');
                    }
                    const res = await getTimesheets(queryParams);
                    return {
                      data: res.data || [],
                      success: res.isSuccess,
                      total: res.totalRecords,
                    };
                  }}
                  pagination={{ pageSize: 15 }}
                />
              ),
            },
            {
              key: 'rawlogs',
              label: '🗄️ Dữ Liệu Quẹt Thẻ Thô (Raw Logs)',
              children: (
                <BaseTable<RawDeviceLogItem>
                  actionRef={tableRef}
                  columns={rawLogColumns}
                  rowKey="rawLogId"
                  search={false}
                  params={{ searchKeyword, filterUserGroup, filterDateRange }}
                  queryFile="Hrm/TimesheetQueries"
                  queryKey="GetPagedRawDeviceLogs"
                  request={async (params) => {
                    const queryParams: Record<string, any> = {
                      pageNumber: params.current,
                      pageSize: params.pageSize,
                      searchKeyword,
                      userGroup: filterUserGroup || '',
                    };
                    if (filterDateRange && filterDateRange.length === 2) {
                      queryParams.fromDate =
                        filterDateRange[0].format('YYYY-MM-DD');
                      queryParams.toDate =
                        filterDateRange[1].format('YYYY-MM-DD');
                    }
                    const res = await getRawDeviceLogs(queryParams);
                    return {
                      data: res.data || [],
                      success: res.isSuccess,
                      total: res.totalRecords,
                    };
                  }}
                  pagination={{ pageSize: 15 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* YÊU CẦU 3: MODAL SỬA DỮ LIỆU THÔ & TÍNH LẠI CÔNG CHO 1 NV ĐÓ NGHƯ DOUBLE CLICK ROW */}
      <RawLogEditModal
        open={rawModalOpen}
        record={selectedTimesheetRow}
        onCancel={() => setRawModalOpen(false)}
        onSuccess={() => tableRef.current?.reload()}
      />

      {/* CÁC MODAL KHÁC GIỮ NGUYÊN */}
      <Modal
        title="⚡ Bộ Máy Tính Công Tự Động"
        open={calcModalVisible}
        onOk={handleRunTimesheetEngine}
        confirmLoading={calculating}
        onCancel={() => setCalcModalVisible(false)}
      >
        <DatePicker.RangePicker
          style={{ width: '100%', marginTop: 8 }}
          value={calcDateRange}
          onChange={setCalcDateRange}
        />
      </Modal>

      <Modal
        title="📥 Nhập Tệp Dữ Liệu Máy Chấm Công (CSV)"
        open={csvModalVisible}
        onOk={handleImportCsv}
        confirmLoading={uploading}
        onCancel={() => setCsvModalVisible(false)}
      >
        <Upload.Dragger
          maxCount={1}
          fileList={csvFileList}
          beforeUpload={(file) => {
            setCsvFileList([
              {
                uid: file.uid,
                name: file.name,
                status: 'done',
                originFileObj: file,
              },
            ]);
            return false;
          }}
        >
          <p className="ant-upload-text">Kéo thả tệp CSV vào đây</p>
        </Upload.Dragger>
      </Modal>
    </PageContainer>
  );
};

export default TimesheetManagement;
