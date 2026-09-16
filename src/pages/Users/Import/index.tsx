import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  message,
  Modal,
  Popover,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import * as userService from '../List/service';
import type {
  UserImportPreviewResult,
  UserImportPreviewRow,
} from '../List/service';

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;

const UserImportPage: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<UserImportPreviewResult | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'VALID' | 'ERROR'>('ALL');
  const [backendErrors, setBackendErrors] = useState<string[]>([]);

  // 1. Tải file Excel mẫu
  const handleDownloadTemplate = async () => {
    try {
      message.loading({ content: 'Đang tải tệp tin Excel mẫu...', key: 'dl' });
      const response = await userService.downloadImportTemplate();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'User_Management_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success({ content: 'Tải tệp mẫu thành công!', key: 'dl' });
    } catch {
      message.error({ content: 'Lỗi khi tải tệp tin mẫu từ máy chủ', key: 'dl' });
    }
  };

  // 2. Gọi API Preview phân tích dữ liệu
  const executePreview = async (file: File) => {
    setPreviewLoading(true);
    setBackendErrors([]);
    try {
      const res = await userService.previewImportUsers(file);
      if (res && res.isSuccess && res.data) {
        setPreviewData(res.data);
        message.success(
          `Đã phân tích ${res.data.totalRows} dòng: ${res.data.validRowsCount} hợp lệ, ${res.data.errorRowsCount} lỗi.`,
        );
      } else {
        message.error(res?.message || 'Không thể phân tích dữ liệu tệp Excel');
        setPreviewData(null);
      }
    } catch (err: any) {
      const errRes = err?.response?.data;
      if (errRes && errRes.message) {
        message.error(errRes.message);
      } else {
        message.error('Lỗi khi gửi yêu cầu xem trước tệp Excel');
      }
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 3. Xử lý khi người dùng chọn/kéo thả file
  const handleBeforeUpload = (file: File) => {
    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';

    if (!isExcel) {
      message.error('Chỉ hỗ trợ tệp định dạng Excel (.xlsx hoặc .xls)!');
      return Upload.LIST_IGNORE;
    }

    const uploadFileItem: UploadFile = {
      uid: `${Date.now()}`,
      name: file.name,
      status: 'done',
      size: file.size,
    };

    setFileList([uploadFileItem]);
    setSelectedFile(file);
    executePreview(file);
    return false; // Chặn upload tự động
  };

  // 4. Xóa tệp hiện tại để chọn lại
  const handleReset = () => {
    setFileList([]);
    setSelectedFile(null);
    setPreviewData(null);
    setBackendErrors([]);
    setFilterTab('ALL');
  };

  // 5. Thực hiện Import chính thức vào hệ thống
  const handleConfirmImport = async () => {
    if (!selectedFile) {
      message.warning('Vui lòng chọn tệp tin Excel!');
      return;
    }

    if (!previewData || previewData.validRowsCount === 0) {
      message.warning('Không có dòng dữ liệu hợp lệ nào để nhập!');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận nhập dữ liệu nhân sự',
      icon: <ExclamationCircleOutlined style={{ color: '#00AEEF' }} />,
      content: (
        <div>
          <p>
            Bạn đang chuẩn bị nhập <strong>{previewData.validRowsCount}</strong> nhân viên hợp lệ vào hệ thống.
          </p>
          {previewData.errorRowsCount > 0 && (
            <p style={{ color: '#ff4d4f' }}>
              ⚠️ Lưu ý: Tệp có {previewData.errorRowsCount} dòng bị lỗi. Toàn bộ các dòng lỗi cần được sửa để việc lưu trữ đạt tính toàn vẹn.
            </p>
          )}
          <p>Mật khẩu mặc định sau khi tạo: <code>Hrm@123456</code></p>
        </div>
      ),
      okText: 'Xác nhận Import',
      cancelText: 'Hủy bỏ',
      okButtonProps: { type: 'primary' },
      onOk: async () => {
        setImportLoading(true);
        setBackendErrors([]);
        try {
          const res = await userService.importUsers(selectedFile);
          if (res && res.isSuccess) {
            Modal.success({
              title: 'Nhập dữ liệu thành công!',
              content: res.message || `Đã nhập thành công ${previewData.validRowsCount} nhân viên vào hệ thống.`,
              okText: 'Về Danh sách nhân viên',
              onOk: () => {
                history.push('/system-mgmt/user-management');
              },
            });
            handleReset();
          } else {
            if (Array.isArray(res?.data)) {
              setBackendErrors(res.data);
              message.error(`Nhập dữ liệu thất bại với ${res.data.length} lỗi kiểm duyệt.`);
            } else {
              message.error(res?.message || 'Nhập dữ liệu nhân viên thất bại');
            }
          }
        } catch (err: any) {
          const errData = err?.response?.data;
          if (errData && Array.isArray(errData.data)) {
            setBackendErrors(errData.data);
            message.error(`Nhập dữ liệu thất bại với ${errData.data.length} lỗi.`);
          } else {
            message.error(errData?.message || 'Lỗi hệ thống khi nhập tệp tin Excel');
          }
        } finally {
          setImportLoading(false);
        }
      },
    });
  };

  // Cấu hình các cột của Bảng Xem Trước
  const columns: ColumnsType<UserImportPreviewRow> = [
    {
      title: 'STT Dòng',
      dataIndex: 'rowIndex',
      key: 'rowIndex',
      width: 90,
      align: 'center',
      render: (val, record) => (
        <Space size={4}>
          <Text strong style={{ fontSize: 13 }}>
            #{val}
          </Text>
          {!record.isValid && (
            <Tooltip title="Dòng này có lỗi">
              <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 12 }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isValid',
      key: 'isValid',
      width: 140,
      align: 'center',
      render: (isValid: boolean, record) => {
        if (isValid) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Hợp lệ
            </Tag>
          );
        }
        return (
          <Popover
            title={
              <Space>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                <span>Chi tiết lỗi (Dòng #{record.rowIndex})</span>
              </Space>
            }
            content={
              <div style={{ maxWidth: 360 }}>
                {record.errors.map((err, idx) => (
                  <div key={idx} style={{ color: '#ff4d4f', fontSize: 12, marginBottom: 4 }}>
                    • {err}
                  </div>
                ))}
              </div>
            }
            trigger="hover"
          >
            <Tag icon={<CloseCircleOutlined />} color="error" style={{ cursor: 'pointer' }}>
              Lỗi ({record.errors.length})
            </Tag>
          </Popover>
        );
      },
    },
    {
      title: 'Mã NV',
      dataIndex: 'userCode',
      key: 'userCode',
      width: 120,
      render: (val, record) => (
        <Text strong style={{ color: record.isValid ? '#00AEEF' : '#ff4d4f' }}>
          {val || '—'}
        </Text>
      ),
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
      render: (val) => val || '—',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (val) => val || '—',
    },
    {
      title: 'Nhà máy',
      dataIndex: 'plant',
      key: 'plant',
      width: 130,
      render: (val) => val || <Text type="secondary">Technics H (Mặc định)</Text>,
    },
    {
      title: 'Nhóm quyền',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 140,
      render: (val) => (
        <Tag color="blue">{val || 'Operator (Mặc định)'}</Tag>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (val) => val || <Text type="secondary">—</Text>,
    },
  ];

  // Lọc dữ liệu theo tab đã chọn
  const filteredRows = (previewData?.rows || []).filter((row) => {
    if (filterTab === 'VALID') return row.isValid;
    if (filterTab === 'ERROR') return !row.isValid;
    return true;
  });

  return (
    <PageContainer
      header={{
        title: (
          <Space align="center" size={12}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: '#e6f7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00AEEF',
                fontSize: 20,
              }}
            >
              <FileExcelOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Nhập danh sách Nhân viên từ Excel
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Tải lên tệp Excel chứa dữ liệu nhân viên, kiểm tra lỗi tự động và đồng bộ vào hệ thống
              </Text>
            </div>
          </Space>
        ),
        extra: [
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push('/system-mgmt/user-management')}
          >
            Quay lại danh sách
          </Button>,
          <Button
            key="download-template"
            icon={<DownloadOutlined />}
            type="primary"
            ghost
            onClick={handleDownloadTemplate}
          >
            Tải tệp mẫu Excel (.xlsx)
          </Button>,
        ],
      }}
    >
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        {/* CARD 1: KHU VỰC TẢI LÊN FILE & HƯỚNG DẪN */}
        <Card
          title={
            <Space>
              <UploadOutlined style={{ color: '#00AEEF' }} />
              <span>Bước 1: Chọn hoặc kéo thả tệp Excel</span>
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={15}>
              <Dragger
                maxCount={1}
                fileList={fileList}
                accept=".xlsx, .xls"
                beforeUpload={handleBeforeUpload}
                onRemove={handleReset}
                disabled={previewLoading || importLoading}
                style={{
                  padding: '24px 16px',
                  backgroundColor: '#fafafa',
                  borderRadius: 8,
                  borderColor: selectedFile ? '#00AEEF' : '#d9d9d9',
                }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: selectedFile ? '#00AEEF' : '#bfbfbf', fontSize: 48 }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                  {selectedFile ? selectedFile.name : 'Kéo thả tệp tin Excel vào đây hoặc click để duyệt tệp'}
                </p>
                <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
                  Hỗ trợ định dạng <strong>.xlsx</strong> hoặc <strong>.xls</strong>. Dung lượng tối đa: 20MB
                </p>
                {selectedFile && (
                  <div style={{ marginTop: 12 }}>
                    <Tag color="cyan" style={{ fontSize: 13, padding: '4px 10px' }}>
                      Kích thước: {(selectedFile.size / 1024).toFixed(1)} KB
                    </Tag>
                  </div>
                )}
              </Dragger>

              {selectedFile && (
                <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => selectedFile && executePreview(selectedFile)}
                    loading={previewLoading}
                  >
                    Phân tích lại
                  </Button>
                  <Button danger onClick={handleReset} disabled={previewLoading || importLoading}>
                    Hủy chọn file
                  </Button>
                </div>
              )}
            </Col>

            <Col xs={24} lg={9}>
              <Card
                size="small"
                type="inner"
                title={
                  <Space>
                    <InfoCircleOutlined style={{ color: '#00AEEF' }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Cấu trúc cột dữ liệu bắt buộc</span>
                  </Space>
                }
                style={{ height: '100%', backgroundColor: '#fcfdfe', borderColor: '#e6f7ff' }}
              >
                <Paragraph style={{ fontSize: 12, marginBottom: 8 }}>
                  Tệp tin Excel cần có dòng tiêu đề đầu tiên với các cột chuẩn:
                </Paragraph>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: '#595959', margin: 0, lineHeight: '22px' }}>
                  <li>
                    <code>Ma_NV</code>: Mã nhân viên (<strong style={{ color: '#ff4d4f' }}>Bắt buộc</strong>, duy nhất)
                  </li>
                  <li>
                    <code>Ho_Ten</code>: Họ và tên nhân viên (<strong style={{ color: '#ff4d4f' }}>Bắt buộc</strong>)
                  </li>
                  <li>
                    <code>Email</code>: Địa chỉ Email (<strong style={{ color: '#ff4d4f' }}>Bắt buộc</strong>, đúng định dạng)
                  </li>
                  <li>
                    <code>Nhom_Quyen</code>: Tên nhóm (Ví dụ: <em>Administrator, Manager, Operator</em>)
                  </li>
                  <li>
                    <code>Nha_May</code>: Nhà máy (Ví dụ: <em>Technics H, Main Plant</em>)
                  </li>
                  <li>
                    <code>Ghi_Chu</code>: Ghi chú thêm (Tùy chọn)
                  </li>
                </ul>
                <Divider style={{ margin: '12px 0' }} />
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadTemplate}
                  style={{ padding: 0, fontSize: 12 }}
                >
                  Tải tệp mẫu User_Management.xlsx
                </Button>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* CARD 2: BẢNG XEM TRƯỚC DỮ LIỆU & THỐNG KÊ (NẾU ĐÃ CHỌN FILE) */}
        {previewData && (
          <Card
            title={
              <Space size={12}>
                <span>Bước 2: Kết quả xem trước và kiểm duyệt dữ liệu</span>
                {previewData.errorRowsCount > 0 ? (
                  <Badge count={`Có ${previewData.errorRowsCount} lỗi`} style={{ backgroundColor: '#ff4d4f' }} />
                ) : (
                  <Tag color="success">100% Hợp lệ</Tag>
                )}
              </Space>
            }
            extra={
              <Segmented
                value={filterTab}
                onChange={(val) => setFilterTab(val as any)}
                options={[
                  { label: `Tất cả (${previewData.totalRows})`, value: 'ALL' },
                  { label: `Hợp lệ (${previewData.validRowsCount})`, value: 'VALID' },
                  {
                    label: (
                      <span style={{ color: previewData.errorRowsCount > 0 ? '#ff4d4f' : undefined }}>
                        Có lỗi ({previewData.errorRowsCount})
                      </span>
                    ),
                    value: 'ERROR',
                  },
                ]}
              />
            }
            bordered={false}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            {/* THỐNG KÊ KPI TỔNG QUAN */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col xs={24} sm={8}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: '#e6f7ff',
                    borderColor: '#91d5ff',
                    borderRadius: 8,
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#0050b3' }}>Tổng số bản ghi trong tệp</span>}
                    value={previewData.totalRows}
                    suffix="dòng"
                    valueStyle={{ color: '#0050b3', fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: '#f6ffed',
                    borderColor: '#b7eb8f',
                    borderRadius: 8,
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#389e0d' }}>Dòng hợp lệ sẵn sàng nhập</span>}
                    value={previewData.validRowsCount}
                    prefix={<CheckCircleFilled style={{ color: '#52c41a' }} />}
                    suffix="dòng"
                    valueStyle={{ color: '#389e0d', fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: previewData.errorRowsCount > 0 ? '#fff1f0' : '#fafafa',
                    borderColor: previewData.errorRowsCount > 0 ? '#ffa39e' : '#d9d9d9',
                    borderRadius: 8,
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: previewData.errorRowsCount > 0 ? '#cf1322' : '#8c8c8c' }}>
                        Dòng phát hiện lỗi cần sửa
                      </span>
                    }
                    value={previewData.errorRowsCount}
                    prefix={
                      previewData.errorRowsCount > 0 ? (
                        <CloseCircleFilled style={{ color: '#ff4d4f' }} />
                      ) : undefined
                    }
                    suffix="dòng"
                    valueStyle={{
                      color: previewData.errorRowsCount > 0 ? '#cf1322' : '#8c8c8c',
                      fontWeight: 700,
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* ALERT CẢNH BÁO NẾU CÓ LỖI */}
            {previewData.errorRowsCount > 0 && (
              <Alert
                message="Phát hiện dữ liệu không hợp lệ"
                description={`Có ${previewData.errorRowsCount} dòng trong tệp tin bị lỗi (trùng lặp mã nhân viên, sai định dạng email hoặc thiếu trường bắt buộc). Các dòng lỗi được tô sáng màu đỏ trong bảng. Vui lòng rà soát và chỉnh sửa file Excel trước khi thực hiện import chính thức.`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* ALERT DANH SÁCH LỖI TRẢ VỀ TỪ BACKEND KHI IMPORT THẤT BẠI */}
            {backendErrors.length > 0 && (
              <Alert
                message={`Lỗi kiểm duyệt từ máy chủ (${backendErrors.length} lỗi):`}
                description={
                  <div style={{ maxHeight: 160, overflowY: 'auto', marginTop: 8 }}>
                    {backendErrors.map((err, idx) => (
                      <div key={idx} style={{ color: '#cf1322', fontSize: 12, marginBottom: 2 }}>
                        • {err}
                      </div>
                    ))}
                  </div>
                }
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* BẢNG XEM TRƯỚC */}
            <Table
              rowKey="rowIndex"
              columns={columns}
              dataSource={filteredRows}
              loading={previewLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total) => `Tổng cộng ${total} dòng`,
              }}
              rowClassName={(record) => (!record.isValid ? 'bg-red-50' : '')}
              locale={{
                emptyText: <Empty description="Không có bản ghi nào phù hợp với bộ lọc" />,
              }}
              size="middle"
              bordered
            />

            {/* THANH HÀNH ĐỘNG IMPORT PHÍA DƯỚI */}
            <Divider style={{ margin: '20px 0' }} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <Space>
                <Button onClick={handleReset} disabled={importLoading}>
                  Hủy bỏ & Chọn lại file
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => selectedFile && executePreview(selectedFile)}
                  loading={previewLoading}
                  disabled={importLoading}
                >
                  Tải lại xem trước
                </Button>
              </Space>

              <Space>
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  loading={importLoading}
                  onClick={handleConfirmImport}
                  disabled={previewData.validRowsCount === 0}
                  style={{
                    backgroundColor: previewData.validRowsCount > 0 ? '#00AEEF' : undefined,
                    fontWeight: 600,
                    padding: '0 24px',
                  }}
                >
                  Xác nhận Import ({previewData.validRowsCount} dòng hợp lệ)
                </Button>
              </Space>
            </div>
          </Card>
        )}
      </Space>
    </PageContainer>
  );
};

export default UserImportPage;
