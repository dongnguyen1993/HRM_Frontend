import { BaseTable } from '@/components/BaseTable';
import { TableFilterCard } from '@/components/TableFilterCard';
import {
  BarChartOutlined,
  DownloadOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FireOutlined,
  TableOutlined,
  TeamOutlined,
  TrophyOutlined,
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
  Row,
  Select,
  Space,
  Statistic,
  Tabs,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import EmployeeDetailDrawer from './components/EmployeeDetailDrawer';
import { MonthlyMatrixTab } from './components/MonthlyMatrixTable';
import { useWorkTimeReport } from './hooks/useWorkTimeReport';
import * as reportService from './service';
import type { MonthlyMatrixRow, WorkTimeReportItem } from './types';

const { RangePicker } = DatePicker;

export const WorkTimeReport: React.FC = () => {
  const {
    tableRef,
    searchKeyword,
    setSearchKeyword,
    filterUserGroup,
    setFilterUserGroup,
    dateRange,
    setDateRange,
    userGroupOptions,
    stats,
    selectedUserCode,
    selectedUserName,
    drawerOpen,
    setDrawerOpen,
    handleSearch,
    handleReset,
    handleOpenDetail,
    handleExportExcel,
  } = useWorkTimeReport();

  const [activeTab, setActiveTab] = useState<string>('summary');
  const [matrixData, setMatrixData] = useState<MonthlyMatrixRow[]>([]);
  const [matrixLoading, setMatrixLoading] = useState<boolean>(false);

  // TẢI DỮ LIỆU MA TRẬN KHI CHUYỂN SANG TAB MA TRẬN
  const fetchMatrixData = async () => {
    setMatrixLoading(true);
    try {
      const res = await reportService.getMonthlyMatrix({
        searchKeyword,
        userGroup: filterUserGroup,
        fromDate: dateRange ? dateRange[0] : undefined,
        toDate: dateRange ? dateRange[1] : undefined,
      });
      if (res && res.isSuccess) {
        setMatrixData(res.data || []);
      }
    } catch {
    } finally {
      setMatrixLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'matrix') {
      fetchMatrixData();
    }
  }, [activeTab, searchKeyword, filterUserGroup, dateRange]);

  const summaryColumns: ProColumns<WorkTimeReportItem>[] = [
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
            onClick={() => handleOpenDetail(record.userCode, record.fullName)}
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
      render: (text, r) => (
        <Button
          type="link"
          size="small"
          style={{ padding: 0, fontWeight: 'bold' }}
          onClick={() => handleOpenDetail(r.userCode, r.fullName)}
        >
          {text}
        </Button>
      ),
    },
    { title: 'Họ và Tên', dataIndex: 'fullName', width: 170, fixed: 'left' },
    {
      title: 'Bộ phận',
      dataIndex: 'userGroup',
      width: 130,
      render: (text: any) => (text ? <Tag color="blue">{text}</Tag> : '-'),
    },
    {
      title: 'Số Ngày Làm',
      dataIndex: 'totalWorkingDays',
      width: 115,
      render: (val: any) => <b>{val} ngày</b>,
    },
    {
      title: 'Tổng Công (9.6h)',
      dataIndex: 'totalWorkUnits',
      width: 130,
      render: (val: any) => (
        <Tag color="green" style={{ fontSize: 13, fontWeight: 'bold' }}>
          {val} công
        </Tag>
      ),
    },
    {
      title: 'Giờ Chuẩn (h)',
      dataIndex: 'totalStandardHours',
      width: 120,
      render: (val: any) => <span>{val}h</span>,
    },
    {
      title: 'Tăng Ca OT (h)',
      dataIndex: 'totalOtHours',
      width: 125,
      render: (val: any) => (
        <Tag
          color={val > 0 ? 'orange' : 'default'}
          style={{ fontSize: 13, fontWeight: 'bold' }}
        >
          +{val}h OT
        </Tag>
      ),
    },
    {
      title: 'Tổng Giờ Làm (h)',
      dataIndex: 'totalCombinedHours',
      width: 140,
      render: (val: any) => (
        <b style={{ color: '#00A651', fontSize: 14 }}>{val} giờ</b>
      ),
    },
    {
      title: 'Ca Ngày / Ca Đêm',
      width: 150,
      render: (_, r) => (
        <Space size={4}>
          <Tag color="cyan">{r.totalDayShifts}N</Tag>
          <Tag color="magenta">{r.totalNightShifts}Đ</Tag>
        </Space>
      ),
    },
    {
      title: 'Lỗi / Cờ đỏ',
      dataIndex: 'warningCount',
      width: 100,
      render: (val: any) =>
        val > 0 ? (
          <Tag color="error">{val} lỗi</Tag>
        ) : (
          <Tag color="success">0</Tag>
        ),
    },
    {
      title: 'Chi tiết',
      valueType: 'option',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleOpenDetail(record.userCode, record.fullName)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <PageContainer title="Work Time Report (Báo Cáo Thời Gian Làm Việc & Bảng Chấm Công Ma Trận)">
      {/* 1. KHỐI BỘ LỌC DÙNG CHUNG CHO CẢ 2 TAB */}
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={8}>
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

        <Col xs={24} sm={12} md={8}>
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

        <Col xs={24} sm={12} md={8}>
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

      {/* 2. TAB VIEW ĐA NĂNG */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginTop: 8 }}
        items={[
          {
            key: 'summary',
            label: (
              <span>
                <BarChartOutlined /> 📊 Báo Cáo Tổng Hợp Theo Bộ Phận
              </span>
            ),
            children: (
              <>
                {/* THẺ THỐNG KÊ TỔNG QUAN */}
                <Row gutter={16} style={{ marginBottom: 14 }}>
                  <Col xs={24} sm={6}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ backgroundColor: '#e6f7ff' }}
                    >
                      <Statistic
                        title="Tổng nhân sự tham gia"
                        value={stats.totalEmployees}
                        prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                        suffix="người"
                        valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
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
                        title="Tổng công tích lũy"
                        value={stats.totalWorkUnits}
                        precision={1}
                        prefix={<TrophyOutlined style={{ color: '#00A651' }} />}
                        suffix="công"
                        valueStyle={{ color: '#00A651', fontWeight: 'bold' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ backgroundColor: '#fffbe6' }}
                    >
                      <Statistic
                        title="Tổng giờ tăng ca (OT)"
                        value={stats.totalOtHours}
                        precision={1}
                        prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
                        suffix="giờ OT"
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
                        title="Tổng giờ làm việc thực tế"
                        value={stats.totalCombinedHours}
                        precision={1}
                        prefix={
                          <FieldTimeOutlined style={{ color: '#7cb305' }} />
                        }
                        suffix="giờ"
                        valueStyle={{ color: '#7cb305', fontWeight: 'bold' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* BẢNG TỔNG HỢP */}
                <Card size="small">
                  <BaseTable<WorkTimeReportItem>
                    actionRef={tableRef}
                    columns={summaryColumns}
                    rowKey="userCode"
                    search={false}
                    queryFile="WorkHours/WorkTimeReport/WorkTimeReportQueries"
                    queryKey="GetPagedWorkTimeReport"
                    toolBarRender={() => [
                      <Button
                        key="export-excel"
                        icon={<DownloadOutlined />}
                        onClick={handleExportExcel}
                        style={{ fontWeight: 500 }}
                      >
                        Xuất Báo Cáo Excel
                      </Button>,
                    ]}
                    request={async (params) => {
                      const res = await request<any>('/api/work-time-report', {
                        method: 'GET',
                        params: {
                          pageNumber: params.current,
                          pageSize: params.pageSize,
                          searchKeyword,
                          userGroup: filterUserGroup,
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
              </>
            ),
          },
          {
            key: 'matrix',
            label: (
              <span>
                <TableOutlined /> 📑 Bảng Chấm Công Ma Trận 31 Ngày (Hansol
                Official Matrix)
              </span>
            ),
            children: (
              <MonthlyMatrixTab
                loading={matrixLoading}
                dataSource={matrixData}
                dateRange={
                  dateRange || [
                    dayjs().format('YYYY-MM-DD'),
                    dayjs().format('YYYY-MM-DD'),
                  ]
                }
                onExportExcel={handleExportExcel}
              />
            ),
          },
        ]}
      />

      {/* 3. DRAWER XEM CHI TIẾT TỪNG NGÀY TRONG THÁNG */}
      <EmployeeDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userCode={selectedUserCode}
        userName={selectedUserName}
        dateRange={dateRange}
      />
    </PageContainer>
  );
};

export default WorkTimeReport;
