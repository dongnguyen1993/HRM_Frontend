import * as userService from '@/services/userService';
import { UploadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, Image, Space, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useEffect, useState } from 'react';
import type { UserItem } from '../types';

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'create' | 'update';
  currentRow?: UserItem;
  onFinish: (
    values: Partial<UserItem>,
    stagedData: {
      avatarFile: File | null;
      contractFiles: File[];
      deletedAttachmentIds: number[];
    },
  ) => Promise<boolean>;
  handleUploadAvatar: (secureId: string, file: File) => Promise<boolean>;
  handleUploadContract: (secureId: string, file: File) => Promise<boolean>;
}

// 1. SỬA LỖI 2: DỮ LIỆU MẶC ĐỊNH KHỞI TẠO ĐỂ DỊCH SỐ 5 THÀNH 'Operator (LCM)' LẬP TỨC
const defaultGroupOptions = [
  { label: 'Administrator', value: 1 },
  { label: 'Board', value: 2 },
  { label: 'V-Manager (PBA)', value: 3 },
  { label: 'Operator (PBA)', value: 4 },
  { label: 'Operator (LCM)', value: 5 },
  { label: 'K-Manager (LCM)', value: 6 },
  { label: 'V-User (3in1)', value: 7 },
];

const defaultPlantOptions = [
  { label: 'Technics H', value: 'Technics H' },
  { label: 'Technics test', value: 'Technics test' },
  { label: 'Technics V', value: 'Technics V' },
];

