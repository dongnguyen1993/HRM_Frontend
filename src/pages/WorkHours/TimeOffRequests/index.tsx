import { BaseTable } from '@/components/BaseTable';
import { PermissionGuard } from '@/components/PermissionGuard';
import { TableActionBar } from '@/components/TableActionBar';
import { TableFilterCard } from '@/components/TableFilterCard';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  FileAddOutlined,
  HourglassOutlined,
  InfoCircleOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { ModalForm, PageContainer, ProFormDateRangePicker, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';

const { RangePicker } = DatePicker;

// ─── Types ────────────────────────────────────────────────────────────────────
interface TimeOffItem {
  requestId: number;
  userId: number;
  userCode: string;
  fullName: string;
  department?: string;
  requestType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  comment?: string;
  createdAt: string;
  createdBy?: string;
  approvedAt?: string;
  approvedBy?: string;
}

interface LeaveType {
  leaveTypeId: number;
  leaveTypeCode: string;
  leaveTypeName: string;
  daysPerYear: number;
  isPaid: boolean;
}

interface TimeOffStats {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

// ─── Status helpers ────────────────────────────────────────────────────────────
const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'APPROVED')
    return <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
  if (status === 'REJECTED')
    return <Tag color="error" icon={<CloseCircleOutlined />}>Từ chối</Tag>;
  return <Tag color="warning" icon={<HourglassOutlined />}>Chờ duyệt</Tag>;
};

