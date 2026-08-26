import { BaseTable } from '@/components/BaseTable';
import { TableActionBar } from '@/components/TableActionBar';
import { TableFilterCard } from '@/components/TableFilterCard';
import { UndoOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Button,
  Card,
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
import { useContract } from './hooks/useContract';
import type { LaborContractItem } from './types';

export const ContractList: React.FC = () => {
  const {
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterContractType,
    setFilterContractType,
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
  } = useContract();

  const columns: ProColumns<LaborContractItem>[] = [
    { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
    {
      title: 'Số Hợp Đồng',
      dataIndex: 'contractNo',
      width: 140,
      fixed: 'left',
    },
    { title: 'Mã NV', dataIndex: 'userCode', width: 110 },
    { title: 'Họ và Tên', dataIndex: 'fullName', width: 180 },
    {
      title: 'Loại Hợp Đồng',
      dataIndex: 'contractType',
      width: 140,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Lương Đóng BHXH',
      dataIndex: 'insuranceSalary',
      width: 150,
      valueType: 'money',
    },
    { title: 'Ngày Ký', dataIndex: 'signDate', valueType: 'date', width: 120 },
    {
      title: 'Ngày Bắt Đầu',
      dataIndex: 'startDate',
      valueType: 'date',
      width: 120,
    },
    {
      title: 'Ngày Hết Hạn',
      dataIndex: 'endDate',
      valueType: 'date',
      width: 120,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      width: 130,
      render: (st: number) => (
        <Tag color={st === 1 ? 'green' : 'red'}>
          {st === 1 ? 'Hiệu Lực' : 'Hết Hạn'}
        </Tag>
      ),
    },
  ];

  const isFilteringDeleted = filterStatus === 0;

  return (
    <PageContainer title="Contract Management (Quản lý Hợp đồng Lao động)">
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Tìm kiếm:</span>
            <Input
              placeholder="Tìm Số HĐ, Mã NV, Họ tên..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 80 }}>Loại HĐ:</span>
            <Select
              placeholder="Tất cả Loại HĐ"
              style={{ width: '100%' }}
              value={filterContractType}
              onChange={setFilterContractType}
              allowClear
              options={[
                { label: 'Thử việc', value: 'Thử việc' },
                { label: '1 Năm', value: '1 Năm' },
                { label: 'Không thời hạn', value: 'Không thời hạn' },
              ]}
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 80 }}>Trạng thái:</span>
            <Select
              placeholder="Tất cả Trạng thái"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              options={[
                { label: 'Đang hiệu lực (Active)', value: 1 },
                { label: 'Đã hết hạn / Khóa (Inactive)', value: 0 },
              ]}
            />
          </Space>
        </Col>
      </TableFilterCard>

      <Card size="small">
        <BaseTable<LaborContractItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="contractId"
          search={false}
          // BỔ SUNG 2 DÒNG NÀY ĐỂ KÍCH HOẠT NÚT SHOW SQL
          queryFile="HumanResource/LaborContractQueries"
          queryKey="GetPagedContracts"
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
                addText="+ Thêm mới hợp đồng"
                selectedCount={selectedRowKeys.length}
              />
            ),
          ]}
          request={async (params) => {
            const res = await request<any>('/api/labor-contracts', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword,
                contractType: filterContractType || '',
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
            ? 'Chỉnh sửa Hợp đồng Lao động'
            : 'Thêm mới Hợp đồng Lao động'
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
                label="Số Hợp Đồng"
                name="contractNo"
                rules={[{ required: true }]}
              >
                <Input placeholder="Ví dụ: HD2026/001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="User ID (Mã NV)"
                name="userId"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="Nhập ID nhân viên (vd: 1)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại Hợp Đồng"
                name="contractType"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: 'Thử việc', value: 'Thử việc' },
                    { label: '1 Năm', value: '1 Năm' },
                    { label: 'Không thời hạn', value: 'Không thời hạn' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Lương Đóng BHXH (VNĐ)"
                name="insuranceSalary"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(val) =>
                    `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                />
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

export default ContractList;
