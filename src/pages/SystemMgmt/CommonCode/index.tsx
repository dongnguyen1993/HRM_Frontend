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
import { useCommonCode } from './hooks/useCommonCode';
import type { CommonCodeItem } from './types';

export const CommonCodeList: React.FC = () => {
  const {
    groups,
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterGroupCode,
    setFilterGroupCode,
    filterStatus,
    setFilterStatus,
    modalVisible,
    setModalVisible,
    editingItem,
    actionLoading,
    form,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleSave,
    handleBulkDelete,
  } = useCommonCode();

  const columns: ProColumns<CommonCodeItem>[] = [
    { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
    { title: 'Group Code', dataIndex: 'groupCode', width: 130, fixed: 'left' },
    { title: 'Group Name (Tên Nhóm)', dataIndex: 'groupName', width: 200 },
    { title: 'Code (Mã)', dataIndex: 'code', width: 140 },
    { title: 'Code Name (Tên Hiển Thị)', dataIndex: 'codeName', width: 220 },
    {
      title: 'Use Flag',
      dataIndex: 'useFlag',
      width: 100,
      render: (flag: boolean) => (
        <Tag color={flag ? 'green' : 'red'}>{flag ? 'Yes' : 'No'}</Tag>
      ),
    },
    { title: 'Sort', dataIndex: 'sortOrder', width: 80 },
    { title: 'Comment', dataIndex: 'comment', width: 180 },
    {
      title: 'Create Time',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
    },
    { title: 'Create User', dataIndex: 'createdBy', width: 120 },
    {
      title: 'Update Time',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      width: 160,
    },
    { title: 'Update User', dataIndex: 'updatedBy', width: 120 },
  ];

  const isFilteringDeleted = filterStatus === false;

  return (
    <PageContainer title="Common Code (Quản lý Từ điển Dữ liệu Gốc)">
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Tìm kiếm:</span>
            <Input
              placeholder="Tìm theo Mã, Tên, Nhóm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Nhóm mã:</span>
            <Select
              placeholder="Tất cả Nhóm mã"
              style={{ width: '100%', minWidth: 160 }}
              value={filterGroupCode}
              onChange={setFilterGroupCode}
              allowClear
              options={groups.map((g) => ({
                label: `${g.groupName} (${g.groupCode})`,
                value: g.groupCode,
              }))}
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Trạng thái:</span>
            <Select
              placeholder="Tất cả Trạng thái"
              style={{ width: '100%', minWidth: 160 }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              options={[
                { label: 'Đang hoạt động (Active)', value: true },
                { label: 'Đã xóa / Khóa (Deleted)', value: false },
              ]}
            />
          </Space>
        </Col>
      </TableFilterCard>

      <Card size="small">
        <BaseTable<CommonCodeItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="codeId"
          search={false}
          // BỔ SUNG 2 DÒNG NÀY ĐỂ KÍCH HOẠT NÚT SHOW SQL
          queryFile="SystemMgmt/CommonCodeQueries"
          queryKey="GetPagedCommonCodes"
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
                addText="Thêm mới mã dùng chung"
                selectedCount={selectedRowKeys.length}
              />
            ),
          ]}
          request={async (params) => {
            const res = await request<any>('/api/common-code', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword,
                groupCode: filterGroupCode || '',
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
        title={editingItem ? 'Sửa Mã Dùng Chung' : 'Thêm mới Mã Dùng Chung'}
        open={modalVisible}
        onOk={handleSave}
        confirmLoading={actionLoading}
        onCancel={() => setModalVisible(false)}
        okText="Lưu vào CSDL"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã Nhóm (Group Code)"
                name="groupCode"
                rules={[{ required: true, message: 'Nhập mã nhóm' }]}
              >
                <Input placeholder="Ví dụ: PLANT" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên Nhóm (Group Name)"
                name="groupName"
                rules={[{ required: true, message: 'Nhập tên nhóm' }]}
              >
                <Input placeholder="Ví dụ: Danh mục Nhà máy" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã Chi Tiết (Code)"
                name="code"
                rules={[{ required: true, message: 'Nhập mã chi tiết' }]}
              >
                <Input placeholder="Ví dụ: TECH_H" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên Hiển Thị (Code Name)"
                name="codeName"
                rules={[{ required: true, message: 'Nhập tên hiển thị' }]}
              >
                <Input placeholder="Ví dụ: Technics H (Bắc Ninh)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Thứ Tự Sắp Xếp" name="sortOrder">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Trạng Thái Kích Hoạt"
                name="useFlag"
                valuePropName="checked"
              >
                <Checkbox>Kích hoạt (Active)</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi Chú" name="comment">
            <Input.TextArea rows={2} placeholder="Nhập ghi chú bổ sung..." />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default CommonCodeList;
