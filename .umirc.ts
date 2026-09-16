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

    // --- PHÂN HỆ HOME (Trang Chủ) ---
    // Chuyển hướng mặc định về /home/personal
    { path: '/', redirect: '/home/personal' },

    // --- PHÂN HỆ TRANG CHỦ (Đã đổi tên từ Dashboard -> Home) ---
    {
      path: '/home',
      name: 'Trang chủ',
      icon: 'home',
      routes: [
        {
          path: '/home/welcome',
          name: 'Welcome Analytics',
          component: './Home/HomeAdmin',
          access: 'canAccessRoute',
        },
        {
          path: '/home/personal',
          name: 'User Dashboard',
          component: './Home/HomeUser',
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
          access: 'canAccessRoute',
        },
        {
          path: '/system-mgmt/user-management',
          name: 'User Management',
          component: './Users/List',
          access: 'canAccessRoute',
        },
        {
          path: '/system-mgmt/user-import',
          name: 'Import Users',
          component: './Users/Import',
          access: 'canAccessRoute',
        },
        {
          path: '/system-mgmt/permission-mapping',
          name: 'Permission Mapping',
          component: './Users/AuthorMapping',
          access: 'canAccessRoute',
        },
        {
          path: '/system-mgmt/common-code',
          name: 'Common Code',
          component: './SystemMgmt/CommonCode',
          access: 'canAccessRoute',
        },
        {
          path: '/system-mgmt/audit-logs',
          name: 'Audit Logs',
          component: './SystemMgmt/AuditLogs',
          access: 'canAccessRoute',
        },
        {
          path: '/system-mgmt/system-settings',
          name: 'System Settings',
          component: './SystemMgmt/SystemSettings',
          access: 'canAccessRoute',
        },
        {
          path: '/system-mgmt/sign-in-logs',
          name: 'Sign-in Logs',
          component: './SystemMgmt/SignInLogs',
          access: 'canAccessRoute',
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
    // --- PHÂN HỆ HUMAN RESOURCE ---
    {
      path: '/hr',
      name: 'Human Resource',
      icon: 'team',
      routes: [
        {
          path: '/hr/departments',
          name: 'Department Management',
          component: './HumanResource/Departments',
          access: 'canAccessRoute',
        },
        {
          path: '/hr/contracts',
          name: 'Contract Management',
          component: './HumanResource/Contracts',
          access: 'canAccessRoute',
        },
        {
          path: '/hr/leave-types',
          name: 'Leave Settings',
          component: './HumanResource/LeaveTypes',
          access: 'canAccessRoute',
        },
      ],
    },

    // --- PHÂN HỆ WORK HOURS (5000) ---
    {
      path: '/work-hours',
      name: 'Work Hours',
      icon: 'clockCircle',
      routes: [
        {
          path: '/work-hours',
          redirect: '/work-hours/machine-records',
        },
        {
          path: '/work-hours/shift-setup',
          name: 'Shift Setup',
          component: './WorkHours/ShiftSetup',
          access: 'canAccessRoute',
        },
        {
          path: '/work-hours/work-summary',
          name: 'Work Summary',
          component: './WorkHours/WorkSummary',
          access: 'canAccessRoute',
        },
        {
          path: '/work-hours/machine-records',
          name: 'Machine Records',
          component: './WorkHours/MachineRecords',
          access: 'canAccessRoute',
        },
        {
          path: '/work-hours/timeoff-requests',
          name: 'Time Off Requests',
          component: './WorkHours/TimeOffRequests',
          access: 'canAccessRoute',
        },
        {
          path: '/work-hours/ot-registration',
          name: 'OT Registration',
          component: './WorkHours/OtRegistration',
          access: 'canAccessRoute',
        },
        {
          path: '/work-hours/device-setup',
          name: 'Device Setup',
          component: './WorkHours/DeviceSetup',
          access: 'canAccessRoute',
        },
        {
          path: '/work-hours/work-time-report',
          name: 'Work Time Report',
          component: './WorkHours/WorkTimeReport',
          access: 'canAccessRoute',
        },
      ],
    },
    { path: '/403', component: './403' },
    { path: '*', component: './404' },
  ],
  npmClient: 'npm',
});
