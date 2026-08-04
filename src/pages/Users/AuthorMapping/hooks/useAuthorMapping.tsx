import { request } from '@umijs/max';
import { message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import type {
  AuthorGroupItem,
  GroupUserItem,
  ProgramPermissionItem,
} from '../types';

export function useAuthorMapping() {
  const [groups, setGroups] = useState<AuthorGroupItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<ProgramPermissionItem[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [loadingPerms, setLoadingPerms] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');

  const [copyFromId, setCopyFromId] = useState<number | null>(null);
  const [copyToId, setCopyToId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [groupUsers, setGroupUsers] = useState<GroupUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Ô LỌC TRẠNG THÁI ACTIVE / INACTIVE CHO NHÓM QUYỀN
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(true);

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await request<any>('/api/permission/groups', {
        method: 'GET',
        params: { status: filterStatus }, // Truyền trạng thái lọc
      });
      if (res && res.isSuccess) {
        setGroups(res.data || []);
        if (res.data && res.data.length > 0 && selectedGroupId === null) {
          setSelectedGroupId(res.data[0].groupId);
        }
      }
    } catch {
      message.error('Lỗi khi tải danh sách nhóm quyền');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchPermissions = async (groupId: number) => {
    setLoadingPerms(true);
    try {
      const res = await request<any>(`/api/permission/groups/${groupId}`, {
        method: 'GET',
      });
      if (res && res.isSuccess) {
        const formatted = (res.data || []).map((p: ProgramPermissionItem) => ({
          ...p,
          all:
            p.isSearch &&
            p.isCreate &&
            p.isUpdate &&
            p.isDelete &&
            p.isSave &&
            p.isPrint,
        }));
        setPermissions(formatted);
        setIsDirty(false);
      }
    } catch {
      message.error('Lỗi khi tải ma trận phân quyền');
    } finally {
      setLoadingPerms(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [filterStatus]); // Tải lại nhóm quyền khi thay đổi Combobox trạng thái lọc

  useEffect(() => {
    if (selectedGroupId !== null) {
      fetchPermissions(selectedGroupId);
    }
  }, [selectedGroupId]);

  const handleAddGroup = () => {
    let newGroupName = '';
    Modal.confirm({
      title: 'Tạo Nhóm quyền Mới',
      content: (
        <div className="mt-2">
          <input
            className="w-full p-2 border rounded border-gray-300 focus:outline-none"
            placeholder="Nhập tên nhóm..."
            onChange={(e) => (newGroupName = e.target.value)}
          />
        </div>
      ),
      onOk: async () => {
        if (!newGroupName.trim()) {
          message.warning('Tên nhóm không được trống!');
          return;
        }
        try {
          const res = await request<any>('/api/permission/groups', {
            method: 'POST',
            data: { groupName: newGroupName },
          });
          if (res && res.isSuccess) {
            message.success('Tạo nhóm quyền thành công!');
            fetchGroups();
          }
        } catch {
          message.error('Lỗi khi tạo nhóm');
        }
      },
    });
  };

  const handleSaveGroupName = async (groupId: number) => {
    if (!editingGroupName.trim()) {
      setEditingGroupId(null);
      return;
    }
    try {
      const res = await request<any>(`/api/permission/groups/${groupId}/name`, {
        method: 'PUT',
        data: { groupName: editingGroupName },
      });
      if (res && res.isSuccess) {
        message.success('Đã đổi tên nhóm thành công!');
        fetchGroups();
      }
    } catch {
      message.error('Lỗi khi đổi tên nhóm');
    } finally {
      setEditingGroupId(null);
    }
  };

  const handleSelectGroup = (targetGroupId: number) => {
    if (targetGroupId === selectedGroupId) return;
    if (isDirty) {
      Modal.confirm({
        title: 'Cảnh báo chưa lưu dữ liệu!',
        content:
          'Dữ liệu đã thay đổi nhưng chưa lưu vào CSDL. Bạn có chắc muốn chuyển nhóm?',
        onOk: () => {
          setSelectedGroupId(targetGroupId);
          setIsDirty(false);
        },
      });
    } else {
      setSelectedGroupId(targetGroupId);
    }
  };

  const handlePermissionChange = (
    programId: number,
    field: keyof ProgramPermissionItem,
    checked: boolean,
  ) => {
    setIsDirty(true);
    setPermissions((prevPerms) =>
      prevPerms.map((p) => {
        if (p.programId === programId) {
          if (field === 'all') {
            return {
              ...p,
              all: checked,
              isSearch: checked,
              isCreate: checked,
              isUpdate: checked,
              isDelete: checked,
              isSave: checked,
              isPrint: checked,
            };
          }
          const updated = { ...p, [field]: checked };
          updated.all =
            updated.isSearch &&
            updated.isCreate &&
            updated.isUpdate &&
            updated.isDelete &&
            updated.isSave &&
            updated.isPrint;
          return updated;
        }
        return p;
      }),
    );
  };

  const handleColumnCheckAll = (
    field: keyof ProgramPermissionItem,
    checked: boolean,
  ) => {
    setIsDirty(true);
    setPermissions((prevPerms) =>
      prevPerms.map((p) => {
        if (field === 'all') {
          return {
            ...p,
            all: checked,
            isSearch: checked,
            isCreate: checked,
            isUpdate: checked,
            isDelete: checked,
            isSave: checked,
            isPrint: checked,
          };
        }
        const updated = { ...p, [field]: checked };
        updated.all =
          updated.isSearch &&
          updated.isCreate &&
          updated.isUpdate &&
          updated.isDelete &&
          updated.isSave &&
          updated.isPrint;
        return updated;
      }),
    );
  };

  const handleSavePermissions = async () => {
    if (selectedGroupId === null) return;
    setSaving(true);
    try {
      const payload = permissions.map((p) => ({
        programId: p.programId,
        isSearch: p.isSearch,
        isCreate: p.isCreate,
        isUpdate: p.isUpdate,
        isDelete: p.isDelete,
        isSave: p.isSave,
        isPrint: p.isPrint,
      }));

      const res = await request<any>(
        `/api/permission/groups/${selectedGroupId}`,
        {
          method: 'POST',
          data: payload,
        },
      );

      if (res && res.isSuccess) {
        message.success(
          'Cập nhật ma trận phân quyền & Ghi log audit thành công!',
        );
        setIsDirty(false);
        fetchPermissions(selectedGroupId);
      }
    } catch {
      message.error('Lỗi khi lưu phân quyền');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyGroup = async () => {
    if (!copyFromId || !copyToId) {
      message.warning('Vui lòng chọn Nhóm nguồn và Nhóm đích!');
      return;
    }
    try {
      message.loading('Đang sao chép...');
      const res = await request<any>('/api/permission/groups/copy', {
        method: 'POST',
        data: { sourceGroupId: copyFromId, targetGroupId: copyToId },
      });
      if (res && res.isSuccess) {
        message.success('Sao chép phân quyền thành công!');
        if (selectedGroupId === copyToId) fetchPermissions(copyToId);
      }
    } catch {
      message.error('Lỗi khi sao chép nhóm');
    }
  };

  const handleOpenUserDrawer = async () => {
    if (!selectedGroupId) return;
    setDrawerVisible(true);
    setLoadingUsers(true);
    try {
      const res = await request<any>(
        `/api/permission/groups/${selectedGroupId}/users`,
        { method: 'GET' },
      );
      if (res && res.isSuccess) setGroupUsers(res.data || []);
    } catch {
      message.error('Lỗi khi lấy danh sách user thuộc nhóm');
    } finally {
      setLoadingUsers(false);
    }
  };

  // 1. HÀM XÓA MỀM NHÓM QUYỀN (GỌI API DELETE)
  const handleDeleteGroupSoft = (groupId: number, groupName: string) => {
    if (groupId === 1) {
      message.error('KHÔNG THỂ XÓA NHÓM HỆ THỐNG LÕI (ADMINISTRATOR)!');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận xóa mềm nhóm quyền',
      content: `Bạn có chắc chắn muốn xóa mềm nhóm [${groupName}]?`,
      okText: 'Xóa mềm',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await request<any>(`/api/permission/groups/${groupId}`, {
            method: 'DELETE',
          });
          if (res && res.isSuccess) {
            message.success('Xóa mềm nhóm quyền thành công!');
            if (selectedGroupId === groupId) {
              setSelectedGroupId(1);
            }
            fetchGroups();
          } else {
            message.error(res?.message || 'Xóa thất bại');
          }
        } catch {
          message.error('Lỗi khi xóa mềm nhóm quyền');
        }
      },
    });
  };

  // 2. HÀM KHÔI PHỤC NHÓM QUYỀN (GỌI API PUT /restore)
  const handleRestoreGroup = (groupId: number, groupName: string) => {
    Modal.confirm({
      title: 'Xác nhận khôi phục nhóm quyền',
      content: `Bạn có chắc chắn muốn khôi phục nhóm [${groupName}]?`,
      okText: 'Khôi phục',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await request<any>(
            `/api/permission/groups/${groupId}/restore`,
            {
              method: 'PUT',
            },
          );
          if (res && res.isSuccess) {
            message.success('Khôi phục nhóm quyền thành công!');
            fetchGroups();
          } else {
            message.error(res?.message || 'Khôi phục thất bại');
          }
        } catch {
          message.error('Lỗi khi khôi phục nhóm quyền');
        }
      },
    });
  };

  const filteredPermissions = permissions.filter(
    (p) =>
      p.programName.toLowerCase().includes(searchText.toLowerCase()) ||
      p.programKey.toLowerCase().includes(searchText.toLowerCase()),
  );

  return {
    groups,
    selectedGroupId,
    permissions: filteredPermissions,
    rawPermissions: permissions,
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
    handlePermissionChange,
    handleColumnCheckAll,
    handleSavePermissions,
    handleCopyGroup,
    handleOpenUserDrawer,
    handleDeleteGroupSoft,
    handleRestoreGroup,
  };
}
