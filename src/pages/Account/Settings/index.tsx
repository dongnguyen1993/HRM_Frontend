import {
  BgColorsOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  SkinOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Menu,
  message,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import React, { useEffect, useState } from 'react';
import * as accountService from './service';
import type { MyProfileData } from './service';

const { Title, Text, Paragraph } = Typography;

export const AccountSettings: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [loading, setLoading] = useState<boolean>(false);
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [passwordSaving, setPasswordSaving] = useState<boolean>(false);
  const [avatarUploading, setAvatarUploading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<MyProfileData | null>(null);
  const [plants, setPlants] = useState<string[]>(['Technics H', 'Technics V']);
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 1. Nạp thông tin tài khoản và danh sách nhà máy
  const loadAccountData = async () => {
    setLoading(true);
    try {
      // Tải profile cá nhân
      const profileRes = await accountService.getMyProfile();
      if (profileRes && profileRes.isSuccess && profileRes.data) {
        const user = profileRes.data;
        setCurrentUser(user);
        profileForm.setFieldsValue({
          userCode: user.userCode,
          email: user.email,
          fullName: user.fullName,
          plant: user.plant || 'Technics H',
          comment: user.comment || '',
        });
      } else {
        message.error(profileRes?.message || 'Không thể tải thông tin hồ sơ');
      }

      // Tải danh sách nhà máy
      const plantList = await accountService.getPlants();
      setPlants(plantList);
    } catch {
      message.error('Lỗi khi tải thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  // 2. Cập nhật thông tin cơ bản
  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setProfileSaving(true);
      const res = await accountService.updateMyProfile({
        fullName: values.fullName,
        plant: values.plant,
        comment: values.comment,
      });

      if (res && res.isSuccess) {
        message.success('Cập nhật thông tin hồ sơ thành công!');
        setCurrentUser((prev) => (prev ? { ...prev, ...values } : null));

        // Cập nhật tên trong header navbar
        setInitialState((prev) => ({
          ...prev,
          name: values.fullName,
        }));

        // Đồng bộ localStorage
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          try {
            const u = JSON.parse(userInfoStr);
            u.fullName = values.fullName;
            localStorage.setItem('userInfo', JSON.stringify(u));
          } catch {}
        }
      } else {
        message.error(res?.message || 'Cập nhật thông tin thất bại');
      }
    } catch {
      // Form validation error
    } finally {
      setProfileSaving(false);
    }
  };

  // 3. Tải lên Avatar mới
  const handleAvatarUpload = async (file: File) => {
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.name.match(/\.(jpg|jpeg|png)$/i);

    if (!isJpgOrPng) {
      message.error('Chỉ hỗ trợ tệp ảnh định dạng JPG hoặc PNG!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh đại diện không được vượt quá 5MB!');
      return false;
    }

    setAvatarUploading(true);
    try {
      const res = await accountService.uploadMyAvatar(file);
      if (res && res.isSuccess && res.data) {
        const newAvatarPath = res.data;
        message.success('Cập nhật ảnh đại diện thành công!');

        // Làm mới cache ảnh
        setAvatarTimestamp(Date.now());
        setCurrentUser((prev) => (prev ? { ...prev, avatarPath: newAvatarPath } : null));

        // Cập nhật logo/avatar trong header layout
        const avatarUrl = currentUser?.secureId
          ? `/api/users/${currentUser.secureId}/avatar-file?t=${Date.now()}`
          : newAvatarPath;

        setInitialState((prev) => ({
          ...prev,
          avatar: avatarUrl,
        }));

        // Cập nhật userInfo trong localStorage
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          try {
            const u = JSON.parse(userInfoStr);
            u.avatarPath = newAvatarPath;
            localStorage.setItem('userInfo', JSON.stringify(u));
          } catch {}
        }
      } else {
        message.error(res?.message || 'Tải lên ảnh đại diện thất bại');
      }
    } catch {
      message.error('Lỗi khi tải ảnh đại diện lên máy chủ');
    } finally {
      setAvatarUploading(false);
    }

    return false; // Chặn upload mặc định của Antd
  };

  // 4. Đổi mật khẩu
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPasswordSaving(true);
      const res = await accountService.changeMyPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      if (res && res.isSuccess) {
        message.success('Đổi mật khẩu thành công!');
        passwordForm.resetFields();
      } else {
        message.error(res?.message || 'Đổi mật khẩu thất bại!');
      }
    } catch {
      // Form validation error
    } finally {
      setPasswordSaving(false);
    }
  };

  // 5. Thay đổi tùy chọn giao diện
  const handleThemeChange = (color: string) => {
    const newSettings = {
      ...initialState?.settings,
      colorPrimary: color,
    };
    localStorage.setItem('userThemeSettings', JSON.stringify(newSettings));
    setInitialState((prev) => ({
      ...prev,
      settings: newSettings,
    }));
    message.success('Đã áp dụng màu chủ đạo mới!');
  };

  const handleNavThemeChange = (theme: 'light' | 'realDark') => {
    const newSettings = {
      ...initialState?.settings,
      navTheme: theme,
    };
    localStorage.setItem('userThemeSettings', JSON.stringify(newSettings));
    setInitialState((prev) => ({
      ...prev,
      settings: newSettings,
    }));
    message.success(`Đã chuyển sang giao diện ${theme === 'realDark' ? 'Tối' : 'Sáng'}!`);
  };

  const avatarSrc = currentUser?.secureId
    ? `/api/users/${currentUser.secureId}/avatar-file?t=${avatarTimestamp}`
    : undefined;

  return (
    <PageContainer
      header={{
        title: 'Cài đặt Tài khoản & Hồ sơ Cá nhân',
        breadcrumb: {
          items: [
            { path: '/home/personal', title: 'Trang chủ' },
            { title: 'Tài khoản' },
            { title: 'Cài đặt' },
          ],
        },
      }}
    >
      <Row gutter={[24, 24]}>
        {/* CỘT TRÁI: PROFILE SUMMARY & MENU ĐIỀU HƯỚNG */}
        <Col xs={24} md={8} lg={7}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* THẺ HỒ SƠ TỔNG QUAN */}
            <Card
              bordered={false}
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                textAlign: 'center',
                paddingTop: 12,
              }}
            >
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <Avatar
                  size={100}
                  src={avatarSrc}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: '#e6f7ff',
                    color: '#00AEEF',
                    border: '3px solid #00AEEF',
                    boxShadow: '0 2px 8px rgba(0, 174, 239, 0.25)',
                  }}
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                  accept="image/png, image/jpeg"
                >
                  <Tooltip title="Nhấp để đổi ảnh đại diện">
                    <Button
                      shape="circle"
                      size="small"
                      type="primary"
                      icon={<CameraOutlined />}
                      loading={avatarUploading}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#00AEEF',
                        borderColor: '#00AEEF',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                  </Tooltip>
                </Upload>
              </div>

              <Title level={4} style={{ marginBottom: 4 }}>
                {currentUser?.fullName || 'Người dùng'}
              </Title>

              <Space size={6} wrap style={{ justifyContent: 'center', marginBottom: 12 }}>
                <Tag color="blue" icon={<IdcardOutlined />}>
                  {currentUser?.userCode || '—'}
                </Tag>
                <Tag color="cyan" icon={<EnvironmentOutlined />}>
                  {currentUser?.plant || 'Technics H'}
                </Tag>
              </Space>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ textAlign: 'left', fontSize: 13, color: '#595959' }}>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MailOutlined style={{ color: '#00AEEF' }} />
                  <Text ellipsis style={{ flex: 1 }}>
                    {currentUser?.email || '—'}
                  </Text>
                </div>
                {currentUser?.createdAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#00AEEF' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Gia nhập: {new Date(currentUser.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </div>
                )}
              </div>
            </Card>

            {/* MENU TAB ĐIỀU HƯỚNG */}
            <Card
              bordered={false}
              bodyStyle={{ padding: 8 }}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Menu
                mode="inline"
                selectedKeys={[activeTab]}
                onClick={({ key }) => setActiveTab(key)}
                style={{ borderRight: 0 }}
                items={[
                  {
                    key: 'profile',
                    icon: <UserOutlined style={{ fontSize: 16 }} />,
                    label: <span style={{ fontWeight: 500 }}>Thông tin cá nhân</span>,
                  },
                  {
                    key: 'security',
                    icon: <SafetyCertificateOutlined style={{ fontSize: 16 }} />,
                    label: <span style={{ fontWeight: 500 }}>Bảo mật & Đổi mật khẩu</span>,
                  },
                  {
                    key: 'preferences',
                    icon: <SkinOutlined style={{ fontSize: 16 }} />,
                    label: <span style={{ fontWeight: 500 }}>Tùy chọn giao diện</span>,
                  },
                ]}
              />
            </Card>
          </Space>
        </Col>

        {/* CỘT PHẢI: NỘI DUNG TỪNG TAB */}
        <Col xs={24} md={16} lg={17}>
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'profile' && (
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: '#00AEEF' }} />
                  <span>Cập nhật Thông tin Cá nhân</span>
                </Space>
              }
              bordered={false}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              loading={loading}
            >
              <Form
                form={profileForm}
                layout="vertical"
                initialValues={{
                  plant: 'Technics H',
                }}
              >
                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          <span>Mã nhân viên</span>
                          <Tooltip title="Mã nhân viên là định danh hệ thống, không thể tự ý thay đổi">
                            <LockOutlined style={{ color: '#8c8c8c' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="userCode"
                    >
                      <Input
                        disabled
                        prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ backgroundColor: '#f5f5f5', color: '#595959' }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          <span>Địa chỉ Email</span>
                          <Tooltip title="Email đăng nhập chính thức liên kết với tài khoản">
                            <LockOutlined style={{ color: '#8c8c8c' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="email"
                    >
                      <Input
                        disabled
                        prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ backgroundColor: '#f5f5f5', color: '#595959' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Họ và tên nhân viên"
                      name="fullName"
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên của bạn' },
                        { min: 2, message: 'Họ và tên tối thiểu 2 ký tự' },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Nhập họ và tên đầy đủ..."
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Nhà máy / Khu vực trực thuộc"
                      name="plant"
                      rules={[{ required: true, message: 'Vui lòng chọn nhà máy' }]}
                    >
                      <Select
                        placeholder="Chọn nhà máy..."
                        options={plants.map((p) => ({ label: p, value: p }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Giới thiệu / Ghi chú cá nhân"
                  name="comment"
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Nhập đôi dòng mô tả, chức vụ hoặc ghi chú về bản thân..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Thông tin sẽ được cập nhật đồng bộ trên toàn hệ thống sau khi lưu
                  </Text>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={profileSaving}
                    onClick={handleUpdateProfile}
                    style={{
                      backgroundColor: '#00AEEF',
                      borderColor: '#00AEEF',
                      fontWeight: 500,
                      padding: '0 24px',
                    }}
                  >
                    Lưu thông tin
                  </Button>
                </div>
              </Form>
            </Card>
          )}

          {/* TAB 2: BẢO MẬT & ĐỔI MẬT KHẨU */}
          {activeTab === 'security' && (
            <Card
              title={
                <Space>
                  <SafetyCertificateOutlined style={{ color: '#00AEEF' }} />
                  <span>Đổi Mật khẩu Đăng nhập</span>
                </Space>
              }
              bordered={false}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Alert
                message="Quy chuẩn bảo mật mật khẩu"
                description={
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: '20px' }}>
                    <li>Mật khẩu mới phải có tối thiểu <strong>6 ký tự</strong>.</li>
                    <li>Nên bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt để chống tấn công đoán mật khẩu.</li>
                    <li>Không chia sẻ mật khẩu tài khoản HRM của bạn cho bất kỳ ai.</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <div style={{ maxWidth: 480 }}>
                <Form
                  form={passwordForm}
                  layout="vertical"
                  autoComplete="off"
                >
                  <Form.Item
                    label="Mật khẩu hiện tại"
                    name="oldPassword"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Nhập mật khẩu đang sử dụng..."
                    />
                  </Form.Item>

                  <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                      { min: 6, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Nhập mật khẩu mới..."
                    />
                  </Form.Item>

                  <Form.Item
                    label="Xác nhận Mật khẩu mới"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận lại mật khẩu mới' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Nhập lại mật khẩu mới..."
                    />
                  </Form.Item>

                  <div style={{ marginTop: 24 }}>
                    <Button
                      type="primary"
                      icon={<SafetyCertificateOutlined />}
                      loading={passwordSaving}
                      onClick={handleChangePassword}
                      style={{
                        backgroundColor: '#00AEEF',
                        borderColor: '#00AEEF',
                        fontWeight: 500,
                        padding: '0 24px',
                      }}
                    >
                      Cập nhật Mật khẩu
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
          )}

          {/* TAB 3: TÙY CHỌN GIAO DIỆN */}
          {activeTab === 'preferences' && (
            <Card
              title={
                <Space>
                  <SkinOutlined style={{ color: '#00AEEF' }} />
                  <span>Tùy biến Giao diện & Chủ đề Cá nhân</span>
                </Space>
              }
              bordered={false}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                {/* 1. CHỦ ĐỀ SÁNG / TỐI */}
                <div>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    Chế độ hiển thị (Theme Mode)
                  </Title>
                  <Radio.Group
                    value={initialState?.settings?.navTheme === 'realDark' ? 'realDark' : 'light'}
                    onChange={(e) => handleNavThemeChange(e.target.value)}
                  >
                    <Radio.Button value="light" style={{ padding: '0 20px' }}>
                      ☀️ Giao diện Sáng (Mặc định)
                    </Radio.Button>
                    <Radio.Button value="realDark" style={{ padding: '0 20px' }}>
                      🌙 Giao diện Tối (Dark Mode)
                    </Radio.Button>
                  </Radio.Group>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                {/* 2. MÀU SẮC CHỦ ĐẠO */}
                <div>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    Màu sắc chủ đạo (Primary Color)
                  </Title>
                  <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                    Chọn bảng màu phong cách bạn yêu thích cho các nút bấm, điểm nhấn và thanh tiêu đề:
                  </Paragraph>

                  <Space size={16} wrap>
                    {[
                      { name: 'Hansol Cyan', color: '#00AEEF' },
                      { name: 'Forest Green', color: '#00A651' },
                      { name: 'Tech Blue', color: '#1890ff' },
                      { name: 'Sunset Orange', color: '#fa8c16' },
                      { name: 'Royal Purple', color: '#722ed1' },
                    ].map((item) => {
                      const isSelected =
                        (initialState?.settings?.colorPrimary || '#00AEEF').toLowerCase() ===
                        item.color.toLowerCase();

                      return (
                        <div
                          key={item.color}
                          onClick={() => handleThemeChange(item.color)}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: isSelected ? `2px solid ${item.color}` : '1px solid #f0f0f0',
                            backgroundColor: isSelected ? 'rgba(0, 174, 239, 0.04)' : '#fff',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: item.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            }}
                          >
                            {isSelected && <CheckCircleFilled style={{ color: '#fff', fontSize: 18 }} />}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: isSelected ? 600 : 400 }}>
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </Space>
                </div>
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default AccountSettings;
