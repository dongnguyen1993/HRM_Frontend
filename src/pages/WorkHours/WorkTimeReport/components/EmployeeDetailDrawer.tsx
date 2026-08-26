import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Drawer, Space, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import * as reportService from '../service';
import type { EmployeeDailyDetail } from '../types';

interface EmployeeDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  userCode: string | null;
  userName: string;
  dateRange?: [string, string];
}

const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
  open,
  onClose,
  userCode,
  userName,
  dateRange,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EmployeeDailyDetail[]>([]);

  useEffect(() => {
    if (open && userCode) {
      setLoading(true);
      reportService
        .getEmployeeMonthlyDetail({
          userCode,
          fromDate: dateRange ? dateRange[0] : undefined,
          toDate: dateRange ? dateRange[1] : undefined,
        })
        .then((res) => {
          if (res && res.isSuccess) {
            setData(res.data || []);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, userCode, dateRange]);

  const columns = [
    {
      title: 'Ngày làm việc',
      dataIndex: 'workDate',
      width: 120,
      render: (val: any) => <b>{dayjs(val).format('YYYY-MM-DD')}</b>,
    },
    {
      title: 'Ca làm',
      dataIndex: 'shiftName',
      width: 150,
      render: (text: any) => (text ? <Tag color="cyan">{text}</Tag> : '-'),
    },
    {
      title: 'Giờ Vào (Check-In)',
      dataIndex: 'checkInTime',
      width: 165,
      render: (val: any) =>
        val ? (
          <span style={{ color: '#00A651', fontWeight: 600 }}>
            {dayjs(val).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        ) : (
          <Tag color="red">Thiếu vào</Tag>
        ),
    },
    {
      title: 'Giờ Ra (Check-Out)',
      dataIndex: 'checkOutTime',
      width: 165,
      render: (val: any) =>
        val ? (
          <span style={{ color: '#1890ff', fontWeight: 600 }}>
            {dayjs(val).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        ) : (
          <Tag color="red">Thiếu ra</Tag>
        ),
    },
    {
      title: 'Công chuẩn',
      dataIndex: 'workUnits',
      width: 100,
      render: (val: any) => (
        <b
          style={{
            color: val >= 1.0 ? '#00A651' : val > 0 ? '#faad14' : '#ff4d4f',
          }}
        >
          {val} công
        </b>
      ),
    },
    {
      title: 'Tăng ca (OT)',
      dataIndex: 'otHours',
      width: 110,
      render: (val: any) =>
        val > 0 ? (
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            <b>+{val}h</b>
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Cảnh báo',
      dataIndex: 'isWarning',
      width: 120,
      render: (isWarn: any, r: EmployeeDailyDetail) =>
        isWarn ? (
          <Tooltip title={r.warningReason}>
            <Tag color="error" icon={<WarningOutlined />}>
              Cảnh báo
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Chuẩn
          </Tag>
        ),
    },
    {
      title: 'Lý do / Ghi chú',
      dataIndex: 'warningReason',
      ellipsis: true,
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <span>
            Bảng Chấm Công Chi Tiết Trong Tháng: <b>{userName}</b> ({userCode})
          </span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={1000}
    >
      <Table
        size="small"
        bordered
        loading={loading}
        columns={columns as any}
        dataSource={data}
        rowKey="logId"
        pagination={false}
      />
    </Drawer>
  );
};

export default EmployeeDetailDrawer;
