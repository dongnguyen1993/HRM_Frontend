import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { WorkSummaryItem } from '../types';

interface SummaryEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: WorkSummaryItem;
  onFinish: (values: any) => Promise<boolean>;
}

const SummaryEditModal: React.FC<SummaryEditModalProps> = ({
  open,
  onOpenChange,
  currentRow,
  onFinish,
}) => {
  return (
    <ModalForm
      title={`✏️ Điều chỉnh công nhân viên: ${currentRow?.fullName} (${currentRow?.userCode})`}
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
        currentRow
          ? {
              ...currentRow,
              checkInTime: currentRow.checkInTime
                ? dayjs(currentRow.checkInTime)
                : undefined,
              checkOutTime: currentRow.checkOutTime
                ? dayjs(currentRow.checkOutTime)
                : undefined,
            }
          : {}
      }
      onFinish={async (values) => {
        const formatted = {
          ...values,
          logId: currentRow?.logId,
          checkInTime: values.checkInTime
            ? dayjs(values.checkInTime).format('YYYY-MM-DDTHH:mm:ss')
            : null,
          checkOutTime: values.checkOutTime
            ? dayjs(values.checkOutTime).format('YYYY-MM-DDTHH:mm:ss')
            : null,
        };
        return onFinish(formatted);
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <ProFormDateTimePicker
            name="checkInTime"
            label="Giờ vào thực tế (Check-In)"
            fieldProps={{
              format: 'YYYY-MM-DD HH:mm:ss',
              style: { width: '100%' },
            }}
          />
        </Col>
        <Col span={12}>
          <ProFormDateTimePicker
            name="checkOutTime"
            label="Giờ ra thực tế (Check-Out)"
            fieldProps={{
              format: 'YYYY-MM-DD HH:mm:ss',
              style: { width: '100%' },
            }}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <ProFormDigit
            name="workUnits"
            label="Công chuẩn"
            min={0}
            max={2}
            fieldProps={{ precision: 1, step: 0.5 }}
            rules={[{ required: true }]}
          />
        </Col>
        <Col span={8}>
          <ProFormDigit
            name="otHours"
            label="Giờ tăng ca OT"
            min={0}
            max={12}
            fieldProps={{ precision: 1, step: 0.5 }}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="status"
            label="Trạng thái"
            options={[
              { label: 'Hợp lệ (Punctual)', value: 'PUNCTUAL' },
              { label: 'Cần xem xét (Pending)', value: 'Pending_Review' },
              { label: 'Đi trễ (Late)', value: 'LATE' },
              { label: 'Về sớm (Early)', value: 'EARLY' },
            ]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ProFormSwitch
            name="isWarning"
            label="Cờ đỏ Cảnh báo (Warning)"
            tooltip="Gạt tắt cờ đỏ nếu HR đã xác minh và duyệt công hợp lệ"
          />
        </Col>
        <Col span={12}>
          <ProFormText name="warningReason" label="Lý do cảnh báo" />
        </Col>
      </Row>

      <ProFormTextArea
        name="comment"
        label="Ghi chú điều chỉnh"
        placeholder="Lý do điều chỉnh..."
      />
    </ModalForm>
  );
};

export default SummaryEditModal;
