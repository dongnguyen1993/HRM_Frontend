import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FormOutlined,
  HeartOutlined,
  HistoryOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Calendar,
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
import { useUserDashboard } from './hooks/useUserDashboard';

const { Text, Title } = Typography;

export const UserDashboard: React.FC = () => {
  const {
    data,
    loading,
    checkInLoading,
    currentTime,
    handleCheckIn,
    navigateToLeaveRequest,
    navigateToAccountSettings,
  } = useUserDashboard();

  return (
    <PageContainer title="Trang Cá Nhân (User Dashboard)">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* KHU VỰC 1: KHUNG CHÀO MỪNG & WIDGET CHẤM CÔNG THỜI GIAN THỰC */}
        <Row gutter={[16, 16]}>
          {/* THẺ XIN CHÀO BÊN TRÁI */}
          <Col xs={24} lg={15}>
            <Card
              size="small"
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #00AEEF 0%, #0072CE 100%)',
                color: '#fff',
                borderRadius: '8px',
              }}
            >
              <Row align="middle" gutter={16} style={{ padding: '8px 4px' }}>
                <Col>
                  <Avatar
                    size={72}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#fff', color: '#00AEEF' }}
                  />
                </Col>
                <Col flex="1">
                  <Title level={4} style={{ color: '#fff', margin: 0 }}>
                    Xin chào, {data?.fullName || 'Phạm Quang Hiếu'}! 👋
                  </Title>
                  <Text
                    style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}
                  >
                    Mã NV: <b>{data?.userCode || '1200839'}</b> | Nhà máy:{' '}
                    <b>{data?.plant || 'Technics H'}</b>
                  </Text>
                  <div style={{ marginTop: 6 }}>
                    <Tag color="cyan">
                      <HeartOutlined /> Chúc bạn một ngày làm việc hiệu quả và
                      tràn đầy năng lượng!
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* WIDGET CHẤM CÔNG VÀ ĐỒNG HỒ THỜI GIAN THỰC BÊN PHẢI */}
          <Col xs={24} lg={9}>
            <Card
              size="small"
              loading={loading}
              title={
                <Space>
                  <ClockCircleOutlined /> <b>Chấm Công Hôm Nay</b>
                </Space>
              }
              extra={<Tag color="blue">{currentTime || '08:00:00'}</Tag>}
            >
              <div style={{ textAlign: 'center', padding: '4px 0' }}>
                <Space size="large" style={{ marginBottom: 12 }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<LoginOutlined />}
                    loading={checkInLoading}
                    onClick={() => handleCheckIn('check-in')}
                    style={{
                      backgroundColor: '#00A651',
                      borderColor: '#00A651',
                      fontWeight: 'bold',
                    }}
                  >
                    CHECK-IN
                  </Button>
                  <Button
                    danger
                    size="large"
                    icon={<LogoutOutlined />}
                    loading={checkInLoading}
                    onClick={() => handleCheckIn('check-out')}
                    style={{ fontWeight: 'bold' }}
                  >
                    CHECK-OUT
                  </Button>
                </Space>

                <div style={{ fontSize: 12, color: '#666' }}>
                  {data?.checkInTime ? (
                    <Text type="success">
                      ✓ Đã Check-in lúc: <b>{data.checkInTime}</b>
                    </Text>
                  ) : (
                    <Text type="secondary">Chưa ghi nhận Check-in hôm nay</Text>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* KHU VỰC 2: HÀNG THẺ CHỈ SỐ CÁ NHÂN (PERSONAL METRICS) */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              loading={loading}
              style={{ borderTop: '3px solid #1890ff' }}
            >
              <Statistic
                title={
                  <Text type="secondary">
                    <CalendarOutlined /> Phép năm còn lại
                  </Text>
                }
                value={data?.remainingLeaveDays || 10.5}
                precision={1}
                suffix="ngày"
                valueStyle={{ color: '#1890ff' }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Tổng quy định: 12.0 ngày/năm
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card
              size="small"
              loading={loading}
              style={{ borderTop: '3px solid #faad14' }}
            >
              <Statistic
                title={
                  <Text type="secondary">
                    <HistoryOutlined /> Giờ OT đã duyệt (Tháng)
                  </Text>
                }
                value={data?.totalOtHoursThisMonth || 14.5}
                precision={1}
                suffix="giờ"
                valueStyle={{ color: '#faad14' }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Hạn mức tối đa: 40.0 giờ/tháng
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card
              size="small"
              loading={loading}
              style={{ borderTop: '3px solid #52c41a' }}
            >
              <Statistic
                title={
                  <Text type="secondary">
                    <CheckCircleOutlined /> Công chuẩn tích lũy
                  </Text>
                }
                value={data?.accumulatedWorkDays || 22.0}
                precision={1}
                suffix="công"
                valueStyle={{ color: '#52c41a' }}
              />
              <Progress
                percent={92}
                showInfo={false}
                strokeColor="#52c41a"
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* KHU VỰC 3: THỐNG KÊ & LỊCH CÁ NHÂN (TỈ LỆ 60% - 40%) */}
        <Row gutter={[16, 16]}>
          {/* CỘT TRÁI (60%): Biểu đồ Giờ làm việc tuần */}
          <Col xs={24} lg={14}>
            <Card
              size="small"
              title="📊 Giờ Làm Việc Thực Tế Tuần Này"
              loading={loading}
            >
              <div className="py-2">
                <Row gutter={12} align="bottom" style={{ height: 130 }}>
                  {(data?.weeklyWorkHours || []).map((item, idx) => (
                    <Col span={4} key={idx} style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          height: `${item.hours * 12}px`,
                          backgroundColor:
                            item.status === 'Punctual' ? '#00AEEF' : '#ff4d4f',
                          borderRadius: '4px 4px 0 0',
                          margin: '0 auto',
                          width: '60%',
                        }}
                      />
                      <div style={{ fontSize: 11, marginTop: 4 }}>
                        {item.day}
                      </div>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {item.hours}h
                      </Text>
                    </Col>
                  ))}
                </Row>
              </div>
            </Card>
          </Col>

          {/* CỘT PHẢI (40%): Khung Lịch Cá nhân thu gọn */}
          <Col xs={24} lg={10}>
            <Card
              size="small"
              title="📅 Lịch Chấm Công Cá Nhân"
              loading={loading}
            >
              <div style={{ padding: '0 8px' }}>
                <Calendar fullscreen={false} />
              </div>
            </Card>
          </Col>
        </Row>

        {/* KHU VỰC 4: BẢNG TIN CÔNG TY & TRẠNG THÁI ĐƠN TỪ CÁ NHÂN */}
        <Row gutter={[16, 16]}>
          {/* TRÁI: Bảng tin phòng HR */}
          <Col xs={24} lg={12}>
            <Card
              size="small"
              title="📢 Bảng Tin & Thông Báo Nội Bộ HR"
              loading={loading}
            >
              <List
                size="small"
                dataSource={data?.companyFeeds || []}
                renderItem={(item) => (
                  <List.Item
                    extra={
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.date}
                      </Text>
                    }
                  >
                    <Space>
                      <Tag color="blue">{item.tag}</Tag>
                      <Text style={{ fontSize: 12 }}>{item.title}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* PHẢI: Trạng thái đơn từ cá nhân */}
          <Col xs={24} lg={12}>
            <Card
              size="small"
              title="📑 Tiến Độ Duyệt Đơn Từ Cá Nhân"
              extra={<a onClick={navigateToLeaveRequest}>Tạo đơn mới</a>}
              loading={loading}
            >
              <Table
                size="small"
                pagination={false}
                dataSource={data?.myRequests || []}
                rowKey="requestId"
                columns={[
                  { title: 'Loại đơn', dataIndex: 'type', width: 140 },
                  { title: 'Ngày tạo', dataIndex: 'date', width: 100 },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    render: (st: string, record: any) => {
                      let color = 'gold';
                      if (st === 'Approved') color = 'green';
                      if (st === 'Rejected') color = 'red';
                      return <Tag color={color}>{record.statusText}</Tag>;
                    },
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        {/* PHÍM TẮT THAO TÁC NHANH (QUICK ACTIONS) */}
        <Card size="small" title="⚡ Phím Tắt Thao Tác Nhanh">
          <Space wrap size="middle">
            <Button
              type="primary"
              icon={<FormOutlined />}
              onClick={navigateToLeaveRequest}
              style={{ backgroundColor: '#00AEEF', borderColor: '#00AEEF' }}
            >
              Tạo đơn nghỉ phép / OT
            </Button>

            <Button
              icon={<DollarOutlined />}
              onClick={navigateToAccountSettings}
            >
              Xem phiếu lương cá nhân
            </Button>

            <Button icon={<UserOutlined />} onClick={navigateToAccountSettings}>
              Cập nhật thông tin cá nhân
            </Button>
          </Space>
        </Card>
      </Space>
    </PageContainer>
  );
};

export default UserDashboard;
