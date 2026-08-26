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
import { useLeaveType } from './hooks/useLeaveType';
import type { LeaveTypeItem } from './types';

export const LeaveTypeList: React.FC = () => {
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
  } = useLeaveType();

  const columns: ProColumns<LeaveTypeItem>[] = [
    { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
    {
      title: 'Mã Loại Phép',
      dataIndex: 'leaveTypeCode',
      width: 130,
      fixed: 'left',
    },
    { title: 'Tên Chế Độ Nghỉ Phép', dataIndex: 'leaveTypeName', width: 240 },
    { title: 'Số Ngày/Năm', dataIndex: 'daysPerYear', width: 120 },
    {
      title: 'Hưởng Lương',
      dataIndex: 'isPaid',
      width: 140,
      render: (paid: boolean) => (
        <Tag color={paid ? 'green' : 'orange'}>
          {paid ? 'Có hưởng lương' : 'Không hưởng lương'}
        </Tag>
      ),
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
    <PageContainer title="Leave Settings (Cấu hình Chế độ Nghỉ phép)">
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={12}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Tìm kiếm:</span>
            <Input
              placeholder="Tìm Mã, Tên chế độ nghỉ phép..."
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
        <BaseTable<LeaveTypeItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="leaveTypeId"
          search={false}
          // BỔ SUNG 2 DÒNG NÀY ĐỂ KÍCH HOẠT NÚT SHOW SQL
          queryFile="HumanResource/LeaveTypeQueries"
          queryKey="GetPagedLeaveTypes"
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
                addText="Thêm loại phép"
                selectedCount={selectedRowKeys.length}
              />
            ),
          ]}
          request={async (params) => {
            const res = await request<any>('/api/leave-types', {
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
        title={
          editingItem
            ? 'Chỉnh sửa Chế độ Nghỉ phép'
            : 'Thêm mới Chế độ Nghỉ phép'
        }
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
                label="Mã Loại Phép"
                name="leaveTypeCode"
                rules={[{ required: true }]}
              >
                <Input placeholder="Ví dụ: AL, SL, ML" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên Chế Độ Nghỉ Phép"
                name="leaveTypeName"
                rules={[{ required: true }]}
              >
                <Input placeholder="Nghỉ Phép Năm Hưởng Lương" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số Ngày Được Hưởng / Năm" name="daysPerYear">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Có Hưởng Lương không?"
                name="isPaid"
                valuePropName="checked"
              >
                <Checkbox>Có Hưởng Lương</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi Chú" name="comment">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default LeaveTypeList;
