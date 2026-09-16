import { history } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const ForbiddenPage: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được phân quyền."
    extra={
      <Button type="primary" onClick={() => history.push('/home/personal')} style={{ backgroundColor: '#00AEEF' }}>
        Quay lại Bảng tin cá nhân
      </Button>
    }
  />
);

export default ForbiddenPage;
