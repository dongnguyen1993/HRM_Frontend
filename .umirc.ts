import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {
    dataField: 'data',
  },
  tailwindcss: {},
  proxy: {
    '/api/': {
      target: 'https://localhost:7014',
      changeOrigin: true,
      secure: false,
    },
    '/uploads/': {
      target: 'https://localhost:7014',
      changeOrigin: true,
      secure: false,
    },
  },
  locale: {
    default: 'vi-VN',
    antd: true,
    baseNavigator: true,
  },
  layout: {
    title: 'Hansol HRM',
  },
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        { name: 'Đăng nhập', path: '/user/login', component: './Users/Login' },
      ],
    },
    { path: '/', redirect: '/welcome' },

    // --- PHÂN HỆ DASHBOARD ---
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: 'dashboard',
      routes: [
        {
          path: '/dashboard/welcome',
          name: 'Welcome Analytics',
          component: './Dashboard/Admin',
        },
        {
          path: '/dashboard/user',
          name: 'User Dashboard',
          component: './Dashboard/User',
        },
      ],
    },

    // --- PHÂN HỆ QUẢN LÝ HỆ THỐNG ---
    {
      path: '/system-mgmt',
      name: 'System Administration',
      icon: 'setting',
      routes: [
        {
          path: '/system-mgmt/menu-management',
          name: 'Menu & Screen Management',
          component: './SystemMgmt/ProgramList',
        },
        {
          path: '/system-mgmt/user-management',
          name: 'User Management',
          component: './Users/List',
        },
        {
          path: '/system-mgmt/permission-mapping',
          name: 'Permission Mapping',
          component: './Users/AuthorMapping',
        },
        {
          path: '/system-mgmt/common-code',
          name: 'Common Code',
          component: './SystemMgmt/CommonCode',
        },
        {
          path: '/system-mgmt/audit-logs',
          name: 'Audit Logs',
          component: './SystemMgmt/AuditLogs',
        },
        {
          path: '/system-mgmt/system-settings',
          name: 'System Settings',
          component: './SystemMgmt/SystemSettings',
        },
        {
          path: '/system-mgmt/sign-in-logs',
          name: 'Sign-in Logs',
          component: './SystemMgmt/SignInLogs',
        },
      ],
    },
    {
      path: '/account',
      name: 'Account',
      icon: 'user',
      routes: [
        {
          path: '/account/settings',
          name: 'Account Settings',
          component: './Account/Settings',
        },
      ],
    },

    { path: '*', component: './404' },
  ],
  npmClient: 'npm',
});
