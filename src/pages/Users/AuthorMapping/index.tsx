import { BaseTable } from '@/components/BaseTable';
import {
  CopyOutlined,
  DeleteOutlined,
  FolderOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
  TeamOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import React from 'react';
import { useAuthorMapping } from './hooks/useAuthorMapping';
import type { GroupUserItem, ProgramPermissionItem } from './types';

const AuthorMapping: React.FC = () => {
  const {
    groups,
    selectedGroupId,
    permissions,
    rawPermissions,
    loadingGroups,
    loadingPerms,
    saving,
    editingGroupId,
    setEditingGroupId,
    editingGroupName,
    setEditingGroupName,
    copyFromId,
    setCopyFromId,
    copyToId,
    setCopyToId,
    searchText,
    setSearchText,
    isDirty,
    drawerVisible,
    setDrawerVisible,
    groupUsers,
    loadingUsers,
    filterStatus,
    setFilterStatus,
    fetchGroups,
    handleSelectGroup,
    handleAddGroup,
    handleSaveGroupName,
    handleDeleteGroupSoft,
    handleRestoreGroup,
    handlePermissionChange,
    handleColumnCheckAll,
    handleSavePermissions,
    handleCopyGroup,
    handleOpenUserDrawer,
  } = useAuthorMapping();

  const isColumnChecked = (field: keyof ProgramPermissionItem) =>
    rawPermissions.length > 0 && rawPermissions.every((p) => p[field]);

  // BẢNG TRÁI: HIỂN THỊ THAO TÁC XÓA MỀM (DELETE) / BỎ XÓA (UNDO) THEO TRẠNG THÁI LỌC
  // Bảng Trái Cột Thao tác: Gọi đúng 2 hàm tương ứng
  const groupColumns = [
    { title: 'STT', dataIndex: 'groupId', key: 'groupId', width: 55 },
    {
      title: 'Author Name (Nhấp đúp sửa)',
      dataIndex: 'groupName',
      key: 'groupName',
      render: (text: string, record: any) => {
        const isEditing = editingGroupId === record.groupId;
        if (isEditing) {
          return (
            <Input
              size="small"
              value={editingGroupName}
              autoFocus
              onChange={(e) => setEditingGroupName(e.target.value)}
              onPressEnter={() => handleSaveGroupName(record.groupId)}
              onBlur={() => handleSaveGroupName(record.groupId)}
            />
          );
        }
        return (
          <div
            className="cursor-pointer select-none py-1"
            title="Nhấp đúp chuột để đổi tên nhóm"
            onDoubleClick={() => {
              if (record.useFlag) {
                setEditingGroupId(record.groupId);
                setEditingGroupName(record.groupName);
              }
            }}
          >
            <Space>
              <span
                className={
                  record.groupId === 1 ? 'font-bold text-blue-600' : ''
                }
              >
                {text}
              </span>
              {record.groupId === 1 && <Tag color="red">Lõi</Tag>}
            </Space>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 60,
      render: (_: any, record: any) => {
        if (record.groupId === 1) {
          return (
            <Tooltip title="Nhóm Hệ thống Lõi - Khóa cứng">
              <Tag color="default">Khóa</Tag>
            </Tooltip>
          );
        }

        // Nếu nhóm ở trạng thái Inactive (useFlag = false) -> Gọi hàm Khôi phục
        if (!record.useFlag) {
          return (
            <Tooltip title="Khôi phục Nhóm quyền">
              <Button
                size="small"
                type="text"
                icon={<UndoOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() =>
                  handleRestoreGroup(record.groupId, record.groupName)
                }
              />
            </Tooltip>
          );
        }

        // Mặc định hiện nút Xóa mềm
        return (
          <Popconfirm
            title="Xóa mềm nhóm quyền này?"
            onConfirm={() =>
              handleDeleteGroupSoft(record.groupId, record.groupName)
            }
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
  ];

  const permissionColumns: ProColumns<ProgramPermissionItem>[] = [
    { title: 'STT', valueType: 'index', width: 50, fixed: 'left' },
    {
      title: 'Program Desc',
      dataIndex: 'programName',
      width: 220,
      fixed: 'left',
      render: (text: any, record: ProgramPermissionItem) => {
        const isParent = record.level === 1;
        return (
          <div
            style={{
              paddingLeft: isParent ? 0 : 20,
              fontWeight: isParent ? 'bold' : 'normal',
              color: isParent ? '#1890ff' : 'inherit',
            }}
          >
            {isParent ? (
              <FolderOutlined className="mr-1" />
            ) : (
              <span className="text-gray-400 mr-1">└──</span>
            )}
            {text}
          </div>
        );
      },
    },
    {
      title: (
        <Space size={2}>
          <Checkbox
            checked={isColumnChecked('all')}
            onChange={(e) => handleColumnCheckAll('all', e.target.checked)}
          />
          <b>All</b>
        </Space>
      ),
      dataIndex: 'all',
      width: 65,
      render: (val: any, record: ProgramPermissionItem) => (
        <Checkbox
          checked={!!val}
          onChange={(e) =>
            handlePermissionChange(record.programId, 'all', e.target.checked)
          }
        />
      ),
    },
    {
      title: (
        <Space size={2}>
          <Checkbox
            checked={isColumnChecked('isSearch')}
            onChange={(e) => handleColumnCheckAll('isSearch', e.target.checked)}
          />
          Search
        </Space>
      ),
      dataIndex: 'isSearch',
      width: 80,
      render: (val: any, record: ProgramPermissionItem) => (
        <Checkbox
          checked={!!val}
          onChange={(e) =>
            handlePermissionChange(
              record.programId,
              'isSearch',
              e.target.checked,
            )
          }
        />
      ),
    },
    {
      title: (
        <Space size={2}>
          <Checkbox
            checked={isColumnChecked('isCreate')}
            onChange={(e) => handleColumnCheckAll('isCreate', e.target.checked)}
          />
          Create
        </Space>
      ),
      dataIndex: 'isCreate',
      width: 80,
      render: (val: any, record: ProgramPermissionItem) => (
        <Checkbox
          checked={!!val}
          onChange={(e) =>
            handlePermissionChange(
              record.programId,
              'isCreate',
              e.target.checked,
            )
          }
        />
      ),
    },
    {
      title: (
        <Space size={2}>
          <Checkbox
            checked={isColumnChecked('isUpdate')}
            onChange={(e) => handleColumnCheckAll('isUpdate', e.target.checked)}
          />
          Update
        </Space>
      ),
      dataIndex: 'isUpdate',
      width: 80,
      render: (val: any, record: ProgramPermissionItem) => (
        <Checkbox
          checked={!!val}
          onChange={(e) =>
            handlePermissionChange(
              record.programId,
              'isUpdate',
              e.target.checked,
            )
          }
        />
      ),
    },
    {
      title: (
        <Space size={2}>
          <Checkbox
            checked={isColumnChecked('isDelete')}
            onChange={(e) => handleColumnCheckAll('isDelete', e.target.checked)}
          />
          Delete
        </Space>
      ),
      dataIndex: 'isDelete',
      width: 80,
      render: (val: any, record: ProgramPermissionItem) => (
        <Checkbox
          checked={!!val}
          onChange={(e) =>
            handlePermissionChange(
              record.programId,
              'isDelete',
              e.target.checked,
            )
          }
        />
      ),
    },
    {
      title: (
        <Space size={2}>
          <Checkbox
            checked={isColumnChecked('isSave')}
            onChange={(e) => handleColumnCheckAll('isSave', e.target.checked)}
          />
          Save
        </Space>
      ),
      dataIndex: 'isSave',
      width: 80,
      render: (val: any, record: ProgramPermissionItem) => (
        <Checkbox
          checked={!!val}
          onChange={(e) =>
            handlePermissionChange(record.programId, 'isSave', e.target.checked)
          }
        />
      ),
    },
    {
      title: (
        <Space size={2}>
          <Checkbox
            checked={isColumnChecked('isPrint')}
            onChange={(e) => handleColumnCheckAll('isPrint', e.target.checked)}
          />
          Print
        </Space>
      ),
      dataIndex: 'isPrint',
      width: 80,
      render: (val: any, record: ProgramPermissionItem) => (
        <Checkbox
          checked={!!val}
          onChange={(e) =>
            handlePermissionChange(
              record.programId,
              'isPrint',
              e.target.checked,
            )
          }
        />
      ),
    },
    { title: 'Level', dataIndex: 'level', width: 65 },
    { title: 'Program Key', dataIndex: 'programKey', width: 110 },
  ];

  return (
    <PageContainer
      header={{
        title: (
          <Space size="middle">
            <span>Permission Mapping (Phân quyền người dùng)</span>
            {isDirty && (
              <Tag color="warning">⚠️ Có thay đổi chưa lưu vào CSDL</Tag>
            )}
          </Space>
        ),
        extra: [
          <Space key="actions">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchGroups}
              style={{ backgroundColor: '#34495e', borderColor: '#34495e' }}
            >
              SEARCH
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSavePermissions}
              style={{ backgroundColor: '#00A651', borderColor: '#00A651' }}
            >
              UPDATE (LƯU VÀO CSDL)
            </Button>
          </Space>,
        ],
      }}
    >
      <Row gutter={[16, 16]}>
        {/* BẢNG TRÁI: DANH SÁCH NHÓM QUYỀN (TÍCH HỢP BỘ LỌC TRẠNG THÁI ACTIVE/INACTIVE) */}
        <Col xs={24} lg={8}>
          <Card
            title="Author Group"
            size="small"
            loading={loadingGroups}
            extra={
              <Space>
                <Select
                  size="small"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 140 }}
                  options={[
                    { label: 'Hoạt động (Active)', value: true },
                    { label: 'Đã xóa (Inactive)', value: false },
                  ]}
                />
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleAddGroup}
                >
                  Thêm Nhóm
                </Button>
              </Space>
            }
          >
            <Table
              bordered
              dataSource={groups}
              columns={groupColumns}
              pagination={false}
              size="small"
              rowKey="groupId"
              style={{ cursor: 'pointer' }}
              rowClassName={(record) =>
                record.groupId === selectedGroupId
                  ? 'bg-blue-50 font-bold border-l-4 border-blue-500'
                  : ''
              }
              onRow={(record) => ({
                onClick: () => {
                  if (record.useFlag) {
                    handleSelectGroup(record.groupId);
                  } else {
                    message.warning(
                      'Nhóm đã bị xóa, hãy khôi phục (Bỏ xóa) trước khi phân quyền!',
                    );
                  }
                },
              })}
            />
          </Card>
        </Col>

        {/* BẢNG PHẢI: MA TRẬN PHÂN QUYỀN (ĐÃ LOẠI BỎ NÚT XUẤT EXCEL THỪA) */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>Author Group Mapping</span>
                <Button icon={<TeamOutlined />} onClick={handleOpenUserDrawer}>
                  Danh sách User
                </Button>
              </Space>
            }
            size="small"
            loading={loadingPerms}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <Space wrap>
                <Select
                  placeholder="Group (From)"
                  style={{ width: 160 }}
                  value={copyFromId}
                  onChange={setCopyFromId}
                  options={groups.map((g) => ({
                    label: g.groupName,
                    value: g.groupId,
                  }))}
                  allowClear
                />
                <Select
                  placeholder="Group (To)"
                  style={{ width: 160 }}
                  value={copyToId}
                  onChange={setCopyToId}
                  options={groups.map((g) => ({
                    label: g.groupName,
                    value: g.groupId,
                  }))}
                  allowClear
                />
                <Button icon={<CopyOutlined />} onClick={handleCopyGroup}>
                  Copy Nhóm Quyền
                </Button>
              </Space>

              <Input.Search
                placeholder="🔍 Tìm tên hoặc Mã chương trình..."
                style={{ width: 240 }}
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <BaseTable<ProgramPermissionItem>
              search={false}
              dataSource={permissions}
              columns={permissionColumns}
              rowKey="programId"
              pagination={false}
              toolBarRender={false}
              scroll={{ y: 'calc(100vh - 430px)', x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>

      <Drawer
        title="Danh sách Người dùng thuộc Nhóm quyền"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Table<GroupUserItem>
          bordered
          loading={loadingUsers}
          dataSource={groupUsers}
          rowKey="userId"
          pagination={{ pageSize: 10 }}
          size="small"
          columns={[
            { title: 'Mã NV', dataIndex: 'userCode', width: 100 },
            { title: 'Họ và Tên', dataIndex: 'fullName' },
            { title: 'Email', dataIndex: 'email' },
            {
              title: 'Nhà máy',
              dataIndex: 'plant',
              width: 100,
              render: (plant: string) => <Tag color="blue">{plant}</Tag>,
            },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};

export default AuthorMapping;
