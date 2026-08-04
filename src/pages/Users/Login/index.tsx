import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { request } from '@umijs/max'; // Sử dụng hàm request tích hợp sẵn
import { message, Tabs } from 'antd';
import React from 'react'; // BỔ SUNG: Sửa lỗi biên dịch TypeScript thiếu React

const Login: React.FC = () => {
  const handleSubmit = async (values: any) => {
    try {
      // SỬ DỤNG PROXY ĐỂ KHẮC PHỤC 100% LỖI CORS VÀ TỰ ĐỘNG ĐÍNH KÈM INTERCEPTORS
      const result = await request<any>('/api/auth/login', {
        method: 'POST',
        data: values, // Umi request dùng 'data' thay vì 'body' của fetch
      });

      if (result.isSuccess) {
        message.success('Đăng nhập thành công!');
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('userInfo', JSON.stringify(result.data));

        // Buộc trình duyệt reload và nhảy thẳng vào welcome để nạp menu động cực mượt
        window.location.href = '/welcome';
      } else {
        message.error(result.message || 'Sai tài khoản hoặc mật khẩu');
      }
    } catch (error) {
      message.error('Không thể kết nối tới máy chủ Backend');
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#f0f2f5',
        height: '100vh',
        paddingTop: '100px',
      }}
    >
      <LoginForm
        logo="/logo.jpg"
        title="Hansol HRM"
        subTitle="Hansol Electronics Việt Nam - Quản trị nhân sự"
        onFinish={handleSubmit}
      >
        <Tabs
          centered
          items={[{ key: 'account', label: 'Đăng nhập hệ thống' }]}
        />
        <ProFormText
          name="userCode"
          fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
          placeholder="Mã nhân viên (User Code)"
          rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên!' }]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
          placeholder="Mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        />
      </LoginForm>
    </div>
  );
};

export default Login;
