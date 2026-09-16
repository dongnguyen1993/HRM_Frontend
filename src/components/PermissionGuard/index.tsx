import { useActionAccess } from '@/hooks/useActionAccess';
import { Tooltip } from 'antd';
import React from 'react';

export type PermissionActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'print'
  | 'save'
  | 'search';

export interface PermissionGuardProps {
  action: PermissionActionType;
  routePath?: string;
  disableOnly?: boolean; // Nếu true: render nút disabled kèm Tooltip; nếu false: ẩn hoàn toàn
  tooltip?: React.ReactNode;
  fallback?: React.ReactNode;
  children: React.ReactElement;
}

/**
 * Component bao bọc nút hoặc thành phần UI để bảo vệ theo quyền
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  action,
  routePath,
  disableOnly = true,
  tooltip,
  fallback = null,
  children,
}) => {
  const access = useActionAccess(routePath);

  let hasRight = false;
  let defaultTooltip = '';

  switch (action) {
    case 'create':
      hasRight = access.canCreate;
      defaultTooltip = 'Bạn không có quyền Thêm mới (IsCreate)';
      break;
    case 'update':
      hasRight = access.canUpdate;
      defaultTooltip = 'Bạn không có quyền Chỉnh sửa (IsUpdate)';
      break;
    case 'delete':
      hasRight = access.canDelete;
      defaultTooltip = 'Bạn không có quyền Xóa dữ liệu (IsDelete)';
      break;
    case 'print':
      hasRight = access.canPrint;
      defaultTooltip = 'Bạn không có quyền In hoặc Xuất dữ liệu (IsPrint)';
      break;
    case 'save':
      hasRight = access.canSave;
      defaultTooltip = 'Bạn không có quyền Lưu dữ liệu (IsSave)';
      break;
    case 'search':
      hasRight = access.canSearch;
      defaultTooltip = 'Bạn không có quyền Tìm kiếm (IsSearch)';
      break;
  }

  if (hasRight) {
    return children;
  }

  if (!disableOnly) {
    return <>{fallback}</>;
  }

  const tooltipTitle = tooltip ?? defaultTooltip;
  const disabledChild = React.cloneElement(children, {
    disabled: true,
  });

  return (
    <Tooltip title={tooltipTitle}>
      <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
        {disabledChild}
      </span>
    </Tooltip>
  );
};

export default PermissionGuard;
