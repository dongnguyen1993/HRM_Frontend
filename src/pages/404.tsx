import { history } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const NotFoundPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Rất tiếc, trang bạn truy cập không tồn tại hoặc đã bị di chuyển."
    extra={
      <Button type="primary" onClick={() => history.push('/welcome')}>
        Trở về Trang chủ
      </Button>
    }
  />
);

export default NotFoundPage;
