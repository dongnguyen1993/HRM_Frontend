import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import React from 'react';
import { useActionAccess } from '@/hooks/useActionAccess';

export interface TableActionBarProps {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  addText?: string;
  editText?: string;
  deleteText?: string;
  exportText?: string;
  selectedCount?: number;
  extraButtons?: React.ReactNode;
  routePath?: string;
  hideUnauthorized?: boolean; // Nếu true: ẩn hẳn nút khi không có quyền; Nếu false: disable nút kèm Tooltip giải thích
  canCreate?: boolean; // Override quyền thủ công nếu cần
  canUpdate?: boolean;
  canDelete?: boolean;
  canPrint?: boolean;
}

export const TableActionBar: React.FC<TableActionBarProps> = ({
  onAdd,
  onEdit,
  onDelete,
  onExport,
  addText = '+ Thêm mới',
  editText = 'Sửa',
  deleteText,
  exportText = 'Xuất Excel',
  selectedCount = 0,
  extraButtons,
  routePath,
  hideUnauthorized = false,
  canCreate: propCanCreate,
  canUpdate: propCanUpdate,
  canDelete: propCanDelete,
  canPrint: propCanPrint,
}) => {
  const access = useActionAccess(routePath);

  const hasCreateRight = propCanCreate !== undefined ? propCanCreate : access.canCreate;
  const hasUpdateRight = propCanUpdate !== undefined ? propCanUpdate : access.canUpdate;
  const hasDeleteRight = propCanDelete !== undefined ? propCanDelete : access.canDelete;
  const hasPrintRight = propCanPrint !== undefined ? propCanPrint : access.canPrint;

  const renderAddButton = () => {
    if (!onAdd) return null;
    if (!hasCreateRight && hideUnauthorized) return null;

    const btn = (
      <Button
        type="primary"
        icon={<PlusOutlined />}
        disabled={!hasCreateRight}
        onClick={hasCreateRight ? onAdd : undefined}
        style={hasCreateRight ? { backgroundColor: '#00AEEF', borderColor: '#00AEEF' } : undefined}
      >
        {addText}
      </Button>
    );

    if (!hasCreateRight) {
      return (
        <Tooltip title="Bạn không có quyền Thêm mới (IsCreate)">
          <span style={{ cursor: 'not-allowed' }}>{btn}</span>
        </Tooltip>
      );
    }
    return btn;
  };

  const renderEditButton = () => {
    if (!onEdit) return null;
    if (!hasUpdateRight && hideUnauthorized) return null;

    const isSelectionValid = selectedCount === 1;
    const isDisabled = !hasUpdateRight || !isSelectionValid;

    const btn = (
      <Button
        icon={<EditOutlined />}
        disabled={isDisabled}
        onClick={hasUpdateRight && isSelectionValid ? onEdit : undefined}
      >
        {editText}
      </Button>
    );

    if (!hasUpdateRight) {
      return (
        <Tooltip title="Bạn không có quyền Chỉnh sửa (IsUpdate)">
          <span style={{ cursor: 'not-allowed' }}>{btn}</span>
        </Tooltip>
      );
    }
    return btn;
  };

  const renderDeleteButton = () => {
    if (!onDelete) return null;
    if (!hasDeleteRight && hideUnauthorized) return null;

    const hasSelection = selectedCount > 0;
    const isDisabled = !hasDeleteRight || !hasSelection;
    const label = deleteText || `XÓA (${selectedCount})`;

    const btn = (
      <Button
        danger
        icon={<DeleteOutlined />}
        disabled={isDisabled}
        onClick={hasDeleteRight && hasSelection ? onDelete : undefined}
      >
        {label}
      </Button>
    );

    if (!hasDeleteRight) {
      return (
        <Tooltip title="Bạn không có quyền Xóa dữ liệu (IsDelete)">
          <span style={{ cursor: 'not-allowed' }}>{btn}</span>
        </Tooltip>
      );
    }
    return btn;
  };

  const renderExportButton = () => {
    if (!onExport) return null;
    if (!hasPrintRight && hideUnauthorized) return null;

    const btn = (
      <Button
        icon={<DownloadOutlined />}
        disabled={!hasPrintRight}
        onClick={hasPrintRight ? onExport : undefined}
      >
        {exportText}
      </Button>
    );

    if (!hasPrintRight) {
      return (
        <Tooltip title="Bạn không có quyền Xuất/In báo cáo (IsPrint)">
          <span style={{ cursor: 'not-allowed' }}>{btn}</span>
        </Tooltip>
      );
    }
    return btn;
  };

  return (
    <Space wrap>
      {renderAddButton()}
      {renderEditButton()}
      {renderDeleteButton()}
      {renderExportButton()}
      {extraButtons}
    </Space>
  );
};

export default TableActionBar;
