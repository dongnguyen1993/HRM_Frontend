import {
  ModalForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Col, Row, TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { ShiftItem } from '../types';

interface ShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'create' | 'update';
  currentRow?: ShiftItem;
  onFinish: (values: any) => Promise<boolean>;
}

const ShiftModal: React.FC<ShiftModalProps> = ({
  open,
  onOpenChange,
  type,
  currentRow,
  onFinish,
}) => {
  return (
    <ModalForm
      title={
        type === 'create'
          ? '➕ Thiết lập Ca Làm Việc Mới'
          : '✏️ Cập nhật Thông Tin Ca Làm Việc'
      }
      open={open}
      onOpenChange={onOpenChange}
      preserve={false}
      width={600}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        keyboard: false,
      }}
      initialValues={
        type === 'update' && currentRow
          ? {
              ...currentRow,
              startTime: currentRow.startTime
                ? dayjs(currentRow.startTime, 'HH:mm')
                : undefined,
              endTime: currentRow.endTime
                ? dayjs(currentRow.endTime, 'HH:mm')
                : undefined,
              breakStartTime: currentRow.breakStartTime
                ? dayjs(currentRow.breakStartTime, 'HH:mm')
                : undefined,
              breakEndTime: currentRow.breakEndTime
                ? dayjs(currentRow.breakEndTime, 'HH:mm')
                : undefined,
            }
          : {
              shiftCode: 'SHIFT_DAY',
              shiftName: 'Ca Ngày Nhà Máy (Day Shift)',
              startTime: dayjs('07:30', 'HH:mm'),
              endTime: dayjs('18:00', 'HH:mm'),
              breakStartTime: dayjs('12:00', 'HH:mm'),
              breakEndTime: dayjs('13:00', 'HH:mm'),
              gracePeriodMinutes: 5,
              totalWorkHours: 9.6,
              isOvernight: false,
              description: 'Khung quẹt vào 07:00 - 07:35, công chuẩn 9.6h',
            }
      }
      onFinish={async (values) => {
        const formattedValues = {
          ...values,
          startTime: values.startTime
            ? dayjs(values.startTime).format('HH:mm')
            : '07:30',
          endTime: values.endTime
            ? dayjs(values.endTime).format('HH:mm')
            : '18:00',
          breakStartTime: values.breakStartTime
            ? dayjs(values.breakStartTime).format('HH:mm')
            : null,
          breakEndTime: values.breakEndTime
            ? dayjs(values.breakEndTime).format('HH:mm')
            : null,
        };
        return onFinish(formattedValues);
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <ProFormText
            name="shiftCode"
            label="Mã ca (Shift Code)"
            placeholder="Ví dụ: SHIFT_DAY, SHIFT_NIGHT..."
            disabled={type === 'update'}
            rules={[{ required: true, message: 'Mã ca là bắt buộc!' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormText
            name="shiftName"
            label="Tên ca làm việc"
            placeholder="Ví dụ: Ca Ngày 12h, Ca Đêm..."
            rules={[{ required: true, message: 'Tên ca là bắt buộc!' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ModalForm.Item
            name="startTime"
            label="Giờ bắt đầu vào ca (Check-In)"
            rules={[{ required: true, message: 'Vui lòng chọn giờ vào!' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </ModalForm.Item>
        </Col>
        <Col span={12}>
          <ModalForm.Item
            name="endTime"
            label="Giờ kết thúc ca (Check-Out)"
            rules={[{ required: true, message: 'Vui lòng chọn giờ ra!' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </ModalForm.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ModalForm.Item name="breakStartTime" label="Bắt đầu nghỉ giữa ca">
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </ModalForm.Item>
        </Col>
        <Col span={12}>
          <ModalForm.Item name="breakEndTime" label="Kết thúc nghỉ giữa ca">
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </ModalForm.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <ProFormDigit
            name="gracePeriodMinutes"
            label="Cho phép trễ (Phút)"
            min={0}
            max={60}
            fieldProps={{ precision: 0 }}
            rules={[{ required: true, message: 'Bắt buộc!' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormDigit
            name="totalWorkHours"
            label="Công chuẩn (Giờ)"
            min={0}
            max={24}
            fieldProps={{ precision: 2, step: 0.1 }}
            rules={[{ required: true, message: 'Bắt buộc!' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormSwitch
            name="isOvernight"
            label="Ca qua đêm (Night)"
            tooltip="Bật nếu ca làm việc kết thúc vào sáng hôm sau (vd: 20:00 -> 05:36)"
          />
        </Col>
      </Row>

      <ProFormTextArea
        name="description"
        label="Mô tả / Ghi chú ca"
        placeholder="Ghi chú quy định quẹt thẻ của ca này..."
      />
    </ModalForm>
  );
};

export default ShiftModal;
