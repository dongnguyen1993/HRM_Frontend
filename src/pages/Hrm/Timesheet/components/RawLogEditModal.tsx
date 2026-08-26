import React, { useEffect, useState } from 'react';
import {
  Modal,
  Table,
  Button,
  Space,
  DatePicker,
  Select,
  Form,
  Popconfirm,
  message,
  Tag,
  Divider,
  Card,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TimesheetItem } from '../types';
import { request } from '@umijs/max';

interface RawLogEditModalProps {
  open: boolean;
  record: TimesheetItem | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const RawLogEditModal: React.FC<RawLogEditModalProps> = ({
  open,
  record,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [addForm] = Form.useForm();

  // 1. TẢI DỮ LIỆU QUẸT THẺ THÔ (LỌC CHÍNH XÁC THEO NGÀY KHÔNG BỊ CHỮ T00:00:00)
  const fetchRawLogs = async () => {
    if (!record) return;
    setLoading(true);
    try {
      const cleanDate = dayjs(record.workDate).format('YYYY-MM-DD');
      const res = await request('/api/timesheets/raw-logs/user-date', {
        method: 'GET',
        params: { userCode: record.userCode, workDate: cleanDate },
      });
      if (res && res.isSuccess) setRawLogs(res.data || []);
    } catch {
      message.error('Lỗi khi tải dữ liệu quẹt thẻ thô');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && record) fetchRawLogs();
  }, [open, record]);

  // 2. THÊM TÙY CHỈNH LƯỢT QUẸT
  const handleAddRawLog = async (logTimestamp: string, deviceName: string, deviceId: string) => {
    if (!record) return;
    try {
      const payload = {
        userCode: record.userCode,
        userName: record.fullName,
        userGroup: record.userGroup || 'IT',
        logTimestamp,
        deviceId,
        deviceName,
      };
      const res = await request('/api/timesheets/raw-logs', { method: 'POST', data: payload });
      return res && res.isSuccess;
    } catch {
      return false;
    }
  };

  const onManualAddSubmit = async (values: any) => {
    const isIn = values.deviceName.includes('GATE_IN');
    const deviceId = isIn ? '541636534' : '541634571';
    const success = await handleAddRawLog(
      values.logTimestamp.format('YYYY-MM-DD HH:mm:ss'),
      values.deviceName,
      deviceId,
    );
    if (success) {
      message.success('Đã thêm lượt quẹt thẻ thô!');
      addForm.resetFields();
      fetchRawLogs();
    }
  };

  // REQ 4: THÊM NHANH NGUYÊN CẶP CA NGÀY (GATE_IN 07:30 & GATE_OUT 18:00)
  const handleQuickAddDayShift = async () => {
    if (!record) return;
    const workDateStr = dayjs(record.workDate).format('YYYY-MM-DD');
    const inTime = `${workDateStr} 07:30:00`;
    const outTime = `${workDateStr} 18:00:00`;

    message.loading('Đang thêm nhanh cặp quẹt Ca Ngày (07:30 & 18:00)...', 1);
    await handleAddRawLog(inTime, 'GATE_IN_65.238', '541636534');
    await handleAddRawLog(outTime, 'GATE_OUT_65.237', '541634571');
    message.success('Đã thêm thành công cặp quẹt Ca Ngày!');
    fetchRawLogs();
  };

  // REQ 4: THÊM NHANH NGUYÊN CẶP CA ĐÊM (GATE_IN 20:00 & GATE_OUT 05:36 HÔM SAU)
  const handleQuickAddNightShift = async () => {
    if (!record) return;
    const workDateStr = dayjs(record.workDate).format('YYYY-MM-DD');
    const nextDateStr = dayjs(record.workDate).add(1, 'day').format('YYYY-MM-DD');
    const inTime = `${workDateStr} 20:00:00`;
    const outTime = `${nextDateStr} 05:36:00`;

    message.loading('Đang thêm nhanh cặp quẹt Ca Đêm (20:00 & 05:36 +1)...', 1);
    await handleAddRawLog(inTime, 'GATE_IN_65.238', '541636534');
    await handleAddRawLog(outTime, 'GATE_OUT_65.237', '541634571');
    message.success('Đã thêm thành công cặp quẹt Ca Đêm qua ngày!');
    fetchRawLogs();
  };

  // XÓA LƯỢT QUẸT
  const handleDeleteRawLog = async (rawLogId: number) => {
    try {
      const res = await request(`/api/timesheets/raw-logs/${rawLogId}`, { method: 'DELETE' });
      if (res && res.isSuccess) {
        message.success('Đã xóa lượt quẹt thẻ!');
        fetchRawLogs();
      }
    } catch {
      message.error('Lỗi khi xóa');
    }
  };

  // TÍNH LẠI CÔNG ĐƠN LẺ
  const handleRecalculateSingle = async () => {
    if (!record) return;
    setRecalculating(true);
    try {
      const cleanDate = dayjs(record.workDate).format('YYYY-MM-DD');
      const res = await request('/api/timesheets/calculate-single', {
        method: 'POST',
        data: { userCode: record.userCode, workDate: cleanDate },
      });
      if (res && res.isSuccess) {
        message.success(`Đã tính lại công cho NV ${record.userCode} ngày ${cleanDate}!`);
        onSuccess();
        onCancel();
      } else {
        message.error(res?.message || 'Tính lại công thất bại');
      }
    } catch {
      message.error('Lỗi khi gọi tính công');
    } finally {
      setRecalculating(false);
    }
  };

  const columns = [
    { title: 'STT', dataIndex: 'index', render: (_: any, __: any, i: number) => i + 1, width: 50 },
    {
      title: 'Thời Gian Quẹt',
      dataIndex: 'logTimestamp',
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm:ss'),
      width: 170,
    },
    {
      title: 'Tên Thiết Bị (Cổng)',
      dataIndex: 'deviceName',
      width: 190,
      render: (dev: string) => (
        <Tag color={dev?.includes('GATE_IN') ? 'blue' : dev?.includes('GATE_OUT') ? 'volcano' : 'default'}>
          {dev}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 70,
      render: (_: any, item: any) => (
        <Popconfirm title="Xóa lượt quẹt này?" onConfirm={() => handleDeleteRawLog(item.rawLogId)}>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={
        <span style={{ color: '#1890ff', fontSize: 16 }}>
          🗄️ Dữ Liệu Quẹt Thẻ Thô - NV: <b>{record?.userCode}</b> ({record?.fullName}) ngày{' '}
          <b style={{ color: '#cf1322' }}>{record ? dayjs(record.workDate).format('DD/MM/YYYY') : ''}</b>
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={780}
      destroyOnClose
    >
      {/* REQ 4: THANH TỰ ĐỘNG THÊM NHANH CA NGÀY & CA ĐÊM */}
      <Card size="small" style={{ backgroundColor: '#f0f5ff', borderColor: '#adc6ff', marginBottom: 16 }}>
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontWeight: 600, color: '#1d39c4' }}>⚡ Thêm Nhanh Dữ Liệu Quẹt Cổng Mặc Định:</span>
          <Space>
            <Button
              type="primary"
              icon={<SunOutlined />}
              onClick={handleQuickAddDayShift}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              + Ca Ngày (07:30 & 18:00)
            </Button>
            <Button
              type="primary"
              icon={<MoonOutlined />}
              onClick={handleQuickAddNightShift}
              style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
            >
              + Ca Đêm (20:00 & 05:36 +1)
            </Button>
          </Space>
        </Space>
      </Card>

      {/* FORM THÊM TỦ CÔNG LẺ */}
      <Form form={addForm} layout="inline" onFinish={onManualAddSubmit} style={{ marginBottom: 16 }}>
        <Form.Item name="logTimestamp" rules={[{ required: true, message: 'Chọn giờ' }]}>
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Chọn thời gian quẹt" />
        </Form.Item>
        <Form.Item name="deviceName" initialValue="GATE_IN_65.238" rules={[{ required: true }]}>
          <Select style={{ width: 190 }}>
            <Select.Option value="GATE_IN_65.238">GATE_IN_65.238</Select.Option>
            <Select.Option value="GATE_OUT_65.237">GATE_OUT_65.237</Select.Option>
            <Select.Option value="MAINOFFICE_FINGER_65.232">MAINOFFICE_FINGER_65.232</Select.Option>
          </Select>
        </Form.Item>
        <Button type="default" htmlType="submit" icon={<PlusOutlined />}>
          Thêm Lẻ
        </Button>
      </Form>

      <Table columns={columns} dataSource={rawLogs} rowKey="rawLogId" loading={loading} pagination={false} size="small" scroll={{ y: 220 }} />

      <Divider style={{ margin: '12px 0' }} />

      <div style={{ textAlign: 'right' }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Đóng
        </Button>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          loading={recalculating}
          onClick={handleRecalculateSingle}
          style={{ backgroundColor: '#faad14', borderColor: '#faad14', fontWeight: 'bold' }}
        >
          ⚡ CẬP NHẬT & TÍNH LẠI CÔNG CHO NV NÀY
        </Button>
      </div>
    </Modal>
  );
};