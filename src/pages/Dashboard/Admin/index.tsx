import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined,
  LockOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserAddOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import React from 'react';
import { useAdminDashboard } from './hooks/useAdminDashboard';

const { Text, Title } = Typography;

export const AdminDashboard: React.FC = () => {
  const {
    data,
    loading,
    navigateToUsers,
    navigateToPermissions,
    navigateToAuditLogs,
  } = useAdminDashboard();

  return (
    <PageContainer title="Welcome Analytics (Bảng Điều Khiển Quản Trị)">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        
        {/* KHU VỰC 1: HÀNG THẺ THỐNG KÊ TỔNG QUAN (TOP CORE METRICS) */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" loading={loading} style={{ borderLeft: '4px solid #00AEEF' }}>
              <Statistic
                title={<Text type="secondary"><TeamOutlined /> Tổng số Nhân sự</Text>}
                value={data?.totalUsers || 0}
                suffix={
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    <RiseOutlined /> {data?.usersGrowth || '+12%'}
                  </Tag>
                }
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                So với tháng trước (33 Active)
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card size="small" loading={loading} style={{ borderLeft: '4px solid #52c41a' }}>
              <Statistic
                title={<Text type="secondary"><UserAddOutlined /> Mới Onboarding tháng này</Text>}
                value={data?.newUsersThisMonth || 0}
                valueStyle={{ color: '#52c41a' }}
                suffix={<Text type="secondary" style={{ fontSize: 13 }}>nhân viên</Text>}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tuyển mới & Thử việc
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card size="small" loading={loading} style={{ borderLeft: '4px solid #1890ff' }}>
              <Statistic
                title={<Text type="secondary"><CheckCircleOutlined /> Tỉ lệ đi làm hôm nay</Text>}
                value={data?.attendanceRate || 96.5}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress percent={data?.attendanceRate || 96.5} showInfo={false} strokeColor="#1890ff" size="small" />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card size="small" loading={loading} style={{ borderLeft: '4px solid #faad14' }}>
              <Statistic
                title={<Text type="secondary"><FieldTimeOutlined /> Yêu cầu chờ duyệt</Text>}
                value={data?.pendingRequests || 0}
                valueStyle={{ color: '#faad14' }}
                suffix={<Tag color="warning">Cần xử lý</Tag>}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Đơn nghỉ phép, Tăng ca, Chấm công
              </Text>
            </Card>
          </Col>
        </Row>

        {/* KHU VỰC 2: HÀNG BIỂU ĐỒ XU HƯỚNG MẬT ĐỘ NHÂN SỰ (ANALYTICS CHARTS) */}
        <Row gutter={[16, 16]}>
          {/* CỘT TRÁI (60%): Xu hướng tuyển mới / nghỉ việc các tháng */}
          <Col xs={24} lg={14}>
            <Card size="small" title="📊 Xu hướng Luân chuyển Nhân sự (Turnover Trend)" loading={loading}>
              <div style={{ padding: '8px 0' }}>
                <Row gutter={[16, 16]}>
                  {(data?.turnoverTrend || []).map((item, idx) => (
                    <Col span={3} key={idx} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 'bold' }}>{item.month}</div>
                      <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, margin: '8px 0' }}>
                        <div
                          title={`Tuyển mới: ${item.newHires}`}
                          style={{
                            height: `${item.newHires * 6}px`,
                            width: 8,
                            backgroundColor: '#52c41a',
                            borderRadius: '2px 2px 0 0',
                          }}
                        />
                        <div
                          title={`Nghỉ việc: ${item.resignations}`}
                          style={{
                            height: `${item.resignations * 6}px`,
                            width: 8,
                            backgroundColor: '#ff4d4f',
                            borderRadius: '2px 2px 0 0',
                          }}
                        />
                      </div>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        +{item.newHires} | -{item.resignations}
                      </Text>
                    </Col>
                  ))}
                </Row>
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <Space size="large">
                    <span><Badge color="#52c41a" text="Tuyển mới (New Hires)" /></span>
                    <span><Badge color="#ff4d4f" text="Nghỉ việc (Resignations)" /></span>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>

          {/* CỘT PHẢI (40%): Phân bổ nhân sự theo Nhà máy / Khối */}
          <Col xs={24} lg={10}>
            <Card size="small" title="🍩 Cơ cấu Phân bổ Nhân sự theo Nhà máy" loading={loading}>
              <div className="space-y-4 py-2">
                {(data?.plantDistribution || []).map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{item.plant}</span>
                      <span className="font-bold">{item.count} nhân viên ({item.percent}%)</span>
                    </div>
                    <Progress
                      percent={item.percent}
                      strokeColor={idx === 0 ? '#00AEEF' : '#00A651'}
                      status="active"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* KHU VỰC 3: GIÁM SÁT TRỰC QUAN & AN NINH HỆ THỐNG (MONITORING & SECURITY) */}
        <Row gutter={[16, 16]}>
          {/* TRÁI: Tần suất tải API hệ thống */}
          <Col xs={24} lg={12}>
            <Card size="small" title="📈 Giám sát Tải & Tần suất Hoạt động Hệ thống (API Load)" loading={loading}>
              <div className="py-2">
                <Row gutter={8} align="bottom" style={{ height: 120 }}>
                  {(data?.activityData || []).map((act, idx) => (
                    <Col span={4} key={idx} style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          height: `${act.load}px`,
                          backgroundColor: act.load > 80 ? '#ff4d4f' : '#00AEEF',
                          borderRadius: '4px 4px 0 0',
                          margin: '0 auto',
                          width: '60%',
                        }}
                      />
                      <div style={{ fontSize: 11, marginTop: 4 }}>{act.time}</div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Card>
          </Col>

          {/* PHẢI: Lịch sử 5 thao tác dữ liệu nhạy cảm gần nhất */}
          <Col xs={24} lg={12}>
            <Card
              size="small"
              title="🛡️ Lịch sử 5 Thao tác An ninh Gần nhất (Audit Log Quick View)"
              extra={<a onClick={navigateToAuditLogs}>Xem tất cả</a>}
              loading={loading}
            >
              <Table
                size="small"
                pagination={false}
                dataSource={data?.recentAuditLogs || []}
                rowKey="logId"
                columns={[
                  { title: 'User', dataIndex: 'operatorCode', width: 90 },
                  {
                    title: 'Action',
                    dataIndex: 'action',
                    width: 100,
                    render: (act: string) => {
                      let color = 'blue';
                      if (act?.includes('DELETE')) color = 'red';
                      if (act?.includes('UPDATE')) color = 'orange';
                      if (act?.includes('POST')) color = 'green';
                      return <Tag color={color}>{act}</Tag>;
                    },
                  },
                  { title: 'Endpoint / Path', dataIndex: 'tableName' },
                ]}
              />
            </Card>
          </Col>
        </Row>

        {/* KHU VỰC 4: TIỆN ÍCH HÀNH ĐỘNG NHANH DÀNH CHO ADMIN (QUICK ACTIONS) */}
        <Card size="small" title="⚡ Tiện ích Thao tác Nhanh (Admin Quick Shortcuts)">
          <Space wrap size="middle">
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={navigateToUsers}
              style={{ backgroundColor: '#00AEEF', borderColor: '#00AEEF' }}
            >
              + Thêm nhanh Nhân viên
            </Button>

            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={navigateToPermissions}
              style={{ backgroundColor: '#00A651', borderColor: '#00A651' }}
            >
              Phân quyền Ma trận (Permission Mapping)
            </Button>

            <Button
              icon={<ClockCircleOutlined />}
              onClick={navigateToAuditLogs}
            >
              Nhật ký Thao tác (Audit Logs)
            </Button>
          </Space>
        </Card>

      </Space>
    </PageContainer>
  );
};

export default AdminDashboard;