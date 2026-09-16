import {
  DashboardOutlined,
  LogoutOutlined,
  SettingOutlined,
  SmileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RuntimeConfig } from '@umijs/max';
import { history, request as umiRequest } from '@umijs/max';
import { message, Space } from 'antd';
import React from 'react';
import ForbiddenPage from './pages/403';
import { requestConfig } from './requestConfig';
import { NotificationBell } from './components/NotificationBell';

export const request = requestConfig;

// Ánh xạ Icon vector Ant Design từ chuỗi CSDL
const iconMap: Record<string, React.ReactNode> = {
  user: <UserOutlined />,
  dashboard: <DashboardOutlined />,
  setting: <SettingOutlined />,
  smile: <SmileOutlined />,
};

// Logo Hansol CI
const HansolLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div
        style={{
          width: '18px',
          height: '8px',
          backgroundColor: '#00AEEF',
          borderRadius: '1px',
        }}
      />
      <div
        style={{
          width: '18px',
          height: '8px',
          backgroundColor: '#00A651',
          borderRadius: '1px',
        }}
      />
    </div>
    <span
      style={{
        fontWeight: 'bold',
        fontSize: '18px',
        color: '#fff',
        letterSpacing: '0.5px',
      }}
    >
      HANSOL <span style={{ fontWeight: 300, opacity: 0.9 }}>HRM</span>
    </span>
  </div>
);

export interface PermissionItem {
  isSearch: boolean;
  isCreate: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isSave: boolean;
  isPrint: boolean;
}

export interface InitialState {
  name: string;
  avatar?: string;
  settings?: any;
  currentUser?: any;
  permissions?: Record<string, PermissionItem>;
  rawMenus?: any[];
}

const extractPermissions = (items: any[]): Record<string, PermissionItem> => {
  const permMap: Record<string, PermissionItem> = {};

  const traverse = (list: any[]) => {
    if (!list || !Array.isArray(list)) return;
    for (const item of list) {
      const path = item.path || item.Path || '';
      const name = item.name || item.Name || '';

      const perms: PermissionItem = {
        isSearch: Boolean(item.isSearch ?? item.IsSearch ?? false),
        isCreate: Boolean(item.isCreate ?? item.IsCreate ?? false),
        isUpdate: Boolean(item.isUpdate ?? item.IsUpdate ?? false),
        isDelete: Boolean(item.isDelete ?? item.IsDelete ?? false),
        isSave: Boolean(item.isSave ?? item.IsSave ?? false),
        isPrint: Boolean(item.isPrint ?? item.IsPrint ?? false),
      };

      if (path) {
        permMap[path.toLowerCase().trim()] = perms;
      }
      if (name) {
        permMap[name.toLowerCase().trim()] = perms;
      }

      const children = item.children || item.Children;
      if (children && Array.isArray(children) && children.length > 0) {
        traverse(children);
      }
    }
  };

  traverse(items);
  return permMap;
};

const normalizeMenu = (items: any[]): any[] => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item: any) => {
    const name = item.name || item.Name;
    const path = item.path || item.Path;
    const iconKey = item.icon || item.Icon;
    const rawChildren = item.children || item.Children;

    const icon = iconKey
      ? iconMap[iconKey.toLowerCase()] || <SmileOutlined />
      : undefined;

    const children =
      rawChildren && rawChildren.length > 0
        ? normalizeMenu(rawChildren).filter((child) => child.path !== path)
        : undefined;

    return {
      name,
      path,
      icon,
      children: children && children.length > 0 ? children : undefined,
    };
  });
};

export async function getInitialState(): Promise<InitialState> {
  const userInfoStr = localStorage.getItem('userInfo');
  const savedSettings = localStorage.getItem('userThemeSettings');
  const token = localStorage.getItem('accessToken');

  let settings = savedSettings ? JSON.parse(savedSettings) : {};
  let name = '';
  let currentUser: any = null;

  if (userInfoStr) {
    try {
      currentUser = JSON.parse(userInfoStr);
      name = currentUser.fullName || currentUser.userName || '';
    } catch {
      localStorage.clear();
    }
  }

  let rawMenus: any[] = [];
  let permissions: Record<string, PermissionItem> = {};

  if (token) {
    try {
      const res = await umiRequest('/api/permission/my-menu', {
        method: 'GET',
      });

      const responseBody =
        res && res.data && typeof res.isSuccess === 'undefined'
          ? res.data
          : res;

      if (
        responseBody &&
        (responseBody.isSuccess || responseBody.IsSuccess)
      ) {
        rawMenus = responseBody.data || responseBody.Data || [];
        permissions = extractPermissions(rawMenus);
        localStorage.setItem('userPermissions', JSON.stringify(permissions));
        localStorage.setItem('userMenus', JSON.stringify(rawMenus));
      }
    } catch (err) {
      console.error('Lỗi khi tải cấu hình quyền my-menu:', err);
      try {
        const cachedPerms = localStorage.getItem('userPermissions');
        const cachedMenus = localStorage.getItem('userMenus');
        if (cachedPerms) permissions = JSON.parse(cachedPerms);
        if (cachedMenus) rawMenus = JSON.parse(cachedMenus);
      } catch {}
    }
  }

  return { name, avatar: '/logo.png', settings, currentUser, permissions, rawMenus };
}

