import { EditOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect } from 'react';
import type { TimesheetItem } from '../types';

interface EditModalProps {
  open: boolean;
  record: TimesheetItem | null;
  loading: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  open,
  record,
  loading,
  onCancel,
  onFinish,
}) => {
  const [form] = Form.useForm();

  // REQ 1: CHUẨN HOÁ HIỂN THỊ HỌ VÀ TÊN (TRÁNH LỖI CHỮ "null")
  const getEmployeeDisplayName = (item: TimesheetItem | null) => {
    if (!item) return '';
    const cleanName =
      item.fullName && item.fullName !== 'null' && item.fullName.trim() !== ''
        ? item.fullName.trim()
        : null;

    return cleanName ? `${item.userCode} - ${cleanName}` : item.userCode;
  };

  // REQ 4: THUẬT TOÁN TỰ ĐỘNG TÍNH LẠI CÔNG VÀ GIỜ OT KHI THAY ĐỔI GIỜ QUẸT
  const recalculateAttendance = (
    checkIn: Dayjs | null,
    checkOut: Dayjs | null,
    shiftName: string,
  ) => {
    let computedWorkUnits = 1.0;
    let computedOtHours = 0.0;

    if (shiftName && shiftName.includes('Nửa')) {
      computedWorkUnits = 0.5;
    }

    if (checkIn && checkOut) {
      let standardEndTime: Dayjs;

      // Xác định mốc giờ ra chuẩn
      if (shiftName && shiftName.includes('Đêm')) {
        standardEndTime = checkIn
          .startOf('day')
          .add(1, 'day')
          .hour(5)
          .minute(35);
      } else {
        standardEndTime = checkIn.startOf('day').hour(18).minute(0);
      }

      // Tính giờ OT (Làm tròn sàn)
      const otDiffMinutes = checkOut.diff(standardEndTime, 'minute');
      if (otDiffMinutes >= 120) computedOtHours = 2.0;
      else if (otDiffMinutes >= 90) computedOtHours = 1.5;
      else if (otDiffMinutes >= 60) computedOtHours = 1.0;
      else computedOtHours = 0.0;

      // Nếu nghỉ về quá sớm thì tính 0.5 công
      if (
        !shiftName.includes('Nửa') &&
        checkOut.isBefore(standardEndTime.subtract(4, 'hour'))
      ) {
        computedWorkUnits = 0.5;
      }
    }

    return { workUnits: computedWorkUnits, otHours: computedOtHours };
  };

  // REQ 4: LẮNG NGHE ONCHANGE TRÊN TẤT CẢ CÁC TRƯỜNG GIỜ VÀ CA
  const handleValuesChange = (_: any, allValues: any) => {
    const { checkInTime, checkOutTime, shiftName } = allValues;
    if (checkInTime || checkOutTime) {
      const { workUnits, otHours } = recalculateAttendance(
        checkInTime,
        checkOutTime,
        shiftName,
      );
      form.setFieldsValue({ workUnits, otHours });
    }
  };

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        userCode: record.userCode,
        shiftName: record.shiftName || 'Ca Sáng',
        checkInTime: record.checkInTime ? dayjs(record.checkInTime) : null,
        checkOutTime: record.checkOutTime ? dayjs(record.checkOutTime) : null,
        workUnits: record.workUnits ?? 1.0,
        otHours: record.otHours ?? 0.0,
        note: record.warningReason || record.comment || '',
      });
    }
  }, [open, record, form]);

  return (
    <Modal
      title={
        <Space
          size={8}
          style={{ color: '#1890ff', fontSize: 16, fontWeight: 600 }}
        >
          <EditOutlined />
          <span>Điều Chỉnh Chấm Công Thủ Công (Gỡ Cờ Đỏ)</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={650}
    >
      {record && (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          onFinish={onFinish}
          style={{ marginTop: 16 }}
        >
          {/* REQ 2: THIẾT KẾ GRID 2 CỘT BẰNG ROW/COL CỦA ANT DESIGN */}
          <Row gutter={16}>
            {/* HÀNG 1: Nhân viên (Full Width) */}
            <Col span={24}>
              <Form.Item label="Nhân viên">
                <Input
                  value={getEmployeeDisplayName(record)}
                  disabled
                  style={{
                    color: '#262626',
                    fontWeight: 600,
                    backgroundColor: '#f5f5f5',
                  }}
                />
              </Form.Item>
            </Col>

            {/* HÀNG 2: Loại ca phù hợp (Full Width) */}
            <Col span={24}>
              <Form.Item
                name="shiftName"
                label="Loại Ca Phù Hợp"
                rules={[{ required: true, message: 'Vui lòng chọn loại ca!' }]}
              >
                <Select
                  options={[
                    { label: 'Ca Sáng (07:30 - 18:00)', value: 'Ca Sáng' },
                    {
                      label: 'Nửa Ca Sáng (12:00 - 18:00)',
                      value: 'Nửa Ca Sáng',
                    },
                    { label: 'Ca Đêm (20:00 - 05:35)', value: 'Ca Đêm' },
                    {
                      label: 'Nửa Ca Đêm (01:00 - 05:35)',
                      value: 'Nửa Ca Đêm',
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* HÀNG 3: Cột trái (Check-in) | Cột phải (Hệ số công) */}
            <Col span={12}>
              <Form.Item name="checkInTime" label="Giờ Check-in Thực Tế">
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="Chọn giờ vào"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="workUnits"
                label="Hệ Số Công"
                rules={[{ required: true, message: 'Nhập công!' }]}
              >
                <InputNumber
                  min={0}
                  max={1}
                  step={0.5}
                  style={{ width: '100%' }}
                  addonAfter="công"
                />
              </Form.Item>
            </Col>

            {/* HÀNG 4: Cột trái (Check-out) | Cột phải (Giờ OT) */}
            <Col span={12}>
              <Form.Item name="checkOutTime" label="Giờ Check-out Thực Tế">
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="Chọn giờ ra"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="otHours" label="Giờ Tăng Ca OT">
                <InputNumber
                  min={0}
                  max={12}
                  step={0.5}
                  style={{ width: '100%' }}
                  addonAfter="giờ"
                />
              </Form.Item>
            </Col>

            {/* HÀNG 5: Ghi chú xử lý của HR (Full Width) */}
            <Col span={24}>
              <Form.Item name="note" label="Ghi Chú Xử Lý Của HR">
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập lý do điều chỉnh thủ công..."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* REQ 3: NÚT XÁC NHẬN MÀU XANH DƯƠNG THƯƠNG HIỆU */}
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<EditOutlined />}
              style={{ fontWeight: 500 }}
            >
              Xác Nhận Phê Duyệt
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};
