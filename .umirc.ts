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

    // --- PHÂN HỆ DASHBOARD ---
    // 1. Chuyển hướng mặc định về /home/personal
    { path: '/', redirect: '/home/personal' },

    // 2. Phân hệ HOME (Trang Chủ)
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
          component: './Home/HomeAdmin', // CHỈNH SỬA TẠI ĐÂY: Trỏ đúng vào thư mục Home
        },
        {
          path: '/home/personal',
          name: 'User Dashboard',
          component: './Home/HomeUser', // CHỈNH SỬA TẠI ĐÂY: Trỏ đúng vào thư mục Home
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
        },
        {
          path: '/hr/contracts',
          name: 'Contract Management',
          component: './HumanResource/Contracts',
        },
        {
          path: '/hr/leave-types',
          name: 'Leave Settings',
          component: './HumanResource/LeaveTypes',
        },
      ],
    },

    // --- PHÂN HỆ TIME ATTENDANCE (5000) - CHUẨN ĐỊNH TUYẾN KHOA HỌC ---
    // --- PHÂN HỆ WORK HOURS (5000) - BỘ TỪ VẬN HÀNH THỜI GIAN CHUẨN ---
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
        },
        {
          path: '/work-hours/work-summary',
          name: 'Work Summary',
          component: './WorkHours/WorkSummary',
        },
        {
          path: '/work-hours/machine-records',
          name: 'Machine Records',
          component: './WorkHours/MachineRecords',
        },
        {
          path: '/work-hours/timeoff-requests',
          name: 'Time Off Requests',
          component: './WorkHours/TimeOffRequests',
        },
        {
          path: '/work-hours/ot-registration',
          name: 'OT Registration',
          component: './WorkHours/OtRegistration',
        },
        {
          path: '/work-hours/device-setup',
          name: 'Device Setup',
          component: './WorkHours/DeviceSetup',
        },
        {
          path: '/work-hours/work-time-report',
          name: 'Work Time Report',
          component: './WorkHours/WorkTimeReport',
        },
      ],
    },
    { path: '*', component: './404' },
  ],
  npmClient: 'npm',
});
