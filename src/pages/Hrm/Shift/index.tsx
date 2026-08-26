import { BaseTable } from '@/components/BaseTable';
import { TableActionBar } from '@/components/TableActionBar';
import { TableFilterCard } from '@/components/TableFilterCard';
import { UndoOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tag,
} from 'antd';
import React from 'react';
import { useShift } from './hooks/useShift';
import type { ShiftItem } from './types';

export const ShiftList: React.FC = () => {
  const {
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterStatus,
    setFilterStatus,
    modalVisible,
    setModalVisible,
    editingItem,
    saving,
    form,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleSave,
    handleBulkDelete,
  } = useShift();

  const columns: ProColumns<ShiftItem>[] = [
    { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
    { title: 'Mã Ca', dataIndex: 'shiftCode', width: 140, fixed: 'left' },
    { title: 'Tên Ca Làm Việc', dataIndex: 'shiftName', width: 220 },
    { title: 'Giờ Bắt Đầu', dataIndex: 'startTime', width: 110 },
    { title: 'Giờ Kết Thúc', dataIndex: 'endTime', width: 110 },
    {
      title: 'Cho phép muộn (Phút)',
      dataIndex: 'gracePeriodMinutes',
      width: 160,
    },
    {
      title: 'Sử Dụng',
      dataIndex: 'useFlag',
      width: 100,
      render: (flag: boolean) => (
        <Tag color={flag ? 'green' : 'red'}>{flag ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    { title: 'Ghi Chú', dataIndex: 'comment', width: 200 },
  ];

  const isFilteringDeleted = filterStatus === false;

  return (
    <PageContainer title="Shift Management (Cấu hình Ca làm việc)">
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={12}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Tìm kiếm:</span>
            <Input
              placeholder="Tìm Mã ca, Tên ca làm việc..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={12}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 80 }}>Trạng thái:</span>
            <Select
              placeholder="Tất cả Trạng thái"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              options={[
                { label: 'Đang hoạt động (Active)', value: true },
                { label: 'Đã khóa (Inactive)', value: false },
              ]}
            />
          </Space>
        </Col>
      </TableFilterCard>

      <Card size="small">
        <BaseTable<ShiftItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="shiftId"
          search={false}
          // BỔ SUNG 2 DÒNG NÀY ĐỂ KÍCH HOẠT NÚT SHOW SQL
          queryFile="Hrm/ShiftQueries"
          queryKey="GetPagedShifts"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, rows) => {
              setSelectedRowKeys(keys);
              setSelectedRows(rows);
            },
          }}
          toolBarRender={() => [
            isFilteringDeleted ? (
              <Button
                key="restore"
                icon={<UndoOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => handleBulkDelete(1)}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  color: '#fff',
                }}
              >
                BỎ XÓA ({selectedRowKeys.length})
              </Button>
            ) : (
              <TableActionBar
                key="actions"
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={() => handleBulkDelete(0)}
                addText="Thêm ca làm việc"
                selectedCount={selectedRowKeys.length}
              />
            ),
          ]}
          request={async (params) => {
            const res = await request<any>('/api/shifts', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword,
                status: filterStatus,
              },
            });

            return {
              data: res.data || [],
              success: res.isSuccess,
              total: res.totalRecords,
            };
          }}
          pagination={{ pageSize: 15 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Chỉnh sửa Ca làm việc' : 'Thêm mới Ca làm việc'}
        open={modalVisible}
        onOk={handleSave}
        confirmLoading={saving}
        onCancel={() => setModalVisible(false)}
        okText="Lưu vào CSDL"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã Ca Làm Việc"
                name="shiftCode"
                rules={[{ required: true }]}
              >
                <Input placeholder="Ví dụ: SHIFT_OFFICE" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên Ca Làm Việc"
                name="shiftName"
                rules={[{ required: true }]}
              >
                <Input placeholder="Ca Hành Chính" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giờ Bắt Đầu"
                name="startTime"
                rules={[{ required: true }]}
              >
                <Input placeholder="08:00:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giờ Kết Thúc"
                name="endTime"
                rules={[{ required: true }]}
              >
                <Input placeholder="17:00:00" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Số phút cho phép đi muộn (Grace Period)"
            name="gracePeriodMinutes"
          >
            <InputNumber min={0} max={60} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Trạng Thái Kích Hoạt"
            name="useFlag"
            valuePropName="checked"
          >
            <Checkbox>Kích hoạt (Active)</Checkbox>
          </Form.Item>

          <Form.Item label="Ghi Chú" name="comment">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ShiftList;
