import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography } from 'antd';

const Welcome: React.FC = () => {
  return (
    <PageContainer>
      <Card>
        <Typography.Title level={2} style={{ color: '#00AEEF' }}>
          Chào mừng đến với Hansol Electronics Việt Nam
        </Typography.Title>
        <Typography.Paragraph>
          Hệ thống Quản trị Nhân sự (HRM) tích hợp Backend .NET 8.
        </Typography.Paragraph>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