const UserModal: React.FC<UserModalProps> = ({
  open,
  onOpenChange,
  type,
  currentRow,
  onFinish,
  handleUploadAvatar,
  handleUploadContract,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [contractFileList, setContractFileList] = useState<UploadFile[]>([]);

  // BỘ BỘ NHỚ LƯU TẠM HÀNH ĐỘNG (CHỈ XỬ LÝ KHI BẤM "ĐỒNG Ý")
  const [stagedAvatarFile, setStagedAvatarFile] = useState<File | null>(null);
  const [stagedContractFiles, setStagedContractFiles] = useState<File[]>([]);
  const [stagedDeletedAttachmentIds, setStagedDeletedAttachmentIds] = useState<
    number[]
  >([]);

  // Tùy chọn Combobox khởi tạo sẵn từ từ điển
  const [plantOptions, setPlantOptions] = useState(defaultPlantOptions);
  const [groupOptions, setGroupOptions] = useState(defaultGroupOptions);

  useEffect(() => {
    if (open) {
      // Reset toàn bộ bộ nhớ tạm mỗi khi mở Popup
      setStagedAvatarFile(null);
      setStagedContractFiles([]);
      setStagedDeletedAttachmentIds([]);

      // Nạp danh sách nhà máy động từ SQL
      userService.getPlants().then((res) => {
        if (res && res.isSuccess && res.data && res.data.length > 0) {
          setPlantOptions(
            res.data.map((p: string) => ({ label: p, value: p })),
          );
        }
      });

      // Nạp danh sách 7 nhóm quyền động từ SQL
      userService.getAuthorGroups().then((res) => {
        if (res && res.isSuccess && res.data) {
          setGroupOptions(
            res.data.map((g: any) => ({
              label: g.groupName || g.GroupName,
              value: g.groupId || g.GroupId,
            })),
          );
        }
      });

      if (type === 'update' && currentRow) {
        if (currentRow.avatarPath) {
          setPreviewUrl(
            `/api/users/${currentRow.secureId}/avatar-file?t=${Date.now()}`,
          );
        } else {
          setPreviewUrl(undefined);
        }

        if (currentRow.attachments && currentRow.attachments.length > 0) {
          const list = currentRow.attachments.map((att: any, idx: number) => {
            // Ép kiểu bắt đúng ID (dù CSDL trả về attachmentId hay AttachmentId)
            const attId = Number(att.attachmentId ?? att.AttachmentId ?? 0);
            return {
              uid: String(attId || -idx - 1),
              attachmentId: attId, // Lưu ID số nguyên chuẩn
              name: att.fileName || att.FileName || 'Tài liệu đính kèm',
              status: 'done' as const,
              url: att.filePath || att.FilePath,
            };
          });
          setContractFileList(list);
        }
      } else {
        setPreviewUrl(undefined);
        setContractFileList([]);
      }
    }
  }, [open, currentRow, type]);

  return (
    <ModalForm
      title={
        type === 'create'
          ? 'Thêm mới nhân viên'
          : 'Chỉnh sửa thông tin nhân viên'
      }
      open={open}
      onOpenChange={onOpenChange}
      preserve={false}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      initialValues={
        type === 'update'
          ? currentRow
          : {
              plant: 'Technics H',
              groupId: 5, // Mặc định Operator (LCM) - Cấp thấp nhất
              status: 1, // Mặc định luôn Active
              userCode: undefined,
              fullName: undefined,
              email: undefined,
              comment: undefined,
            }
      }
      // KHI BẤM "ĐỒNG Ý": Truyền toàn bộ dữ liệu Form + tệp lưu tạm + danh sách ID cần xóa sang trang chính
      onFinish={async (values) => {
        return await onFinish(values, {
          avatarFile: stagedAvatarFile,
          contractFiles: stagedContractFiles,
          deletedAttachmentIds: stagedDeletedAttachmentIds,
        });
      }}
    >
      {/* 1. ẢNH ĐẠI DIỆN */}
      <Form.Item label="Ảnh đại diện nhân viên">
        <Space align="center" size={16}>
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Avatar"
              style={{
                width: 86,
                height: 86,
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid #d9d9d9',
              }}
              preview={{
                mask: <div style={{ fontSize: '11px' }}>Phóng to</div>,
              }}
            />
          )}

          <Upload
            maxCount={1}
            showUploadList={false}
            accept="image/png, image/jpeg, image/jpg"
            beforeUpload={(file) => {
              const isImage =
                file.type === 'image/jpeg' ||
                file.type === 'image/png' ||
                file.name.match(/\.(jpg|jpeg|png)$/i);
              if (!isImage) {
                message.error(
                  'Ảnh đại diện chỉ được phép chọn tệp định dạng JPG hoặc PNG!',
                );
                return Upload.LIST_IGNORE;
              }

              const reader = new FileReader();
              reader.onload = (e) => setPreviewUrl(e.target?.result as string);
              reader.readAsDataURL(file);

              // CHỈ LƯU TẠM VÀO BỘ NHỚ, CHƯA GỌI API LƯU NGAY!
              setStagedAvatarFile(file);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />}>
              {previewUrl ? 'Thay đổi ảnh đại diện' : 'Tải lên ảnh đại diện'}
            </Button>
          </Upload>
        </Space>
      </Form.Item>

      {/* 2. NHÀ MÁY (COMBOBOX CÓ DATA KHỞI TẠO NÊN HIỂN THỊ CHUẨN XÁC) */}
      <ProFormSelect
        name="plant"
        label="Nhà máy (Plant)"
        options={plantOptions}
        rules={[{ required: true, message: 'Nhà máy là bắt buộc!' }]}
      />

      {/* 3. NHÓM QUYỀN (HIỂN THỊ "Operator (LCM)" THAY VÌ SỐ 5) */}
      <ProFormSelect
        name="groupId"
        label="Nhóm quyền liên kết (Author Group ID)"
        options={groupOptions}
        rules={[{ required: true, message: 'Nhóm quyền là bắt buộc!' }]}
      />

      <ProFormText
        name="userCode"
        label="Mã nhân viên (User ID)"
        placeholder="Nhập mã nhân viên (Chỉ nhập chữ số)"
        disabled={type === 'update'}
        getValueFromEvent={(e) => e.target.value.replace(/[^0-9]/g, '')}
        fieldProps={{
          autoComplete: 'off',
        }}
        rules={[
          { required: true, message: 'Mã nhân viên là bắt buộc!' },
          {
            pattern: /^[0-9]+$/,
            message: 'Mã nhân viên chỉ được chứa các chữ số!',
          },
        ]}
      />

      <ProFormText
        name="fullName"
        label="Họ và tên (User Name)"
        placeholder="Nhập họ và tên"
        rules={[{ required: true, message: 'Họ và tên là bắt buộc!' }]}
      />

      <ProFormText
        name="email"
        label="Email"
        placeholder="Nhập địa chỉ email"
        rules={[
          { required: true, message: 'Email là bắt buộc!' },
          { type: 'email', message: 'Email không đúng định dạng!' },
        ]}
      />

      {type === 'create' && (
        <ProFormText.Password
          name="password"
          label="Mật khẩu khởi tạo"
          placeholder="Nhập mật khẩu"
          fieldProps={{
            autoComplete: 'new-password',
          }}
          rules={[{ required: true, message: 'Mật khẩu là bắt buộc!' }]}
        />
      )}

      {type === 'update' && (
        <ProFormSelect
          name="status"
          label="Trạng thái hoạt động (Use Flag)"
          options={[
            { label: 'Đang hoạt động (Yes)', value: 1 },
            { label: 'Khóa / Đã xóa (No)', value: 0 },
          ]}
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
        />
      )}

      <ProFormText
        name="comment"
        label="Ghi chú hệ thống (Comment)"
        placeholder="Nhập ghi chú hoặc mã số cũ nếu có"
      />

      {/* 4. TỆP ĐÍNH KÈM (XÓA/THÊM TẠM THỜI, BẤM ĐỒNG Ý MỚI GỬI API THỰC TẾ) */}
      {/* 4. TỆP ĐÍNH KÈM (HỖ TRỢ CHỌN CÙNG LÚC NHIỀU FILE AN TOÀN) */}
      <Form.Item label="Tài liệu đính kèm (Tối đa 5 tệp)">
        <Upload
          maxCount={5}
          multiple={true}
          fileList={contractFileList}
          accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx"
          beforeUpload={(file, fileList) => {
            // Kiểm tra nếu là file đầu tiên trong đợt chọn này -> Xử lý gom toàn bộ mảng fileList
            if (file === fileList[0]) {
              // Lọc ra các file đúng định dạng Office
              const validFiles = fileList.filter((f) =>
                f.name.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i),
              );

              if (validFiles.length < fileList.length) {
                message.error(
                  'Một số tệp không đúng định dạng Word, Excel hoặc PowerPoint đã bị bỏ qua!',
                );
              }

              // Cập nhật danh sách File lưu tạm gửi Server khi bấm Đồng ý (Tối đa 5 file)
              setStagedContractFiles((prev) => {
                const combined = [...prev, ...validFiles];
                if (combined.length > 5) {
                  message.warning('Chỉ được đính kèm tối đa 5 tệp tin!');
                }
                return combined.slice(0, 5);
              });

              // Cập nhật danh sách hiển thị trên giao diện Modal
              setContractFileList((prev) => {
                const newItems: UploadFile[] = validFiles.map((f) => ({
                  uid: f.uid || String(Date.now() + Math.random()),
                  name: f.name,
                  status: 'done',
                  originFileObj: f,
                }));
                const combined = [...prev, ...newItems];
                return combined.slice(0, 5);
              });
            }

            return false; // Ngăn AntD tự động upload đơn lẻ
          }}
          onRemove={(file: any) => {
            // Trích xuất ID chính xác của tệp đính kèm dưới CSDL
            const idToDelete = Number(
              file.attachmentId || file.AttachmentId || 0,
            );

            if (idToDelete > 0) {
              // Ghi nhớ ID file cần xóa vào bộ nhớ tạm (CHƯA XÓA NGAY)
              setStagedDeletedAttachmentIds((prev) => [...prev, idToDelete]);
            }

            // Loại bỏ file khỏi danh sách vừa chọn mới nếu có
            if (file.originFileObj) {
              setStagedContractFiles((prev) =>
                prev.filter((f) => f !== file.originFileObj),
              );
            }

            // Loại bỏ file khỏi giao diện hiển thị
            setContractFileList((prev) =>
              prev.filter((item) => item.uid !== file.uid),
            );
            return true;
          }}
        >
          {contractFileList.length < 5 && (
            <Button icon={<UploadOutlined />}>
              Thêm tệp đính kèm ({contractFileList.length}/5)
            </Button>
          )}
        </Upload>
      </Form.Item>
    </ModalForm>
  );
};

export default UserModal;
