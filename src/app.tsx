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
import { requestConfig } from './requestConfig';

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

export async function getInitialState(): Promise<{
  name: string;
  avatar?: string;
  settings?: any;
}> {
  const userInfoStr = localStorage.getItem('userInfo');
  const savedSettings = localStorage.getItem('userThemeSettings');

  let settings = savedSettings ? JSON.parse(savedSettings) : {};
  let name = '';

  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      name = userInfo.fullName;
    } catch {
      localStorage.clear();
    }
  }

  return { name, avatar: '/logo.png', settings };
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

    // Tải Menu Động từ CSDL
    menu: {
      locale: false,
      request: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return [];

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

            const normalizeMenu = (items: any[]): any[] => {
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
                    ? normalizeMenu(rawChildren).filter(
                        (child) => child.path !== path,
                      )
                    : undefined;

                return {
                  name,
                  path,
                  icon,
                  children:
                    children && children.length > 0 ? children : undefined,
                };
              });
            };

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
