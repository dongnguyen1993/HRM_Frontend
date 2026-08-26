import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  FireOutlined,
  HourglassOutlined,
  LoginOutlined,
  LogoutOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
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
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { useUserDashboard } from './hooks/useUserDashboard';

export const UserDashboard: React.FC = () => {
  const { data, loading, currentTime, handlePunch } = useUserDashboard();

  // RENDER DỮ LIỆU CÔNG LÊN TỪNG Ô NGÀY TRÊN LỊCH
  const dateCellRender = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const item = data?.monthlyCalendar.find((c) => c.workDate === dateStr);

    if (!item) return null;

    return (
      <div style={{ fontSize: 11, marginTop: 2 }}>
        {item.workUnits >= 1.0 && (
          <Tag color="green" style={{ margin: 0, padding: '0 2px' }}>
            {item.shiftId === 2 ? 'Đêm 9.6h' : '9.6h'}
          </Tag>
        )}
        {item.workUnits === 0.5 && (
          <Tag color="orange" style={{ margin: 0, padding: '0 2px' }}>
            4.8h
          </Tag>
        )}
        {item.otHours > 0 && (
          <Tag
            color="volcano"
            style={{ margin: '2px 0 0 0', padding: '0 2px' }}
          >
            +{item.otHours}h OT
          </Tag>
        )}
        {item.isWarning && (
          <Tooltip title={item.warningReason}>
            <Badge status="error" text="Lỗi" />
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <PageContainer title="Trang Cá Nhân (User Dashboard - Hansol HRM)">
      {/* 1. KHỐI BANNER CHÀO MỪNG & CHẤM CÔNG LIVE */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #00A651 0%, #1890ff 100%)',
              color: '#fff',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                src={data?.profile.avatar}
                style={{ backgroundColor: '#fff', color: '#00A651' }}
              />
              <div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: 20 }}>
                  Xin chào, {data?.profile.fullName || 'Nhân viên Hansol'}! 👋
                </h2>
                <div style={{ marginTop: 4, opacity: 0.9, fontSize: 13 }}>
                  Mã NV: <b>{data?.profile.userCode}</b> | Bộ phận:{' '}
                  <b>{data?.profile.userGroup || 'Sản xuất'}</b> | Nhà máy:{' '}
                  <b>Hansol Electronics VN</b>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Tag color="gold" style={{ fontWeight: 'bold' }}>
                    🌟 Chúc bạn một ngày làm việc hiệu quả và tràn đầy năng
                    lượng!
                  </Tag>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            size="small"
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                <span>Chấm Công Hôm Nay</span>
              </Space>
            }
            extra={<Tag color="blue">{currentTime}</Tag>}
            style={{ height: '100%', borderRadius: 8 }}
          >
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <Space size={12}>
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  onClick={() => handlePunch('IN')}
                  style={{
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    fontWeight: 'bold',
                  }}
                >
                  CHECK-IN
                </Button>
                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={() => handlePunch('OUT')}
                  style={{ fontWeight: 'bold' }}
                >
                  CHECK-OUT
                </Button>
              </Space>
              <div style={{ marginTop: 10, fontSize: 12, color: '#8c8c8c' }}>
                {data?.todayPunch.checkInTime ? (
                  <span>
                    Vào ca:{' '}
                    <b style={{ color: '#52c41a' }}>
                      {data.todayPunch.checkInTime}
                    </b>
                    {data.todayPunch.checkOutTime && (
                      <span>
                        {' '}
                        | Tan ca:{' '}
                        <b style={{ color: '#1890ff' }}>
                          {data.todayPunch.checkOutTime}
                        </b>
                      </span>
                    )}
                  </span>
                ) : (
                  'Chưa ghi nhận quẹt thẻ vào hôm nay'
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 2. KHỐI THẺ KPI CÁ NHÂN (DỮ LIỆU THỰC TẾ TỪ CSDL) */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card
            size="small"
            bordered={false}
            style={{ backgroundColor: '#e6f7ff', borderRadius: 8 }}
          >
            <Statistic
              title="Phép năm còn lại (Năm 2026)"
              value={data?.kpiStats.remainingAnnualLeave || 12.0}
              precision={1}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
              suffix={`/ ${data?.kpiStats.totalAnnualLeaveQuota || 12.0} ngày`}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              Tổng tiêu chuẩn: 12 ngày phép/năm có lương
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            size="small"
            bordered={false}
            style={{ backgroundColor: '#fffbe6', borderRadius: 8 }}
          >
            <Statistic
              title="Giờ OT đã duyệt (Chu kỳ 11 ~ 10)"
              value={data?.kpiStats.totalOtHours || 0}
              precision={1}
              prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
              suffix="giờ OT"
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              Hạn mức tối đa theo luật: 40.0 giờ/tháng
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            size="small"
            bordered={false}
            style={{ backgroundColor: '#f6ffed', borderRadius: 8 }}
          >
            <Statistic
              title="Công chuẩn tích lũy trong tháng"
              value={data?.kpiStats.totalWorkUnits || 0}
              precision={1}
              prefix={<TrophyOutlined style={{ color: '#00A651' }} />}
              suffix="công"
              valueStyle={{ color: '#00A651', fontWeight: 'bold' }}
            />
            <Progress
              percent={Math.min(
                100,
                Math.round(((data?.kpiStats.totalWorkUnits || 0) / 21) * 100),
              )}
              strokeColor="#00A651"
              size="small"
              style={{ marginTop: 4 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 3. LỊCH CHẤM CÔNG CÁ NHÂN & BIỂU ĐỒ GIỜ LÀM TUẦN */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            size="small"
            title={
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <span>
                  Lịch Chấm Công Cá Nhân (Tháng {dayjs().format('MM/YYYY')})
                </span>
              </Space>
            }
            style={{ borderRadius: 8 }}
          >
            <Calendar fullscreen={false} cellRender={dateCellRender as any} />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            size="small"
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#00A651' }} />
                <span>Giờ Làm Việc Thực Tế Tuần Này</span>
              </Space>
            }
            style={{ borderRadius: 8, height: '100%' }}
          >
            <List
              size="small"
              dataSource={data?.weeklyHours || []}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <span>
                        <b>{item.dayOfWeekName}</b> ({item.workDate})
                      </span>
                      <span>
                        <Tag color="green">{item.standardHours}h chuẩn</Tag>
                        {item.otHours > 0 && (
                          <Tag color="orange">+{item.otHours}h OT</Tag>
                        )}
                      </span>
                    </div>
                    <Progress
                      percent={Math.min(
                        100,
                        Math.round(
                          ((item.standardHours + item.otHours) / 12) * 100,
                        ),
                      )}
                      strokeColor={item.otHours > 0 ? '#fa8c16' : '#00A651'}
                      size="small"
                      showInfo={false}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 4. TIẾN ĐỘ DUYỆT ĐƠN & BẢNG TIN HR */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Space>
                <FileDoneOutlined style={{ color: '#1890ff' }} />
                <span>Tiến Độ Duyệt Đơn Từ Cá Nhân</span>
              </Space>
            }
            style={{ borderRadius: 8 }}
          >
            <Table
              size="small"
              dataSource={data?.recentRequests || []}
              rowKey="registrationId"
              pagination={false}
              columns={[
                { title: 'Loại đơn', dataIndex: 'requestType' },
                { title: 'Ngày đăng ký', dataIndex: 'workDate' },
                {
                  title: 'Số giờ OT',
                  dataIndex: 'plannedHours',
                  render: (v) => <Tag color="orange">+{v}h</Tag>,
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'approvalStatus',
                  render: (status) => {
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
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Space>
                <BellOutlined style={{ color: '#faad14' }} />
                <span>Bảng Tin & Thông Báo Nội Bộ HR</span>
              </Space>
            }
            style={{ borderRadius: 8 }}
          >
            <List
              size="small"
              dataSource={data?.announcements || []}
              renderItem={(item) => (
                <List.Item>
                  <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <Space>
                      <Tag color="blue">{item.tag}</Tag>
                      <span style={{ fontSize: 13 }}>{item.title}</span>
                    </Space>
                    <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {item.createdAt}
                    </span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default UserDashboard;
