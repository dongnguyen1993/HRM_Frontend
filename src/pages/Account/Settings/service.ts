import { request } from '@umijs/max';

export interface MyProfileData {
  userId?: number;
  secureId?: string;
  userCode: string;
  fullName: string;
  email: string;
  plant?: string;
  comment?: string;
  avatarPath?: string;
  status?: number;
  groupId?: number;
  createdAt?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  plant?: string;
  comment?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/**
 * 1. Lấy thông tin cá nhân của người dùng đang đăng nhập
 */
export async function getMyProfile() {
  return request<{ isSuccess: boolean; data: MyProfileData; message?: string }>(
    '/api/users/my-profile',
    { method: 'GET' },
  );
}

/**
 * 2. Cập nhật thông tin cơ bản cá nhân (họ tên, nhà máy, ghi chú)
 */
export async function updateMyProfile(data: UpdateProfileRequest) {
  return request<{ isSuccess: boolean; data: boolean; message?: string }>(
    '/api/users/my-profile',
    {
      method: 'PUT',
      data,
    },
  );
}

/**
 * 3. Tải lên Avatar cá nhân
 */
export async function uploadMyAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<{ isSuccess: boolean; data: string; message?: string }>(
    '/api/users/my-avatar',
    {
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
}

/**
 * 4. Đổi mật khẩu tài khoản
 */
export async function changeMyPassword(payload: ChangePasswordPayload) {
  return request<{ isSuccess: boolean; data: boolean; message?: string }>(
    '/api/users/change-password',
    {
      method: 'PUT',
      data: payload,
    },
  );
}

/**
 * 5. Lấy danh sách Nhà máy (kèm fallback an toàn khi tài khoản không có quyền xem danh mục)
 */
export async function getPlants(): Promise<string[]> {
  try {
    const res = await request<{ isSuccess: boolean; data: string[] }>('/api/users/plants', {
      method: 'GET',
    });
    if (res && res.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch {
    // Không có quyền hoặc lỗi mạng -> fallback danh sách mặc định
  }
  return ['Technics H', 'Technics V'];
}
