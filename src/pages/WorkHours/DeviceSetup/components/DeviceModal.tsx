import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import React from 'react';
import type { DeviceSetupItem } from '../types';

interface DeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'create' | 'update';
  currentRow?: DeviceSetupItem;
  groupOptions: string[];
  onFinish: (values: any) => Promise<boolean>;
}

const DeviceModal: React.FC<DeviceModalProps> = ({
  open,
  onOpenChange,
  type,
  currentRow,
  groupOptions,
  onFinish,
}) => {
  return (
    <ModalForm
      title={
        type === 'create'
          ? '➕ Thiết Lập Thiết Bị Mới'
          : '✏️ Cập Nhật Thông Tin Thiết Bị'
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
          ? currentRow
          : {
              deviceGroup: 'SECURITY_GATE_IN_OUT',
              deviceType: 'BioEntry P2',
              gateDirection: 'GATE_IN',
              port: 51211,
              deviceStatus: 'Normal',
            }
      }
      onFinish={onFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <ProFormText
            name="bioStarDeviceId"
            label="Mã Device ID (BioStar 2)"
            placeholder="Ví dụ: 541636534..."
            disabled={type === 'update'}
            rules={[{ required: true, message: 'Device ID là bắt buộc!' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormText
            name="deviceName"
            label="Tên Thiết Bị / Cổng"
            placeholder="Ví dụ: GATE_IN_65.238..."
            rules={[{ required: true, message: 'Tên thiết bị là bắt buộc!' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ProFormSelect
            name="deviceGroup"
            label="Nhóm Thiết Bị (Group)"
            options={groupOptions.map((g) => ({ label: g, value: g }))}
            placeholder="Chọn nhóm"
            rules={[{ required: true, message: 'Vui lòng chọn nhóm!' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="gateDirection"
            label="Chiều Quẹt (Gate Direction)"
            tooltip="Quyết định thiết bị này sẽ được dùng làm giờ Vào (Check-In), giờ Ra (Check-Out), Máy Xưởng, Văn Phòng hay Nhà Ăn"
            options={[
              { label: '🟢 Cổng Vào (GATE_IN)', value: 'GATE_IN' },
              { label: '🔴 Cổng Ra (GATE_OUT)', value: 'GATE_OUT' },
              { label: '🟣 Phân Xưởng (WORKSHOP)', value: 'WORKSHOP' },
              { label: '🔵 Khối Văn Phòng (OFFICE)', value: 'OFFICE' },
              { label: '🟠 Nhà Ăn (CANTEEN)', value: 'CANTEEN' },
            ]}
            rules={[{ required: true, message: 'Vui lòng chọn chiều quẹt!' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ProFormText
            name="ipAddress"
            label="Địa chỉ IP (Device Address)"
            placeholder="Ví dụ: 172.26.65.238"
            rules={[{ required: true, message: 'Địa chỉ IP là bắt buộc!' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormDigit
            name="port"
            label="Cổng Port"
            min={1}
            max={65535}
            fieldProps={{ precision: 0 }}
          />
        </Col>
      </Row>

      <ProFormTextArea
        name="description"
        label="Ghi chú vị trí"
        placeholder="Ghi chú vị trí lắp đặt..."
      />
    </ModalForm>
  );
};

export default DeviceModal;
