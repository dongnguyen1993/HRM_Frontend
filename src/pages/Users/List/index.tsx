import { BaseTable } from '@/components/BaseTable';
import { TableActionBar } from '@/components/TableActionBar';
import { TableFilterCard } from '@/components/TableFilterCard';
import {
  DownloadOutlined,
  UndoOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, Card, Col, Input, Select, Space, Tag } from 'antd';
import React from 'react';
import ImportModal from './components/ImportModal';
import UserModal from './components/UserModal';
import { useUserList } from './hooks/useUserList';
import type { UserItem } from './types';

export const UserList: React.FC = () => {
  const {
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    setSelectedRows,
    searchKeyword,
    setSearchKeyword,
    filterStatus,
    setFilterStatus,
    filterPlant,
    setFilterPlant,
    plantOptions,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    modalType,
    currentRow,
    handleAdd,
    handleEdit,
    handleOpenImportModal,
    handleSaveUser,
    handleBulkDelete,
    handleExportExcel,
    handleSearch,
    handleReset,
  } = useUserList();

  const columns: ProColumns<UserItem>[] = [
    { title: 'STT', valueType: 'index', width: 60, fixed: 'left' },
    { title: 'Plant', dataIndex: 'plant', width: 110, fixed: 'left' },
    { title: 'User ID', dataIndex: 'userCode', width: 120 },
    { title: 'User Name', dataIndex: 'fullName', width: 180 },
    {
      title: 'Use Flag',
      dataIndex: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    { title: 'Author Group ID', dataIndex: 'authorGroupId', width: 160 },
    { title: 'Comment', dataIndex: 'comment', width: 180 },
    {
      title: 'Create Time',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
      render: (val: any) => val || 'ADMIN',
    },
    { title: 'Create User', dataIndex: 'createdBy', width: 120 },
    {
      title: 'Update Time',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      width: 160,
      render: (val: any) => (val ? val : '-'),
    },
    {
      title: 'Update User',
      dataIndex: 'updatedBy',
      width: 120,
      render: (val: any) => val || '-',
    },
  ];

  const isFilteringDeleted = filterStatus === 0;

  return (
    <PageContainer title="User Management (Quản lý Tài khoản & Nhân sự)">
      {/* 1. KHỐI TÌM KIẾM */}
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Tìm kiếm:</span>
            <Input
              placeholder="Tìm theo tên, ID, email..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Nhà máy:</span>
            <Select
              placeholder="Tất cả Nhà máy"
              style={{ width: '100%', minWidth: 160 }}
              value={filterPlant}
              onChange={setFilterPlant}
              allowClear
              options={plantOptions.map((p) => ({ label: p, value: p }))}
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
                { label: 'Đang hoạt động (Active)', value: 1 },
                { label: 'Đã xóa / Khóa (Deleted)', value: 0 },
              ]}
            />
          </Space>
        </Col>
      </TableFilterCard>

      {/* 2. BẢNG DỮ LIỆU & TOOLBAR */}
      <Card size="small">
        <BaseTable<UserItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="secureId"
          search={false}
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
                addText="Thêm mới"
                selectedCount={selectedRowKeys.length}
                extraButtons={
                  <>
                    <Button
                      icon={<UploadOutlined />}
                      onClick={handleOpenImportModal}
                    >
                      Nhập Excel
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleExportExcel}
                      style={{
                        backgroundColor: '#00A651',
                        borderColor: '#00A651',
                        color: '#fff',
                      }}
                    >
                      Xuất Excel
                    </Button>
                  </>
                }
              />
            ),
          ]}
          request={async (params) => {
            const res = await request<any>('/api/users', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword,
                status: filterStatus,
                plant: filterPlant,
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

      {/* 3. MODAL THÊM / SỬA TÀI KHOẢN NHÂN SỰ (ĐÃ BỔ SUNG ĐẦY ĐỦ TRONG JSX) */}
      <UserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        type={modalType}
        currentRow={currentRow}
        onFinish={handleSaveUser}
        handleUploadAvatar={async () => true}
        handleUploadContract={async () => true}
      />

      {/* 4. MODAL NHẬP DỮ LIỆU EXCEL (ĐÃ BỔ SUNG ĐẦY ĐỦ TRONG JSX) */}
      <ImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSuccess={() => tableRef.current?.reload()}
      />
    </PageContainer>
  );
};

export default UserList;
