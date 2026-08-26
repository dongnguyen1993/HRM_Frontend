import { ThunderboltOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormDateRangePicker,
  ProFormText,
} from '@ant-design/pro-components';
import { Alert } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { getDefaultTimesheetCycle } from '../hooks/useWorkSummary';

interface CalculateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: {
    dateRange: [string, string];
    userCodeFilter?: string;
  }) => Promise<boolean>;
}

const CalculateModal: React.FC<CalculateModalProps> = ({
  open,
  onOpenChange,
  onFinish,
}) => {
  const defaultCycle = getDefaultTimesheetCycle();

  return (
    <ModalForm
      title={
        <span>
          <ThunderboltOutlined style={{ color: '#faad14', marginRight: 8 }} />
          Kích hoạt Động Cơ Tính Công (Hansol Timesheet Engine)
        </span>
      }
      open={open}
      onOpenChange={onOpenChange}
      width={520}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        keyboard: false,
      }}
      initialValues={{
        dateRange: [dayjs(defaultCycle[0]), dayjs(defaultCycle[1])],
      }}
      onFinish={onFinish}
    >
      <Alert
        type="warning"
        showIcon
        message="Chu kỳ tính toán chuẩn Hansol"
        description="Động cơ sẽ đọc toàn bộ dữ liệu quẹt thẻ thô từ Machine Records, tự động gán Ca Ngày / Ca Đêm, tính giờ làm việc 9.6h và tính toán giờ tăng ca OT làm tròn sàn bước 10 phút sau giờ tan ca."
        style={{ marginBottom: 16 }}
      />

      <ProFormDateRangePicker
        name="dateRange"
        label="Khoảng ngày tính công (Mặc định chu kỳ 11 -> 10)"
        rules={[
          { required: true, message: 'Vui lòng chọn khoảng ngày tính công!' },
        ]}
        fieldProps={{
          style: { width: '100%' },
          format: 'YYYY-MM-DD',
        }}
      />

      <ProFormText
        name="userCodeFilter"
        label="Lọc riêng Mã nhân viên (Tùy chọn)"
        placeholder="Để trống nếu muốn tính toàn bộ công ty"
      />
    </ModalForm>
  );
};

export default CalculateModal;
