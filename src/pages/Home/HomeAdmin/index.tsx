import { Area, Column, Pie } from '@ant-design/charts';
import {
  AppstoreAddOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  HistoryOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SettingOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
// Đã bổ sung đầy đủ Button vào lệnh import này
import {
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import * as adminService from './service';
import type { AdminDashboardOverview } from './types';

export const HomeAdmin: React.FC = () => {
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAdminDashboardOverview().then((res) => {
      if (res && res.isSuccess) {
        setData(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <PageContainer title="Welcome Analytics (Bảng Điều Khiển Quản Trị Hansol HRM)">
      {/* 1. KHỐI 4 THẺ KPI ĐẦU TRANG */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" loading={loading} bordered={false}>
            <Statistic
              title="Tổng số Nhân sự"
              value={data?.kpiStats.totalEmployees || 0}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              Nhân viên đang làm việc (Active)
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" loading={loading} bordered={false}>
            <Statistic
              title="Mới Onboarding tháng này"
              value={data?.kpiStats.newHiresThisMonth || 0}
              prefix={<UserAddOutlined style={{ color: '#00A651' }} />}
              suffix="người"
              valueStyle={{ color: '#00A651', fontWeight: 'bold' }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              Đã ký hợp đồng & Thử việc
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" loading={loading} bordered={false}>
            <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>
              <ClockCircleOutlined style={{ marginRight: 6 }} />
              Tỉ lệ đi làm hôm nay
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
              {data?.kpiStats.attendanceRateToday || 0} %
            </div>
            <Progress
              percent={data?.kpiStats.attendanceRateToday || 0}
              strokeColor="#1890ff"
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" loading={loading} bordered={false}>
            <Statistic
              title="Yêu cầu chờ duyệt"
              value={data?.kpiStats.pendingRequests || 0}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
              suffix={<Tag color="warning">Cần xử lý</Tag>}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              Nghỉ phép, Tăng ca, Cờ đỏ chấm công
            </div>
          </Card>
        </Col>
      </Row>

      {/* 2. KHỐI BIỂU ĐỒ CHÍNH (SỬ DỤNG ANT DESIGN CHARTS) */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            size="small"
            loading={loading}
            title={
              <Space>
                <LineChartOutlined style={{ color: '#00A651' }} />
                <span>Xu hướng Luân chuyển Nhân sự (Turnover Trend)</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            {data?.turnoverTrend && data.turnoverTrend.length > 0 && (
              <Column
                data={data.turnoverTrend.flatMap((item) => [
                  {
                    month: item.monthLabel,
                    type: 'Tuyển mới',
                    value: item.newHires,
                  },
                  {
                    month: item.monthLabel,
                    type: 'Nghỉ việc',
                    value: item.resignations,
                  },
                ])}
                xField="month"
                yField="value"
                seriesField="type"
                isGroup={true}
                color={['#00A651', '#ff4d4f']}
                height={220}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            size="small"
            loading={loading}
            title={
              <Space>
                <PieChartOutlined style={{ color: '#fa8c16' }} />
                <span>Cơ cấu Phân bổ Nhân sự (Top 5 Bộ phận)</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            {data?.distribution && data.distribution.length > 0 && (
              <Pie
                data={data.distribution}
                angleField="employeeCount"
                colorField="groupName"
                radius={0.8}
                innerRadius={0.6}
                height={220}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 3. KHỐI LỊCH SỬ THAO TÁC & API LOAD */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            size="small"
            loading={loading}
            title={
              <Space>
                <DashboardOutlined style={{ color: '#1890ff' }} />
                <span>Tần suất Hoạt động API 7 ngày qua (API Load Trend)</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            {data?.apiLoad && data.apiLoad.length > 0 && (
              <Area
                data={data.apiLoad}
                xField="logDate"
                yField="totalRequests"
                color="#1890ff"
                areaStyle={{ fillOpacity: 0.3 }}
                height={200}
                smooth
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            size="small"
            loading={loading}
            title={
              <Space>
                <HistoryOutlined style={{ color: '#722ed1' }} />
                <span>
                  Lịch sử 5 Thao tác An ninh Gần nhất (Audit Log Quick View)
                </span>
              </Space>
            }
            extra={
              <a onClick={() => history.push('/system-mgmt/audit-logs')}>
                Xem tất cả
              </a>
            }
            style={{ height: '100%' }}
          >
            <Table
              size="small"
              dataSource={data?.recentAuditLogs || []}
              rowKey="logId"
              pagination={false}
              columns={[
                {
                  title: 'User',
                  dataIndex: 'operatorName',
                  width: 160,
                  ellipsis: true,
                },
                {
                  title: 'Hành động',
                  dataIndex: 'action',
                  width: 100,
                  render: (v) => <Tag color="blue">{v}</Tag>,
                },
                {
                  title: 'Endpoint / Table',
                  dataIndex: 'endpointPath',
                  ellipsis: true,
                },
                { title: 'Thời gian', dataIndex: 'createdAt', width: 140 },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 4. SHORTCUTS LỐI TẮT */}
      <Card
        size="small"
        title={
          <Space>
            <SettingOutlined style={{ color: '#faad14' }} />
            <span>Tiện ích Thao tác Nhanh (Admin Quick Shortcuts)</span>
          </Space>
        }
      >
        <Space size={16} wrap>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => history.push('/system-mgmt/user-management')}
          >
            Thêm nhanh Nhân viên
          </Button>
          <Button
            type="primary"
            icon={<AppstoreAddOutlined />}
            style={{ backgroundColor: '#00A651', borderColor: '#00A651' }}
            onClick={() => history.push('/system-mgmt/permission-mapping')}
          >
            Phân quyền Ma trận
          </Button>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => history.push('/system-mgmt/audit-logs')}
          >
            Nhật ký Thao tác (Audit Logs)
          </Button>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default HomeAdmin;
