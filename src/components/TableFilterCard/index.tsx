import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space } from 'antd';
import React from 'react';

interface TableFilterCardProps {
  onSearch: () => void;
  onReset: () => void;
  children: React.ReactNode;
}

export const TableFilterCard: React.FC<TableFilterCardProps> = ({
  onSearch,
  onReset,
  children,
}) => {
  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} lg={20}>
          <Row gutter={[16, 16]}>{children}</Row>
        </Col>

        <Col xs={24} lg={4} style={{ textAlign: 'right' }}>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Làm lại
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={onSearch}
              style={{ backgroundColor: '#00AEEF', borderColor: '#00AEEF' }}
            >
              Tìm kiếm
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};
