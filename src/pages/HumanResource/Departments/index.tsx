import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Tree,
} from 'antd';
import React from 'react';
import { useDepartment } from './hooks/useDepartment';
import type { DepartmentItem } from './types';

export const DepartmentList: React.FC = () => {
  const { treeData, loading, saving, form, fetchTree, selectNode, handleSave } =
    useDepartment();

  const mapTreeData = (items: DepartmentItem[]): any[] =>
    items.map((item) => ({
      title: `${item.departmentName} (${item.departmentCode})`,
      key: item.departmentId,
      rawNode: item,
      children: item.children ? mapTreeData(item.children) : [],
    }));

  return (
    <PageContainer title="Department Management (Quản lý Cơ cấu Tổ chức)">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="Sơ đồ Khối / Phòng Ban" size="small" loading={loading}>
            <Tree
              showLine
              defaultExpandAll
              treeData={mapTreeData(treeData)}
              onSelect={(_, info) => {
                if (info.node && (info.node as any).rawNode) {
                  selectNode((info.node as any).rawNode);
                }
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="Chi tiết Phòng Ban" size="small">
            <Form form={form} layout="vertical">
              <Form.Item
                label="Mã Phòng Ban"
                name="departmentCode"
                rules={[{ required: true }]}
              >
                <Input placeholder="DEPT_HR" />
              </Form.Item>
              <Form.Item
                label="Tên Phòng Ban"
                name="departmentName"
                rules={[{ required: true }]}
              >
                <Input placeholder="Phòng Nhân Sự" />
              </Form.Item>
              <Form.Item label="Thứ tự" name="sortOrder">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Sử dụng" name="useFlag" valuePropName="checked">
                <Checkbox>Active</Checkbox>
              </Form.Item>
              <Button type="primary" loading={saving} onClick={handleSave}>
                Lưu Phòng Ban
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DepartmentList;
