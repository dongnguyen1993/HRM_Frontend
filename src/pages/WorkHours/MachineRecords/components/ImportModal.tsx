import {
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
  InboxOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  List,
  message,
  Modal,
  Space,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import * as recordService from '../service';

const { Dragger } = Upload;
const { Text } = Typography;

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownloadTemplate = async () => {
    try {
      message.loading({ content: 'Đang tải tệp mẫu...', key: 'tpl' });
      const blob = await recordService.downloadMachineRecordsTemplate();
      const url = window.URL.createObjectURL(new Blob([blob as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Machine_Records_Template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success({ content: 'Tải tệp mẫu thành công!', key: 'tpl' });
    } catch {
      message.error({
        content: 'Không thể tải tệp mẫu từ máy chủ!',
        key: 'tpl',
      });
    }
  };

  // THỰC HIỆN NẠP NHIỀU TỆP
  const executeImport = async (forceImport: boolean = false) => {
    const rawFiles = fileList
      .map((f) => f.originFileObj as File)
      .filter(Boolean);

    if (rawFiles.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 tệp tin!');
      return;
    }

    setLoading(true);
    try {
      const res = await recordService.importMachineRecordsCsv(
        rawFiles,
        forceImport,
      );

      if (res && res.isSuccess) {
        message.success(res.message || 'Nạp toàn bộ dữ liệu thành công!');
        setFileList([]);
        onOpenChange(false);
        onSuccess();
      } else {
        // NẾU BỊ CẢNH BÁO TRÙNG LẶP TỆP
        const errMsg = res?.message || 'Nạp dữ liệu thất bại!';
        if (errMsg.includes('[CẢNH BÁO TRÙNG LẶP]')) {
          Modal.confirm({
            title: '⚠️ Cảnh báo trùng lặp tệp dữ liệu',
            icon: <WarningOutlined style={{ color: '#faad14' }} />,
            content: (
              <div style={{ whiteSpace: 'pre-line', marginTop: 8 }}>
                {errMsg}
                <div
                  style={{ marginTop: 12, fontWeight: 600, color: '#ff4d4f' }}
                >
                  Bạn có chắc chắn muốn nạp đè/nạp tiếp các tệp này không?
                </div>
              </div>
            ),
            okText: 'Vẫn nạp tiếp (Force Import)',
            okType: 'danger',
            cancelText: 'Hủy bỏ',
            width: 550,
            onOk: async () => {
              await executeImport(true); // Nạp ép buộc
            },
          });
        } else {
          message.error(errMsg);
        }
      }
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message || err?.message || 'Lỗi khi nạp tệp!';
      if (serverMsg.includes('[CẢNH BÁO TRÙNG LẶP]')) {
        Modal.confirm({
          title: '⚠️ Cảnh báo trùng lặp tệp dữ liệu',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          content: (
            <div style={{ whiteSpace: 'pre-line', marginTop: 8 }}>
              {serverMsg}
              <div style={{ marginTop: 12, fontWeight: 600, color: '#ff4d4f' }}>
                Bạn có chắc chắn muốn nạp đè/nạp tiếp các tệp này không?
              </div>
            </div>
          ),
          okText: 'Vẫn nạp tiếp (Force Import)',
          okType: 'danger',
          cancelText: 'Hủy bỏ',
          width: 550,
          onOk: async () => {
            await executeImport(true);
          },
        });
      } else {
        message.error(serverMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="📥 Nạp dữ liệu thô máy chấm công (Hỗ trợ nạp nhiều tệp)"
      open={open}
      onCancel={() => {
        onOpenChange(false);
        setFileList([]);
      }}
      maskClosable={false}
      keyboard={false}
      width={680}
      footer={[
        <Button key="cancel" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          disabled={fileList.length === 0}
          onClick={() => executeImport(false)}
          style={{ backgroundColor: '#00A651', borderColor: '#00A651' }}
        >
          Bắt đầu nạp ({fileList.length} tệp)
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Alert
          type="info"
          showIcon
          message="Hỗ trợ nạp hàng loạt (Batch Multi-File Import)"
          description="Hệ thống tự động phát hiện và cảnh báo nếu có tệp đã từng được nạp trước đó nhằm tránh nhân đôi dữ liệu chấm công."
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text strong>Chọn danh sách tệp nguồn từ máy tính:</Text>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            size="small"
            style={{ color: '#1890ff', padding: 0 }}
          >
            Tải tệp mẫu chuẩn (.CSV)
          </Button>
        </div>

        {/* DRAGGER HỖ TRỢ MULTIPLE=TRUE */}
        <Dragger
          multiple={true}
          fileList={fileList}
          accept=".csv, .xlsx, .xls, .dat, .txt"
          beforeUpload={(_, newFiles) => {
            setFileList((prev) => {
              const existingNames = new Set(prev.map((f) => f.name));
              const additions = newFiles
                .filter((f) => !existingNames.has(f.name))
                .map((f) => ({
                  uid: f.name + '_' + Date.now(),
                  name: f.name,
                  size: f.size,
                  status: 'done' as const,
                  originFileObj: f,
                }));
              return [...prev, ...additions];
            });
            return false; // Ngăn chặn AntD tự động upload đơn lẻ
          }}
          showUploadList={false}
          style={{ padding: '16px 0', backgroundColor: '#fafafa' }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#00A651', fontSize: 40 }} />
          </p>
          <p
            className="ant-upload-text"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            Kéo thả một hoặc nhiều tệp dữ liệu vào đây (hoặc click để chọn nhiều
            tệp)
          </p>
          <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
            Hỗ trợ: .CSV, .DAT, .TXT, .XLSX (Chọn nhiều tệp cùng lúc)
          </p>
        </Dragger>

        {/* DANH SÁCH TỆP ĐÃ CHỌN KÈM NÚT XÓA */}
        {fileList.length > 0 && (
          <div
            style={{
              maxHeight: 180,
              overflowY: 'auto',
              border: '1px solid #f0f0f0',
              borderRadius: 6,
              padding: '8px 12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <Text strong style={{ fontSize: 12 }}>
                Đã chọn: <Tag color="blue">{fileList.length} tệp</Tag>
              </Text>
              <Button
                type="link"
                danger
                size="small"
                onClick={() => setFileList([])}
              >
                Xóa tất cả
              </Button>
            </div>
            <List
              size="small"
              dataSource={fileList}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() =>
                        setFileList(fileList.filter((f) => f.uid !== item.uid))
                      }
                    />,
                  ]}
                  style={{ padding: '4px 0' }}
                >
                  <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontSize: 13 }}>{item.name}</span>
                    <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                      ({((item.size || 0) / 1024).toFixed(1)} KB)
                    </span>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportModal;
