import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import type { MachineRecordItem } from '../types';

interface RecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'create' | 'update';
  currentRow?: MachineRecordItem;
  userGroupOptions: string[];
  onFinish: (values: any) => Promise<boolean>;
}

const RecordModal: React.FC<RecordModalProps> = ({
  open,
  onOpenChange,
  type,
  currentRow,
  userGroupOptions,
  onFinish,
}) => {
  const formRef = useRef<ProFormInstance>();

  // XỬ LÝ NHẢY GIỜ TỰ ĐỘNG KHI CHỌN CỔNG
  const handleDeviceChange = (deviceName: string) => {
    const today = dayjs().format('YYYY-MM-DD');
    if (deviceName === 'GATE_IN_65.238') {
      formRef.current?.setFieldsValue({
        logTimestamp: `${today} 07:30:00`,
      });
    } else if (deviceName === 'GATE_OUT_65.237') {
      formRef.current?.setFieldsValue({
        logTimestamp: `${today} 18:00:00`,
      });
    }
  };

  return (
    <ModalForm
      formRef={formRef}
      title={
        type === 'create'
          ? '➕ Thêm mới lượt quẹt thẻ (Thủ công)'
          : '✏️ Chỉnh sửa lượt quẹt thẻ (Thủ công)'
      }
      open={open}
      onOpenChange={onOpenChange}
      preserve={false}
      width={560}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        keyboard: false,
      }}
      initialValues={
        type === 'update' && currentRow
          ? {
              userCode: currentRow.userCode,
              userName: currentRow.userName,
              userGroup: currentRow.userGroup || userGroupOptions[0],
              deviceName: currentRow.deviceName || 'GATE_IN_65.238',
              logTimestamp: currentRow.logTimestamp
                ? dayjs(currentRow.logTimestamp).format('YYYY-MM-DD HH:mm:ss')
                : `${dayjs().format('YYYY-MM-DD')} 07:30:00`,
              reason: 'Bấm sai giờ ra/vào',
              eventDescription: '1:N authentication succeeded (Fingerprint)',
            }
          : {
              userGroup: userGroupOptions[0] || '3in1',
              deviceName: 'GATE_IN_65.238',
              logTimestamp: `${dayjs().format('YYYY-MM-DD')} 07:30:00`,
              reason: 'Bấm sai giờ ra/vào',
              eventDescription: '1:N authentication succeeded (Fingerprint)',
            }
      }
      onFinish={onFinish}
    >
      <ProFormText
        name="userCode"
        label="Mã nhân viên (User Code)"
        placeholder="Ví dụ: 1200837, 5003049, 1200014..."
        disabled={type === 'update'}
        rules={[{ required: true, message: 'Mã nhân viên là bắt buộc!' }]}
      />

      {type === 'create' && (
        <ProFormText
          name="userName"
          label="Tên nhân viên (User Name)"
          placeholder="Nhập họ và tên nhân viên"
        />
      )}

      <ProFormSelect
        name="userGroup"
        label="Bộ phận / Nhóm (User Group)"
        options={userGroupOptions.map((g) => ({ label: g, value: g }))}
        placeholder="Chọn bộ phận"
        rules={[{ required: true, message: 'Vui lòng chọn bộ phận!' }]}
      />

      {/* 1. COMBOBOX TÊN THIẾT BỊ / CỔNG ĐƯỢC ĐƯA LÊN TRÊN */}
      <ProFormSelect
        name="deviceName"
        label="Tên thiết bị / Cổng (Device Name)"
        options={[
          { label: '🟢 Cổng Vào (GATE_IN_65.238)', value: 'GATE_IN_65.238' },
          { label: '🔴 Cổng Ra (GATE_OUT_65.237)', value: 'GATE_OUT_65.237' },
        ]}
        fieldProps={{
          onChange: (val) => handleDeviceChange(val),
        }}
        rules={[{ required: true, message: 'Vui lòng chọn cổng quẹt thẻ!' }]}
      />

      {/* 2. THỜI GIAN QUẸT THẺ TỰ ĐỘNG CẬP NHẬT THEO CỔNG */}
      <ProFormDateTimePicker
        name="logTimestamp"
        label="Thời gian quẹt thẻ"
        placeholder="Chọn ngày và giờ quẹt thẻ"
        rules={[{ required: true, message: 'Thời gian quẹt thẻ là bắt buộc!' }]}
        fieldProps={{
          format: 'YYYY-MM-DD HH:mm:ss',
          style: { width: '100%' },
        }}
      />

      {/* 3. LÝ DO THÊM MỚI / SỬA (GỢI Ý SẴN HOẶC TỰ NHẬP) */}
      <ProFormSelect
        name="reason"
        label="Lý do điều chỉnh (Đánh dấu nhập tay)"
        options={[
          { label: 'Bấm sai giờ ra/vào', value: 'Bấm sai giờ ra/vào' },
          { label: 'Quên quẹt thẻ đầu ca', value: 'Quên quẹt thẻ đầu ca' },
          { label: 'Quên quẹt thẻ lúc về', value: 'Quên quẹt thẻ lúc về' },
          {
            label: 'Bảo vệ mở cổng không quẹt được',
            value: 'Bảo vệ mở cổng không quẹt được',
          },
          {
            label: 'Máy chấm công lỗi không nhận thẻ',
            value: 'Máy chấm công lỗi không nhận thẻ',
          },
        ]}
        fieldProps={{
          mode: 'tags',
          maxCount: 1,
        }}
        placeholder="Chọn hoặc tự gõ lý do điều chỉnh..."
        rules={[{ required: true, message: 'Vui lòng nhập lý do điều chỉnh!' }]}
      />

      {/* 4. MÔ TẢ SỰ KIỆN MẶC ĐỊNH KHÓA CỨNG */}
      <ProFormText
        name="eventDescription"
        label="Mô tả sự kiện (Event Description)"
        disabled={true}
      />
    </ModalForm>
  );
};

export default RecordModal;
