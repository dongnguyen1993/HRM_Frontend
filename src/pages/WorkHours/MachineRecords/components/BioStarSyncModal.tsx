import { SyncOutlined } from '@ant-design/icons';
import { ModalForm, ProFormDateTimePicker } from '@ant-design/pro-components';
import { Alert, Col, Row } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface BioStarSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: { fromTime: string; toTime: string }) => Promise<boolean>;
}

const BioStarSyncModal: React.FC<BioStarSyncModalProps> = ({
  open,
  onOpenChange,
  onFinish,
}) => {
  return (
    <ModalForm
      title={
        <span>
          <SyncOutlined spin style={{ color: '#1890ff', marginRight: 8 }} />
          Đồng bộ Trực tiếp từ Máy chủ Suprema BioStar 2
        </span>
      }
      open={open}
      onOpenChange={onOpenChange}
      width={560}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        keyboard: false,
      }}
      initialValues={{
        fromTime: dayjs()
          .subtract(1, 'day')
          .set('hour', 9)
          .set('minute', 0)
          .set('second', 0),
        toTime: dayjs(),
      }}
      onFinish={async (values) => {
        return onFinish({
          fromTime: dayjs(values.fromTime).format('YYYY-MM-DDTHH:mm:ss'),
          toTime: dayjs(values.toTime).format('YYYY-MM-DDTHH:mm:ss'),
        });
      }}
    >
      <Alert
        type="info"
        showIcon
        message="Kết nối Máy chủ Suprema BioStar 2 (172.26.75.34:9443)"
        description="Hệ thống tự động đồng bộ hằng ngày lúc 09:15 AM. Bạn có thể sử dụng chức năng này để đồng bộ tức thời các lượt quẹt thẻ mới nhất."
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16}>
        <Col span={12}>
          <ProFormDateTimePicker
            name="fromTime"
            label="Từ thời điểm"
            rules={[{ required: true, message: 'Bắt buộc chọn!' }]}
            fieldProps={{
              format: 'YYYY-MM-DD HH:mm:ss',
              style: { width: '100%' },
            }}
          />
        </Col>
        <Col span={12}>
          <ProFormDateTimePicker
            name="toTime"
            label="Đến thời điểm"
            rules={[{ required: true, message: 'Bắt buộc chọn!' }]}
            fieldProps={{
              format: 'YYYY-MM-DD HH:mm:ss',
              style: { width: '100%' },
            }}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

export default BioStarSyncModal;
