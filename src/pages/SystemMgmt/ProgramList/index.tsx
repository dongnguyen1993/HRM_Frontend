import {
  CompressOutlined,
  ExpandOutlined,
  PlusOutlined,
  PlusSquareOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
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
  Select,
  Space,
  Tag,
  Tooltip,
  Tree,
} from 'antd';
import React from 'react';
import { useProgramList } from './hooks/useProgramList';
import type { ProgramMenuItem } from './types';

const ProgramList: React.FC = () => {
  const {
    treeData,
    flatList,
    selectedItem,
    loading,
    saving,
    form,
    expandedKeys,
    setExpandedKeys,
    fetchTree,
    selectProgram,
    handleNew,
    handleProgramNameChange,
    handleExpandAll,
    handleCollapseAll,
    handleCreate,
    handleUpdate,
  } = useProgramList();

  // ĐÃ SỬA: TỰ ĐỘNG THỪA KẾ MÀU ĐỎ CHO TẤT CẢ MENU CON NẾU MENU CHA BỊ INACTIVE (UseFlag = false)
  const mapTreeData = (
    items: ProgramMenuItem[],
    isParentInactive = false,
  ): any[] =>
    items.map((item) => {
      // Menu bị coi là Inactive nếu chính nó UseFlag = false HOẶC Menu Cha của nó bị Inactive
      const isInactive = !item.useFlag || isParentInactive;

      return {
        title: (
          <span style={{ color: isInactive ? '#ff4d4f' : 'inherit' }}>
            {item.programName} ({item.programKey})
            {!item.useFlag && (
              <Tag color="error" style={{ marginLeft: 6, fontSize: '10px' }}>
                Inactive
              </Tag>
            )}
            {item.useFlag && isParentInactive && (
              <Tag color="warning" style={{ marginLeft: 6, fontSize: '10px' }}>
                Parent Disabled
              </Tag>
            )}
          </span>
        ),
        key: item.programKey,
        rawNode: item,
        // Truyền trạng thái isInactive hiện tại xuống cho các menu con đệ quy
        children: item.children ? mapTreeData(item.children, isInactive) : [],
      };
    });

  const hasChildren =
    selectedItem?.children && selectedItem.children.length > 0;
  const isCoreSystemMenu = selectedItem?.programKey === '1002';
  const currentPath = Form.useWatch('path', form);

  return (
    <PageContainer
      header={{
        title: 'Menu & Screen Management (Quản lý Danh mục Màn hình)',
        extra: [
          <Space key="actions">
            <Button icon={<ReloadOutlined />} onClick={fetchTree}>
              SEARCH
            </Button>
            <Button icon={<PlusOutlined />} onClick={handleNew}>
              NEW
            </Button>
            <Button
              type="primary"
              icon={<PlusSquareOutlined />}
              loading={saving}
              onClick={handleCreate}
            >
              CREATE
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleUpdate}
              style={{ backgroundColor: '#00A651', borderColor: '#00A651' }}
            >
              UPDATE
            </Button>
          </Space>,
        ],
      }}
    >
      <Row gutter={[16, 16]}>
        {/* KHỐI TRÁI: CÂY MENU (THỪA KẾ TÔ MÀU ĐỎ TỪ CHA SANG CON) */}
        <Col xs={24} lg={8}>
          <Card
            title="Program Tree"
            size="small"
            loading={loading}
            extra={
              <Space size={4}>
                <Tooltip title="Mở rộng tất cả các nhánh">
                  <Button
                    size="small"
                    icon={<ExpandOutlined />}
                    onClick={handleExpandAll}
                  />
                </Tooltip>
                <Tooltip title="Thu gọn tất cả các nhánh">
                  <Button
                    size="small"
                    icon={<CompressOutlined />}
                    onClick={handleCollapseAll}
                  />
                </Tooltip>
              </Space>
            }
          >
            <div
              style={{ minHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}
            >
              <Tree
                showLine
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys)}
                treeData={mapTreeData(treeData)}
                onSelect={(_, info) => {
                  if (info.node && (info.node as any).rawNode) {
                    selectProgram((info.node as any).rawNode);
                  }
                }}
              />
            </div>
          </Card>
        </Col>

        {/* KHỐI PHẢI: FORM CẬP NHẬT CHI TIẾT */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <span>Program Detail Info</span>
                {isCoreSystemMenu && (
                  <Tag color="red">Màn hình Hệ thống Lõi (Chỉ đọc Route)</Tag>
                )}
              </Space>
            }
            size="small"
          >
            <Form
              form={form}
              layout="horizontal"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              size="small"
              style={{ maxWidth: 700 }}
            >
              <Form.Item
                label="Program No."
                name="programKey"
                rules={[
                  { required: true, message: 'Vui lòng nhập Program No.' },
                ]}
              >
                <Input placeholder="Ví dụ: 1006" disabled={!!selectedItem} />
              </Form.Item>

              <Form.Item
                label="Upper Key"
                name="parentProgramKey"
                tooltip={
                  hasChildren
                    ? 'Màn hình này đang chứa Menu con, không thể đổi thành Menu con khác!'
                    : undefined
                }
              >
                <Select
                  placeholder="Chọn Menu Cha (Upper Key)"
                  disabled={hasChildren}
                  allowClear
                  options={[
                    {
                      label: '⭐ -- Không có (Tạo Menu Cha Cấp 1) --',
                      value: '',
                    },
                    ...flatList
                      .filter((i) => i.programKey !== selectedItem?.programKey)
                      .map((i) => ({
                        label: `${i.programName} (${i.programKey})`,
                        value: i.programKey,
                      })),
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Program Desc"
                name="programName"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập Tên hiển thị chuẩn Title Case',
                  },
                ]}
              >
                <Input
                  placeholder="Ví dụ: Shift Management"
                  onChange={handleProgramNameChange}
                />
              </Form.Item>

              <Form.Item label="Program Group" name="programGroup">
                <Select
                  options={[
                    { label: 'System Config', value: 'System Config' },
                    { label: 'Human Resource', value: 'Human Resource' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Route Path"
                name="path"
                tooltip={
                  isCoreSystemMenu
                    ? 'Đường dẫn lõi của hệ thống, không được phép thay đổi!'
                    : 'Đường dẫn theo chuẩn /menu-cha/menu-con'
                }
                extra={
                  currentPath ? (
                    <div className="mt-1 text-xs text-blue-500 font-mono">
                      🔗 <b>URL Xem trước:</b> https://hrm.hansol.com
                      {currentPath}
                    </div>
                  ) : null
                }
              >
                <Input
                  placeholder="Ví dụ: /system-mgmt/shift-management"
                  disabled={isCoreSystemMenu}
                />
              </Form.Item>

              <Form.Item
                label="API Endpoint"
                name="apiUrl"
                tooltip="Đường dẫn API nếu sử dụng Màn Hình Động (Dynamic Screen)"
              >
                <Input placeholder="Ví dụ: /api/common-code" />
              </Form.Item>

              <Form.Item
                label="Use Flag"
                name="useFlag"
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>

              <Form.Item
                label="Menu Flag"
                name="menuFlag"
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>

              <Form.Item label="Sort" name="sortOrder">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="Comment" name="comment">
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item label="Create Time" name="createdAt">
                <Input disabled />
              </Form.Item>

              <Form.Item label="Create User" name="createdBy">
                <Input disabled />
              </Form.Item>

              <Form.Item label="Update Time" name="updatedAt">
                <Input disabled />
              </Form.Item>

              <Form.Item label="Update User" name="updatedBy">
                <Input disabled />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ProgramList;
