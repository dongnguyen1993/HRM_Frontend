import * as userService from '@/services/userService';
import { message, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { UserItem } from '../types';

export function useUserList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<UserItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>(1);
  const [filterPlant, setFilterPlant] = useState<string | undefined>(undefined);
  const [plantOptions, setPlantOptions] = useState<string[]>([]);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'create' | 'update'>('create');
  const [currentRow, setCurrentRow] = useState<UserItem | undefined>(undefined);

  const tableRef = useRef<any>();

  // Tải danh sách Nhà máy
  useEffect(() => {
    userService.getPlants().then((res) => {
      if (res && res.isSuccess && res.data) {
        setPlantOptions(res.data);
      }
    });
  }, []);

  const handleSearch = () => {
    tableRef.current?.reload();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setFilterStatus(1);
    setFilterPlant(undefined);
    setTimeout(() => {
      tableRef.current?.reload();
    }, 100);
  };

  const handleAdd = () => {
    setModalType('create');
    setCurrentRow(undefined);
    setIsCreateModalOpen(true);
  };

  const handleEdit = async () => {
    if (selectedRows.length !== 1) {
      message.warning('Vui lòng chọn duy nhất 1 nhân viên để sửa!');
      return;
    }

    const selectedSecureId = selectedRows[0].secureId;

    try {
      message.loading('Đang nạp chi tiết danh sách tệp đính kèm...', 0.5);
      // Gọi API lấy đầy đủ chi tiết bao gồm toàn bộ danh sách tệp đính kèm từ CSDL
      const res = await userService.getUserById(selectedSecureId);

      if (res && res.isSuccess && res.data) {
        setCurrentRow(res.data); // Nạp đối tượng User chứa đủ 5 file đính kèm
      } else {
        setCurrentRow(selectedRows[0]);
      }
    } catch {
      setCurrentRow(selectedRows[0]);
    } finally {
      setModalType('update');
      setIsCreateModalOpen(true);
    }
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  // Xử lý Lưu người dùng (Thêm/Sửa + Upload file giao dịch)
  const handleSaveUser = async (
    values: Partial<UserItem>,
    stagedData: {
      avatarFile: File | null;
      contractFiles: File[];
      deletedAttachmentIds: number[];
    },
  ) => {
    try {
      message.loading('Đang xử lý dữ liệu nhân sự...', 1);
      let userSecureId = currentRow?.secureId;

      if (modalType === 'create') {
        const createRes = await userService.createUser(values);
        // NẾU THẤT BẠI (TRÙNG MÃ NV/EMAIL) -> Hiển thị chính xác câu thông báo từ CSDL
        if (!createRes || !createRes.isSuccess || !createRes.data) {
          message.error(
            createRes?.message ||
              'Mã nhân viên hoặc Email đã tồn tại trên hệ thống!',
          );
          return false;
        }
        userSecureId = createRes.data;
      } else if (userSecureId) {
        const updateRes = await userService.updateUser(userSecureId, values);
        if (!updateRes || !updateRes.isSuccess) {
          message.error(
            updateRes?.message || 'Cập nhật thông tin nhân viên thất bại!',
          );
          return false;
        }
      }

      if (!userSecureId) return false;

      // Xử lý xóa tệp tin đính kèm
      if (stagedData.deletedAttachmentIds.length > 0) {
        for (const attId of stagedData.deletedAttachmentIds) {
          await userService.deleteAttachment(attId);
        }
      }

      // Xử lý upload avatar
      if (stagedData.avatarFile) {
        await userService.uploadAvatar(userSecureId, stagedData.avatarFile);
      }

      // Xử lý upload hợp đồng
      if (stagedData.contractFiles.length > 0) {
        await Promise.all(
          stagedData.contractFiles.map((file) =>
            userService.uploadContract(userSecureId!, file),
          ),
        );
      }

      message.success(
        modalType === 'create'
          ? 'Tạo mới nhân viên thành công!'
          : 'Cập nhật nhân viên thành công!',
      );
      setIsCreateModalOpen(false);
      tableRef.current?.reload();
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message;
      message.error(
        errorMsg || 'Mã nhân viên hoặc Email đã bị trùng lặp trên hệ thống!',
      );
      return false;
    }
  };

  // Xử lý Xóa mềm / Khôi phục hàng loạt
  const handleBulkDelete = (status: number = 0) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 nhân viên!');
      return;
    }

    const isRestore = status === 1;
    const actionText = isRestore ? 'khôi phục' : 'xóa mềm';

    Modal.confirm({
      title: `Xác nhận ${actionText} tài khoản`,
      content: `Bạn có chắc chắn muốn ${actionText} ${selectedRowKeys.length} tài khoản nhân sự đã chọn?`,
      okText: isRestore ? 'Khôi phục' : 'Xóa',
      okType: isRestore ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await userService.bulkDeleteUsers(
            selectedRowKeys as string[],
            status,
          );
          if (res && res.isSuccess) {
            message.success(
              `Đã ${actionText} ${selectedRowKeys.length} tài khoản thành công!`,
            );
            setSelectedRowKeys([]);
            setSelectedRows([]);
            tableRef.current?.reload();
          } else {
            message.error(res?.message || 'Thao tác thất bại');
          }
        } catch {
          message.error(`Lỗi khi ${actionText} tài khoản`);
        }
      },
    });
  };

  // Xuất Excel
  const handleExportExcel = async () => {
    try {
      message.loading('Đang kết xuất tệp tin Excel...');
      const blob = await userService.exportExcel({
        searchKeyword,
        status: filterStatus,
        plant: filterPlant,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `User_Management_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Xuất file Excel thành công!');
    } catch {
      message.error('Lỗi khi xuất file Excel');
    }
  };

  return {
    tableRef,
    selectedRowKeys,
    setSelectedRowKeys,
    selectedRows,
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
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleOpenImportModal,
    handleSaveUser,
    handleBulkDelete,
    handleExportExcel,
  };
}
