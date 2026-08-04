import {
  LockOutlined,
  MailOutlined,
  NumberOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Tabs,
  Typography,
} from 'antd';
import React from 'react';
import { useSystemSettings } from './hooks/useSystemSettings';

const { Text } = Typography;

export const SystemSettings: React.FC = () => {
  const { loading, saving, config, form, fetchSettings, handleSave } = useSystemSettings();

  return (
    <PageContainer
      header={{
        title: 'System Settings (Cấu hình Tham số Hệ thống)',
        extra: [
          <Space key="actions">
            <Button icon={<ReloadOutlined />} onClick={fetchSettings}>
              TẢI LẠI
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              style={{ backgroundColor: '#00A651', borderColor: '#00A651' }}
            >
              LƯU CẤU HÌNH CSDL
            </Button>
          </Space>,
        ],
      }}
    >
      <Card size="small" loading={loading}>
        <Form form={form} layout="vertical" style={{ maxWidth: 800 }}>
          <Tabs
            defaultActiveKey="security"
            items={[
              // TAB 1: BẢO MẬT & PHIÊN LÀM VIỆC
              {
                key: 'security',
                label: (
                  <span>
                    <LockOutlined /> Bảo mật & Phiên làm việc
                  </span>
                ),
                children: (
                  <div style={{ padding: '12px 0' }}>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Thời gian hết hạn phiên (Phút)"
                          name="sessionTimeoutMinutes"
                          tooltip="Thời gian tự động đăng xuất nếu không có thao tác"
                          rules={[{ required: true, message: 'Nhập thời gian phiên' }]}
                        >
                          <InputNumber min={5} max={480} style={{ width: '100%' }} addonAfter="Phút" />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Số lần đăng nhập sai tối đa"
                          name="maxFailedAttempts"
                          tooltip="Số lần nhập sai mật khẩu liên tiếp trước khi khóa tài khoản"
                          rules={[{ required: true, message: 'Nhập số lần sai' }]}
                        >
                          <InputNumber min={3} max={10} style={{ width: '100%' }} addonAfter="Lần" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Thời hạn mật khẩu (Ngày)"
                          name="passwordExpiryDays"
                          tooltip="Số ngày yêu cầu người dùng đổi mật khẩu định kỳ"
                          rules={[{ required: true, message: 'Nhập số ngày' }]}
                        >
                          <InputNumber min={30} max={365} style={{ width: '100%' }} addonAfter="Ngày" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },

              // TAB 2: CẤU HÌNH MÁY CHỦ EMAIL SMTP
              {
                key: 'smtp',
                label: (
                  <span>
                    <MailOutlined /> Máy chủ Email (SMTP)
                  </span>
                ),
                children: (
                  <div style={{ padding: '12px 0' }}>
                    <Row gutter={24}>
                      <Col span={16}>
                        <Form.Item
                          label="SMTP Host"
                          name="smtpHost"
                          tooltip="Địa chỉ máy chủ SMTP (vd: smtp.gmail.com)"
                          rules={[{ required: true, message: 'Nhập SMTP Host' }]}
                        >
                          <Input placeholder="smtp.gmail.com" />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label="SMTP Port"
                          name="smtpPort"
                          rules={[{ required: true, message: 'Nhập Port' }]}
                        >
                          <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="587" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Email Hệ thống (Sender)"
                          name="smtpEmail"
                          rules={[
                            { required: true, message: 'Nhập Email hệ thống' },
                            { type: 'email', message: 'Email không hợp lệ' },
                          ]}
                        >
                          <Input placeholder="hrm-system@hansol.com" />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Mật khẩu Ứng dụng SMTP"
                          name="smtpPassword"
                          tooltip="Mật khẩu được bảo mật bằng mã hóa AES-256 trong CSDL"
                        >
                          <Input.Password placeholder="••••••••••••" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item label="Kích hoạt Mã hóa SSL/TLS" name="enableSsl" valuePropName="checked">
                          <Switch checkedChildren="Bật SSL" unCheckedChildren="Tắt" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },

              // TAB 3: QUY TẮC TẠO MÃ TỰ ĐỘNG
              {
                key: 'numbering',
                label: (
                  <span>
                    <NumberOutlined /> Quy tắc Tạo mã
                  </span>
                ),
                children: (
                  <div style={{ padding: '12px 0' }}>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Tiền tố Mã Nhân viên (Prefix)"
                          name="userCodePrefix"
                          tooltip="Ký tự đứng đầu khi tự sinh Mã NV mới"
                          rules={[{ required: true, message: 'Nhập tiền tố' }]}
                        >
                          <Input placeholder="Ví dụ: NV hoặc HS" />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Giá trị Số tiếp theo (Next Value)"
                          name="userCodeNextNumber"
                          tooltip="Số thứ tự sẽ gán cho nhân viên tiếp theo"
                          rules={[{ required: true, message: 'Nhập số tiếp theo' }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
          />

          {config && (
            <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cập nhật lần cuối bởi <b>{config.updatedBy || 'ADMIN'}</b> vào lúc <b>{config.updatedAt ? new Date(config.updatedAt).toLocaleString('vi-VN') : '-'}</b>
              </Text>
            </div>
          )}
        </Form>
      </Card>
    </PageContainer>
  );
};

export default SystemSettings;