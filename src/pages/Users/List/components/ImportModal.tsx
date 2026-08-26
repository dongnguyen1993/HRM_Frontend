import * as userService from '@/pages/Users/List/service';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { Alert, Button, message, Modal, Space, Upload } from 'antd';
import React, { useState } from 'react';

const { Dragger } = Upload;

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
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorList, setErrorList] = useState<string[]>([]);

  // 1. Tải tệp Excel mẫu về máy
  const handleDownloadTemplate = async () => {
    try {
      message.loading('Đang tải tệp tin Excel mẫu...');
      const response = await userService.downloadImportTemplate();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'UsersManagement_Mau.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Tải tệp mẫu thành công!');
    } catch {
      message.error('Lỗi khi tải tệp tin mẫu');
    }
  };

  // 2. Thực thi Import dữ liệu
  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn tệp tin Excel để nhập!');
      return;
    }

    setLoading(true);
    setErrorList([]);

    try {
      const res = await userService.importUsers(fileList[0].originFileObj);
      if (res && res.isSuccess) {
        message.success(res.message || 'Nhập dữ liệu nhân sự thành công!');
        setFileList([]);
        onOpenChange(false);
        onSuccess();
      } else {
        // Nếu Backend trả về danh sách lỗi kiểm duyệt
        if (Array.isArray(res?.data)) {
          setErrorList(res.data);
        } else {
          message.error(res?.message || 'Nhập dữ liệu thất bại');
        }
      }
    } catch (err: any) {
      const errorData = err?.response?.data;
      if (errorData && Array.isArray(errorData.data)) {
        setErrorList(errorData.data);
      } else {
        message.error('Lỗi hệ thống khi nhập tệp tin Excel');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Nhập dữ liệu nhân sự từ Excel"
      open={open}
      onCancel={() => {
        onOpenChange(false);
        setErrorList([]);
        setFileList([]);
      }}
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleImport}
        >
          Thực hiện Import
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {/* NÚT TẢI TỆP MẪU CHUẨN */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Tải tệp Excel mẫu chứa cấu trúc cột chuẩn:</span>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            Tải tệp mẫu (.xlsx)
          </Button>
        </div>

        {/* KHU VỰC KÉO THẢ TỆP TIN */}
        <Dragger
          maxCount={1}
          fileList={fileList}
          accept=".xlsx, .xls"
          beforeUpload={(file) => {
            setFileList([
              {
                uid: file.uid,
                name: file.name,
                status: 'done',
                originFileObj: file,
              },
            ]);
            setErrorList([]);
            return false;
          }}
          onRemove={() => {
            setFileList([]);
            setErrorList([]);
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Kéo thả tệp tin Excel vào đây hoặc click để chọn tệp
          </p>
          <p className="ant-upload-hint">
            Chỉ hỗ trợ tệp định dạng .xlsx hoặc .xls
          </p>
        </Dragger>

        {/* KHUNG HIỂN THỊ CHI TIẾT DANH SÁCH LỖI SAI FORMAT NẾU CÓ */}
        {errorList.length > 0 && (
          <Alert
            message={`Phát hiện ${errorList.length} lỗi trong tệp Excel:`}
            description={
              <div
                style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  marginTop: '8px',
                }}
              >
                {errorList.map((err, idx) => (
                  <div key={idx} style={{ color: '#ff4d4f', fontSize: '12px' }}>
                    • {err}
                  </div>
                ))}
              </div>
            }
            type="error"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
};

export default ImportModal;
