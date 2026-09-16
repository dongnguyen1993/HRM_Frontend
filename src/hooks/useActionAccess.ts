import { useAccess } from '@umijs/max';

export interface ActionAccessResult {
  isAdmin: boolean;
  canSearch: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canSave: boolean;
  canPrint: boolean;
  hasPermission: (action: string) => boolean;
}

/**
 * Hook tiện ích kiểm tra nhanh 6 quyền thực tế cho route hiện tại hoặc route tùy biến
 */
export function useActionAccess(customRoutePath?: string): ActionAccessResult {
  const access = useAccess() as any;

  const isAdmin = !!access?.isAdmin;

  return {
    isAdmin,
    canSearch: isAdmin || (access?.canSearch ? access.canSearch(customRoutePath) : true),
    canCreate: isAdmin || (access?.canCreate ? access.canCreate(customRoutePath) : false),
    canUpdate: isAdmin || (access?.canUpdate ? access.canUpdate(customRoutePath) : false),
    canDelete: isAdmin || (access?.canDelete ? access.canDelete(customRoutePath) : false),
    canSave: isAdmin || (access?.canSave ? access.canSave(customRoutePath) : false),
    canPrint: isAdmin || (access?.canPrint ? access.canPrint(customRoutePath) : false),
    hasPermission: (action: string) => {
      if (isAdmin) return true;
      if (access?.hasPermission) return access.hasPermission(action, customRoutePath);
      return false;
    },
  };
}
