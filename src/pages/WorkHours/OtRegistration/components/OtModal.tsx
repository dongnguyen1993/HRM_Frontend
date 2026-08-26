import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import type { OtRegistrationItem } from '../types';

interface OtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'create' | 'update';
  currentRow?: OtRegistrationItem;
  userGroupOptions: string[];
  onFinish: (values: any) => Promise<boolean>;
}

const OtModal: React.FC<OtModalProps> = ({
  open,
  onOpenChange,
  type,
  currentRow,
  userGroupOptions,
  onFinish,
}) => {
  const formRef = useRef<ProFormInstance>();

  // TỰ ĐỘNG TÍNH GIỜ OT THEO KHUNG GIỜ VÀO/RA DỰ KIẾN
  const calculatePlannedHours = () => {
    const start = formRef.current?.getFieldValue('plannedStartTime');
    const end = formRef.current?.getFieldValue('plannedEndTime');
    if (start && end) {
      const diffMins = dayjs(end).diff(dayjs(start), 'minute');
      if (diffMins >= 30) {
        const hours = Math.round((Math.floor(diffMins / 10) * 10) / 6) / 10;
        formRef.current?.setFieldsValue({ plannedHours: hours });
      }
    }
  };

  return (
    <ModalForm
      formRef={formRef}
      title={
        type === 'create'
          ? '➕ Đăng Ký Tăng Ca (OT Registration)'
          : '✏️ Chỉnh Sửa Đơn Đăng Ký Tăng Ca'
      }
      open={open}
      onOpenChange={onOpenChange}
      preserve={false}
      width={620}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        keyboard: false,
      }}
      initialValues={
        type === 'update' && currentRow
          ? {
              ...currentRow,
              workDate: dayjs(currentRow.workDate),
              plannedStartTime: dayjs(currentRow.plannedStartTime),
              plannedEndTime: dayjs(currentRow.plannedEndTime),
            }
          : {
              workDate: dayjs(),
              shiftId: 1,
              userGroup: userGroupOptions[0] || 'SMT',
              plannedStartTime: dayjs()
                .set('hour', 18)
                .set('minute', 0)
                .set('second', 0),
              plannedEndTime: dayjs()
                .set('hour', 20)
                .set('minute', 0)
                .set('second', 0),
              plannedHours: 2.0,
              otType: 'WEEKDAY_150',
              reason: 'Tăng ca đáp ứng tiến độ đơn hàng nhà máy',
            }
      }
      onFinish={onFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <ProFormSelect
            name={type === 'create' ? 'userCodes' : 'userCode'}
            label={
              type === 'create'
                ? 'Mã nhân viên (Hỗ trợ nhập nhiều)'
                : 'Mã nhân viên'
            }
            placeholder="Gõ mã NV và bấm Enter (vd: 1200837, 5003049...)"
            disabled={type === 'update'}
            fieldProps={
              type === 'create'
                ? {
                    mode: 'tags',
                    tokenSeparators: [',', ' '],
                  }
                : undefined
            }
            rules={[
              { required: true, message: 'Vui lòng nhập ít nhất 1 mã NV!' },
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="userGroup"
            label="Bộ phận / Chuyền sản xuất"
            options={userGroupOptions.map((g) => ({ label: g, value: g }))}
            placeholder="Chọn bộ phận"
            rules={[{ required: true, message: 'Vui lòng chọn bộ phận!' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ProFormDatePicker
            name="workDate"
            label="Ngày đăng ký OT"
            rules={[{ required: true, message: 'Vui lòng chọn ngày OT!' }]}
            fieldProps={{ style: { width: '100%' }, format: 'YYYY-MM-DD' }}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="shiftId"
            label="Ca làm việc"
            options={[
              { label: 'Ca Ngày (07:30 - 18:00)', value: 1 },
              { label: 'Ca Đêm (20:00 - 05:36)', value: 2 },
            ]}
            rules={[{ required: true, message: 'Vui lòng chọn ca!' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ProFormDateTimePicker
            name="plannedStartTime"
            label="Bắt đầu tăng ca (Dự kiến)"
            fieldProps={{
              format: 'YYYY-MM-DD HH:mm:ss',
              style: { width: '100%' },
              onChange: calculatePlannedHours,
            }}
            rules={[{ required: true, message: 'Chọn giờ bắt đầu OT!' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormDateTimePicker
            name="plannedEndTime"
            label="Kết thúc tăng ca (Dự kiến)"
            fieldProps={{
              format: 'YYYY-MM-DD HH:mm:ss',
              style: { width: '100%' },
              onChange: calculatePlannedHours,
            }}
            rules={[{ required: true, message: 'Chọn giờ kết thúc OT!' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ProFormDigit
            name="plannedHours"
            label="Số giờ đăng ký (Giờ)"
            min={0.5}
            max={12}
            fieldProps={{ precision: 1, step: 0.5 }}
            rules={[{ required: true, message: 'Bắt buộc!' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="otType"
            label="Loại tăng ca"
            options={[
              { label: '🟡 Ngày thường (x150%)', value: 'WEEKDAY_150' },
              { label: '🟠 Ngày nghỉ / Chủ nhật (x200%)', value: 'SUNDAY_200' },
              { label: '🔴 Ngày lễ tết (x300%)', value: 'HOLIDAY_300' },
            ]}
            rules={[{ required: true, message: 'Vui lòng chọn loại OT!' }]}
          />
        </Col>
      </Row>

      <ProFormTextArea
        name="reason"
        label="Lý do tăng ca"
        placeholder="Mục đích và nội dung công việc tăng ca..."
      />
    </ModalForm>
  );
};

export default OtModal;