export const layout: RuntimeConfig['layout'] = ({
  initialState,
  setInitialState,
}) => {
  return {
    ...initialState?.settings,
    navTheme: initialState?.settings?.navTheme || 'light',
    colorPrimary: initialState?.settings?.colorPrimary || '#00AEEF',
    logo: () => <HansolLogo />,
    title: '',
    unAccessible: <ForbiddenPage />,

    // Tải Menu Động từ CSDL
    menu: {
      locale: false,
      request: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return [];

        // 1. Sử dụng trực tiếp danh sách menu đã nạp trong initialState
        if (initialState?.rawMenus && initialState.rawMenus.length > 0) {
          return normalizeMenu(initialState.rawMenus);
        }

        // 2. Fallback gọi API /api/permission/my-menu nếu chưa có
        try {
          const res = await umiRequest('/api/permission/my-menu', {
            method: 'GET',
          });

          const responseBody =
            res && res.data && typeof res.isSuccess === 'undefined'
              ? res.data
              : res;

          if (
            responseBody &&
            (responseBody.isSuccess || responseBody.IsSuccess)
          ) {
            const rawMenuData = responseBody.data || responseBody.Data || [];
            const perms = extractPermissions(rawMenuData);
            localStorage.setItem('userPermissions', JSON.stringify(perms));
            localStorage.setItem('userMenus', JSON.stringify(rawMenuData));
            return normalizeMenu(rawMenuData);
          }
        } catch {
          message.error('Lỗi khi tải cấu hình danh sách menu từ hệ thống');
        }
        return [];
      },
    },

    // Kiểm tra Đăng nhập
    onPageChange: () => {
      const token = localStorage.getItem('accessToken');
      const { location } = history;
      if (!token && location.pathname !== '/user/login') {
        history.push('/user/login');
      }
    },

    // Tiện ích góc phải Header (Thông báo thời gian thực)
    actionsRender: (props) => {
      if (props.isMobile) return [];
      return [<NotificationBell key="notification-bell" />];
    },

    // Menu Avatar và Đăng xuất
    avatarProps: {
      src: initialState?.avatar || '/logo.png',
      title: initialState?.name || 'Admin',
      render: (_, dom) => {
        return (
          <div
            onClick={() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('userInfo');
              localStorage.removeItem('userPermissions');
              localStorage.removeItem('userMenus');
              message.success('Đã đăng xuất thành công');
              history.push('/user/login');
            }}
            style={{ cursor: 'pointer' }}
          >
            <Space>
              {dom}
              <LogoutOutlined style={{ color: 'red' }} />
            </Space>
          </div>
        );
      },
    },

    // TÍCH HỢP PAGE STYLE SETTING DRAWER LƯU CƠ CHẾ THEO USER
    childrenRender: (children) => {
      return (
        <>
          {children}
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              localStorage.setItem(
                'userThemeSettings',
                JSON.stringify(settings),
              );
              setInitialState((preInitialState) => ({
                ...preInitialState,
                settings,
              }));
            }}
          />
        </>
      );
    },

    token: {
      header: {
        colorBgHeader: '#00AEEF',
        colorHeaderTitle: '#fff',
      },
      colorPrimary: '#00AEEF',
      sider: {
        colorBgSideMenu: '#ffffff',
        colorTextMenu: 'rgba(0, 0, 0, 0.65)',
        colorTextMenuSelected: '#00AEEF',
        colorBgMenuItemSelected: '#e6f7ff',
        colorTextMenuItemHover: '#00AEEF',
        colorBgMenuItemHover: 'rgba(0, 174, 239, 0.05)',
        colorSubMenuBg: '#fafafa',
      },
    },
  };
};
