import type { InitialState, PermissionItem } from './app';

/**
 * Quản lý phân quyền người dùng (Access Control) trong hệ thống Hansol HRM.
 * Đọc ma trận quyền thực tế (IsSearch, IsCreate, IsUpdate, IsDelete, IsSave, IsPrint)
 * từ kết quả API /api/permission/my-menu.
 */
export default (initialState: InitialState | undefined) => {
  // 1. Nhận diện đặc quyền Administrator tối cao
  const currentUser =
    initialState?.currentUser ||
    (() => {
      try {
        const u = localStorage.getItem('userInfo');
        return u ? JSON.parse(u) : null;
      } catch {
        return null;
      }
    })();

  const isAdmin = !!(
    currentUser?.userCode === 'ADMIN' ||
    currentUser?.userCode === 'SYSTEM' ||
    currentUser?.authorGroupId?.toString().toLowerCase() === 'administrator' ||
    currentUser?.authorGroupId === 1 ||
    initialState?.name?.toLowerCase().includes('admin')
  );

  // 2. Lấy ma trận quyền thực tế từ initialState (hoặc fallback từ localStorage)
  const permissions: Record<string, PermissionItem> =
    initialState?.permissions && Object.keys(initialState.permissions).length > 0
      ? initialState.permissions
      : (() => {
          try {
            const cached = localStorage.getItem('userPermissions');
            return cached ? JSON.parse(cached) : {};
          } catch {
            return {};
          }
        })();

  /**
   * Helper tìm quyền theo pathname, programKey hoặc route object.
   * Nếu không truyền tham số, tự động đọc route hiện tại từ window.location.pathname.
   */
  const getPermission = (routeOrPath?: any): PermissionItem => {
    if (isAdmin) {
      return {
        isSearch: true,
        isCreate: true,
        isUpdate: true,
        isDelete: true,
        isSave: true,
        isPrint: true,
      };
    }

    let target = '';
    if (typeof routeOrPath === 'string') {
      target = routeOrPath;
    } else if (routeOrPath && typeof routeOrPath === 'object' && routeOrPath.path) {
      target = routeOrPath.path;
    } else if (typeof window !== 'undefined' && window.location) {
      target = window.location.pathname;
    }

    if (!target) {
      return {
        isSearch: false,
        isCreate: false,
        isUpdate: false,
        isDelete: false,
        isSave: false,
        isPrint: false,
      };
    }

    const key = target.toLowerCase().trim();

    // 1. Khớp chính xác
    if (permissions[key]) {
      return permissions[key];
    }

    // 2. Khớp tiền tố (prefix match cho các route con)
    for (const [permKey, val] of Object.entries(permissions)) {
      if (key === permKey || key.startsWith(permKey + '/')) {
        return val;
      }
    }

    // 3. Mapping kế thừa quyền cho các màn hình phụ thuộc
    if (key === '/system-mgmt/user-import' && permissions['/system-mgmt/user-management']) {
      return permissions['/system-mgmt/user-management'];
    }

    return {
      isSearch: false,
      isCreate: false,
      isUpdate: false,
      isDelete: false,
      isSave: false,
      isPrint: false,
    };
  };

  /**
   * Kiểm tra quyền cụ thể cho một hành động (IsSearch, IsCreate, IsUpdate, IsDelete, IsSave, IsPrint)
   */
  const hasPermission = (
    action:
      | 'IsSearch'
      | 'IsCreate'
      | 'IsUpdate'
      | 'IsDelete'
      | 'IsSave'
      | 'IsPrint'
      | 'search'
      | 'create'
      | 'update'
      | 'delete'
      | 'save'
      | 'print',
    routeOrPath?: any,
  ): boolean => {
    const perm = getPermission(routeOrPath);
    const act = action.toLowerCase();
    switch (act) {
      case 'issearch':
      case 'search':
        return perm.isSearch;
      case 'iscreate':
      case 'create':
        return perm.isCreate;
      case 'isupdate':
      case 'update':
        return perm.isUpdate;
      case 'isdelete':
      case 'delete':
        return perm.isDelete;
      case 'issave':
      case 'save':
        return perm.isSave;
      case 'isprint':
      case 'print':
        return perm.isPrint;
      default:
        return false;
    }
  };

  return {
    // Flag admin giữ tính tương thích ngược
    canSeeAdmin: isAdmin,
    isAdmin,

    // Toàn bộ ma trận quyền thực tế từ /api/permission/my-menu
    permissions,
    getPermission,
    hasPermission,

    // Các hàm kiểm tra 6 quyền chức năng thực tế
    canSearch: (routeOrPath?: any) => getPermission(routeOrPath).isSearch,
    canCreate: (routeOrPath?: any) => getPermission(routeOrPath).isCreate,
    canUpdate: (routeOrPath?: any) => getPermission(routeOrPath).isUpdate,
    canDelete: (routeOrPath?: any) => getPermission(routeOrPath).isDelete,
    canSave: (routeOrPath?: any) => getPermission(routeOrPath).isSave,
    canPrint: (routeOrPath?: any) => getPermission(routeOrPath).isPrint,

    // Route detector dùng trong cấu hình .umirc.ts (access: 'canAccessRoute')
    canAccessRoute: (route: any) => {
      if (isAdmin) return true;
      return getPermission(route).isSearch;
    },
  };
};