// ─── Component ────────────────────────────────────────────────────────────────
export const TimeOffRequests: React.FC = () => {
  const tableRef = useRef<any>();
  const [form] = Form.useForm();

  // ── Filters ──
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);

  // ── Selection ──
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<TimeOffItem[]>([]);

  // ── Data ──
  const [stats, setStats] = useState<TimeOffStats>({ totalRequests: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  // ── Modals ──
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveAction, setApproveAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [detailRecord, setDetailRecord] = useState<TimeOffItem | null>(null);
  const [commentForm] = Form.useForm();

  // ── Init ──
  useEffect(() => {
    fetchLeaveTypes();
    fetchStats();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await request<any>('/api/time-off/leave-types', { method: 'GET' });
      if (res?.isSuccess) setLeaveTypes(res.data);
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const res = await request<any>('/api/time-off/statistics', {
        method: 'GET',
        params: { fromDate: dateRange?.[0], toDate: dateRange?.[1] },
      });
      if (res?.isSuccess) setStats(res.data);
    } catch {}
  };

  const reload = () => {
    tableRef.current?.reload();
    fetchStats();
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  const handleSearch = () => reload();
  const handleReset = () => {
    setSearchKeyword('');
    setFilterStatus(undefined);
    setFilterType(undefined);
    setDateRange(undefined);
    setTimeout(reload, 0);
  };

  // ── Create ──
  const handleCreate = async (values: any) => {
    try {
      const payload = {
        requestType: values.requestType,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason,
      };
      const res = await request<any>('/api/time-off', { method: 'POST', data: payload });
      if (res?.isSuccess) {
        message.success(res.message || 'Gửi đơn xin nghỉ thành công!');
        reload();
        return true;
      }
      message.error(res?.message || 'Gửi đơn thất bại!');
      return false;
    } catch {
      message.error('Lỗi kết nối!');
      return false;
    }
  };

  // ── Delete ──
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn',
      content: 'Chỉ có thể hủy đơn đang ở trạng thái Chờ duyệt. Tiếp tục?',
      okText: 'Hủy đơn', okType: 'danger', cancelText: 'Không',
      onOk: async () => {
        const res = await request<any>(`/api/time-off/${id}`, { method: 'DELETE' });
        if (res?.isSuccess) { message.success('Đã hủy đơn!'); reload(); }
        else message.error(res?.message || 'Không thể hủy đơn này!');
      },
    });
  };

  // ── Approve / Reject ──
  const openApproveModal = (action: 'APPROVED' | 'REJECTED') => {
    if (!selectedRowKeys.length) { message.warning('Chưa chọn đơn nào!'); return; }
    setApproveAction(action);
    setApproveModalOpen(true);
  };

  const handleApproveSubmit = async () => {
    const { comment } = commentForm.getFieldsValue();
    const endpoint = approveAction === 'APPROVED' ? '/api/time-off/approve' : '/api/time-off/reject';
    const res = await request<any>(endpoint, {
      method: 'POST',
      data: { requestIds: selectedRowKeys, comment },
    });
    if (res?.isSuccess) {
      message.success(res.message);
      setApproveModalOpen(false);
      commentForm.resetFields();
      reload();
    } else {
      message.error(res?.message || 'Thao tác thất bại!');
    }
  };

  // ─── Columns ────────────────────────────────────────────────────────────────
  const columns: ProColumns<TimeOffItem>[] = [
    {
      title: 'STT',
      valueType: 'index',
      width: 55,
      fixed: 'left',
      render: (_, record, index, action) => {
        const current = action?.pageInfo?.current || 1;
        const pageSize = action?.pageInfo?.pageSize || 15;
        const stt = (current - 1) * pageSize + index + 1;
        return (
          <Button
            type="link" size="small"
            style={{ padding: 0, fontWeight: 'bold', color: '#1890ff' }}
            onClick={() => { setDetailRecord(record); setDetailModalOpen(true); }}
          >
            {stt}
          </Button>
        );
      },
    },
    {
      title: 'Mã NV', dataIndex: 'userCode', width: 100, fixed: 'left',
      render: (text) => <b style={{ color: '#1890ff' }}>{text}</b>,
    },
    { title: 'Họ và Tên', dataIndex: 'fullName', width: 170, fixed: 'left', ellipsis: true },
    {
      title: 'Loại nghỉ', dataIndex: 'requestType', width: 160,
      render: (type: any) => <Tag color="purple" icon={<ScheduleOutlined />}>{type}</Tag>,
    },
    {
      title: 'Từ ngày', dataIndex: 'startDate', width: 115,
      render: (val: any) => <b style={{ color: '#1890ff' }}>{val}</b>,
    },
    {
      title: 'Đến ngày', dataIndex: 'endDate', width: 115,
      render: (val: any) => <b>{val}</b>,
    },
    {
      title: 'Số ngày', dataIndex: 'totalDays', width: 85,
      render: (val: any) => (
        <Tag color="orange" style={{ fontWeight: 'bold' }}>{val} ngày</Tag>
      ),
    },
    {
      title: 'Lý do', dataIndex: 'reason', width: 200, ellipsis: true,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 130,
      render: (status: any) => <StatusTag status={status} />,
    },
    {
      title: 'Người duyệt', dataIndex: 'approvedBy', width: 130,
      render: (val: any) => val ? <Tag color="cyan">{val}</Tag> : <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Ngày gửi', dataIndex: 'createdAt', width: 150,
      render: (val: any) => <span style={{ fontSize: 12, color: '#888' }}>{val}</span>,
    },
    {
      title: 'Thao tác', key: 'action', width: 80, fixed: 'right',
      render: (_, record) =>
        record.status === 'PENDING' ? (
          <PermissionGuard action="delete" routePath="/work-hours/time-off">
            <Button
              danger size="small" icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.requestId)}
            />
          </PermissionGuard>
        ) : null,
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageContainer title="📩 Đăng Ký Nghỉ Phép (WorkRequests - 5040)">

      {/* 1. THỐNG KÊ NHANH */}
      <Row gutter={[16, 12]} style={{ marginBottom: 14 }}>
        {[
          { label: 'Tổng đơn', value: stats.totalRequests, color: '#722ed1', bg: '#f9f0ff', icon: <ScheduleOutlined /> },
          { label: 'Chờ duyệt', value: stats.pendingCount, color: '#faad14', bg: '#fffbe6', icon: <HourglassOutlined /> },
          { label: 'Đã duyệt', value: stats.approvedCount, color: '#52c41a', bg: '#f6ffed', icon: <CheckCircleOutlined /> },
          { label: 'Từ chối', value: stats.rejectedCount, color: '#ff4d4f', bg: '#fff1f0', icon: <CloseCircleOutlined /> },
        ].map((s) => (
          <Col xs={24} sm={12} md={6} key={s.label}>
            <Card size="small" bordered={false} style={{ backgroundColor: s.bg }}>
              <Statistic
                title={s.label} value={s.value} suffix="đơn"
                prefix={React.cloneElement(s.icon as React.ReactElement<any>, { style: { color: s.color } })}
                valueStyle={{ color: s.color, fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 2. BỘ LỌC */}
      <TableFilterCard onSearch={handleSearch} onReset={handleReset}>
        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Tìm kiếm:</span>
            <Input
              placeholder="Mã NV, Họ tên..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Loại nghỉ:</span>
            <Select
              placeholder="Tất cả loại nghỉ"
              style={{ width: '100%' }}
              value={filterType}
              onChange={setFilterType}
              allowClear
              options={leaveTypes.map((lt) => ({ label: lt.leaveTypeName, value: lt.leaveTypeName }))}
            />
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Trạng thái:</span>
            <Select
              placeholder="Tất cả trạng thái"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              options={[
                { label: '⏳ Chờ duyệt', value: 'PENDING' },
                { label: '✅ Đã duyệt', value: 'APPROVED' },
                { label: '❌ Từ chối', value: 'REJECTED' },
              ]}
            />
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space align="center" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500, minWidth: 65 }}>Khoảng ngày:</span>
            <RangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : undefined}
              onChange={(_, strings) =>
                setDateRange(strings[0] && strings[1] ? [strings[0], strings[1]] : undefined)
              }
            />
          </Space>
        </Col>
      </TableFilterCard>

      {/* 3. BẢNG DỮ LIỆU */}
      <Card size="small">
        <BaseTable<TimeOffItem>
          actionRef={tableRef}
          columns={columns}
          rowKey="requestId"
          search={false}
          scroll={{ x: 1400 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); },
          }}
          toolBarRender={() => [
            <TableActionBar
              key="actions"
              onAdd={() => setCreateModalOpen(true)}
              addText="Gửi đơn nghỉ phép"
              selectedCount={selectedRowKeys.length}
              extraButtons={
                <Space>
                  <PermissionGuard action="update" routePath="/work-hours/time-off">
                    <Button
                      type="primary" icon={<CheckCircleOutlined />}
                      disabled={!selectedRowKeys.length}
                      style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                      onClick={() => openApproveModal('APPROVED')}
                    >
                      Duyệt ({selectedRowKeys.length})
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard action="update" routePath="/work-hours/time-off">
                    <Button
                      danger icon={<CloseCircleOutlined />}
                      disabled={!selectedRowKeys.length}
                      onClick={() => openApproveModal('REJECTED')}
                    >
                      Từ chối ({selectedRowKeys.length})
                    </Button>
                  </PermissionGuard>
                </Space>
              }
            />,
          ]}
          request={async (params) => {
            const res = await request<any>('/api/time-off', {
              method: 'GET',
              params: {
                pageNumber: params.current,
                pageSize: params.pageSize,
                searchKeyword: searchKeyword || undefined,
                requestType: filterType,
                status: filterStatus,
                fromDate: dateRange?.[0],
                toDate: dateRange?.[1],
              },
            });
            return {
              data: res?.data || [],
              success: res?.isSuccess,
              total: res?.totalRecords,
            };
          }}
          pagination={{ pageSize: 15 }}
        />
      </Card>

      {/* 4. MODAL GỬI ĐƠN MỚI */}
      <ModalForm
        title={<Space><FileAddOutlined style={{ color: '#722ed1' }} /><span>Gửi Đơn Xin Nghỉ Phép</span></Space>}
        open={createModalOpen}
        onOpenChange={(open) => { setCreateModalOpen(open); if (!open) form.resetFields(); }}
        form={form}
        width={520}
        modalProps={{ destroyOnClose: true }}
        onFinish={handleCreate}
        submitter={{ searchConfig: { submitText: 'Gửi đơn', resetText: 'Hủy' } }}
      >
        <ProFormSelect
          name="requestType"
          label="Loại nghỉ phép"
          placeholder="Chọn loại nghỉ phép"
          rules={[{ required: true, message: 'Vui lòng chọn loại nghỉ phép!' }]}
          options={leaveTypes.map((lt) => ({
            label: `${lt.leaveTypeName}${lt.isPaid ? ' (có lương)' : ' (không lương)'} — tối đa ${lt.daysPerYear} ngày/năm`,
            value: lt.leaveTypeName,
          }))}
        />
        <ProFormDateRangePicker
          name="dateRange"
          label="Khoảng thời gian nghỉ"
          rules={[{ required: true, message: 'Vui lòng chọn ngày nghỉ!' }]}
          fieldProps={{ format: 'YYYY-MM-DD', style: { width: '100%' } }}
        />
        <ProFormTextArea
          name="reason"
          label="Lý do xin nghỉ"
          placeholder="Nhập lý do xin nghỉ..."
          rules={[{ required: true, message: 'Vui lòng nhập lý do!' }, { min: 5, message: 'Lý do phải ít nhất 5 ký tự!' }]}
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 5. MODAL PHÊ DUYỆT / TỪ CHỐI */}
      <Modal
        title={
          <Space>
            {approveAction === 'APPROVED'
              ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
              : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            <span>
              {approveAction === 'APPROVED' ? 'Phê duyệt' : 'Từ chối'} {selectedRowKeys.length} đơn nghỉ phép
            </span>
          </Space>
        }
        open={approveModalOpen}
        onCancel={() => { setApproveModalOpen(false); commentForm.resetFields(); }}
        onOk={handleApproveSubmit}
        okText={approveAction === 'APPROVED' ? 'Phê duyệt' : 'Từ chối'}
        okButtonProps={{ danger: approveAction === 'REJECTED', style: approveAction === 'APPROVED' ? { background: '#52c41a', borderColor: '#52c41a' } : {} }}
        width={460}
      >
        <Form form={commentForm} layout="vertical">
          <Form.Item name="comment" label="Ghi chú (không bắt buộc)">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú cho người gửi đơn..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 6. MODAL CHI TIẾT ĐƠN */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết Đơn nghỉ phép #{detailRecord?.requestId}</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[<Button key="close" type="primary" onClick={() => setDetailModalOpen(false)}>Đóng</Button>]}
        width={620}
      >
        {detailRecord && (
          <Descriptions bordered column={2} size="small" style={{ marginTop: 12 }}>
            <Descriptions.Item label="Mã nhân viên">
              <b style={{ color: '#1890ff' }}>{detailRecord.userCode}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Họ và Tên">{detailRecord.fullName}</Descriptions.Item>
            <Descriptions.Item label="Phòng ban" span={2}>
              {detailRecord.department ? <Tag color="blue">{detailRecord.department}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Loại nghỉ phép" span={2}>
              <Tag color="purple" icon={<ScheduleOutlined />}>{detailRecord.requestType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Từ ngày">
              <b style={{ color: '#1890ff' }}>{detailRecord.startDate}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Đến ngày"><b>{detailRecord.endDate}</b></Descriptions.Item>
            <Descriptions.Item label="Số ngày nghỉ" span={2}>
              <Tag color="orange" style={{ fontWeight: 'bold', fontSize: 14 }}>{detailRecord.totalDays} ngày</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do" span={2}>{detailRecord.reason}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              <StatusTag status={detailRecord.status} />
            </Descriptions.Item>
            {detailRecord.approvedBy && (
              <>
                <Descriptions.Item label="Người duyệt">
                  <Tag color="cyan">{detailRecord.approvedBy}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian duyệt">{detailRecord.approvedAt}</Descriptions.Item>
              </>
            )}
            {detailRecord.comment && (
              <Descriptions.Item label="Ghi chú" span={2}>{detailRecord.comment}</Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày gửi" span={2}>
              <span style={{ color: '#888' }}>{detailRecord.createdAt}</span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  );
};

export default TimeOffRequests;
