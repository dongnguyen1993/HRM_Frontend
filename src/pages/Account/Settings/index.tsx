import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Menu,
  message,
  Row,
  Select,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Title } = Typography;

export const AccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [basicForm] = Form.useForm();
  const [securityForm] = Form.useForm();

  // 1. Tải thông tin cá nhân của User đang đăng nhập
  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      const res = await request<any>('/api/users/my-profile', {
        method: 'GET',
      });
      if (res && res.isSuccess && res.data) {
        const user = res.data;
        setCurrentUser(user);
        basicForm.setFieldsValue({
          email: user.email,
          fullName: user.fullName,
          plant: user.plant || 'Technics H',
          comment: user.comment,
        });
      }
    } catch {
      message.error('Lỗi khi tải thông tin tài khoản cá nhân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  // 2. Cập nhật thông tin cơ bản
  const handleUpdateBasic = async () => {
    try {
      const values = await basicForm.validateFields();
      setSaving(true);
      const res = await request<any>('/api/users/my-profile', {
        method: 'PUT',
        data: values,
      });

      if (res && res.isSuccess) {
        message.success('Cập nhật thông tin cá nhân thành công!');
        fetchMyProfile();
      } else {
        message.error(res?.message || 'Cập nhật thất bại');
      }
    } catch {
      // Form validation error
    } finally {
      setSaving(false);
    }
  };

  // 3. Đổi mật khẩu
  const handleChangePassword = async () => {
    try {
      const values = await securityForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('Mật khẩu xác nhận không khớp!');
        return;
      }

      setSaving(true);
      const res = await request<any>('/api/users/change-password', {
        method: 'PUT',
        data: {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
      });

      if (res && res.isSuccess) {
        message.success('Đổi mật khẩu thành công!');
        securityForm.resetFields();
      } else {
        message.error(res?.message || 'Đổi mật khẩu thất bại!');
      }
    } catch {
      // Validation error
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer title="Account Settings (Cài đặt Tài khoản)">
      <Card size="small" loading={loading} bodyStyle={{ padding: '16px 0' }}>
        <Row gutter={24}>
          {/* CỘT TRÁI: MENU TAB */}
          <Col xs={24} md={6} style={{ borderRight: '1px solid #f0f0f0' }}>
            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              style={{ borderRight: 0 }}
              onClick={({ key }) => setActiveTab(key)}
              items={[
                {
                  key: 'basic',
                  label: 'Basic settings',
                  icon: <UserOutlined />,
                },
                {
                  key: 'security',
                  label: 'Security Settings',
                  icon: <LockOutlined />,
                },
              ]}
            />
          </Col>

          {/* CỘT PHẢI: NỘI DUNG TAB */}
          <Col xs={24} md={18} style={{ padding: '0 24px' }}>
            {activeTab === 'basic' && (
              <div>
                <Title level={4} style={{ marginBottom: 20 }}>
                  Basic settings
                </Title>
                <Row gutter={48}>
                  {/* FORM THÔNG TIN */}
                  <Col xs={24} lg={14}>
                    <Form form={basicForm} layout="vertical">
                      <Form.Item label="Mail (Email)" name="email">
                        <Input disabled placeholder="Email cá nhân" />
                      </Form.Item>

                      <Form.Item
                        label="Nick name (Họ và tên)"
                        name="fullName"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập Họ và tên',
                          },
                        ]}
                      >
                        <Input placeholder="Nhập họ và tên..." />
                      </Form.Item>

                      <Form.Item label="Plant / Region (Nhà máy)" name="plant">
                        <Select
                          options={[
                            { label: 'Technics H', value: 'Technics H' },
                            { label: 'Technics V', value: 'Technics V' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Personal Profile (Ghi chú / Mô tả)"
                        name="comment"
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Nhập ghi chú cá nhân..."
                        />
                      </Form.Item>

                      <Button
                        type="primary"
                        loading={saving}
                        onClick={handleUpdateBasic}
                        style={{
                          backgroundColor: '#00AEEF',
                          borderColor: '#00AEEF',
                        }}
                      >
                        Update basic information
                      </Button>
                    </Form>
                  </Col>

                  {/* CỘT HIỂN THỊ ẢNH AVATAR CỦA USER (ẨN NÚT CHANGE PROFILE PICTURE) */}
                  <Col
                    xs={24}
                    lg={10}
                    style={{ textAlign: 'center', paddingTop: 20 }}
                  >
                    <div
                      style={{
                        marginBottom: 8,
                        fontWeight: 500,
                        color: '#555',
                      }}
                    >
                      Avatar
                    </div>
                    <Avatar
                      size={140}
                      src={
                        currentUser?.avatarPath
                          ? `/api/users/${currentUser.secureId}/avatar-file`
                          : undefined
                      }
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#e6f7ff', color: '#00AEEF' }}
                    />
                  </Col>
                </Row>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={{ maxWidth: 500 }}>
                <Title level={4} style={{ marginBottom: 20 }}>
                  Security Settings
                </Title>
                <Form form={securityForm} layout="vertical">
                  <Form.Item
                    label="Mật khẩu hiện tại"
                    name="oldPassword"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập mật khẩu hiện tại',
                      },
                    ]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu cũ..." />
                  </Form.Item>

                  <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                    ]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu mới..." />
                  </Form.Item>

                  <Form.Item
                    label="Xác nhận Mật khẩu mới"
                    name="confirmPassword"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng xác nhận mật khẩu mới',
                      },
                    ]}
                  >
                    <Input.Password placeholder="Nhập lại mật khẩu mới..." />
                  </Form.Item>

                  <Button
                    type="primary"
                    loading={saving}
                    onClick={handleChangePassword}
                    style={{
                      backgroundColor: '#00AEEF',
                      borderColor: '#00AEEF',
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </Form>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default AccountSettings;
