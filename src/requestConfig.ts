import type { RequestConfig } from '@umijs/max';
import { request as umiRequest } from '@umijs/max';

export const requestConfig: RequestConfig = {
  timeout: 300000,

  // Interceptor tự động đính kèm Token cho mỗi yêu cầu gửi đi
  requestInterceptors: [
    (config: any) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  ],

  errorConfig: {
    // Bộ bắt lỗi nâng cao tích hợp Silent Token Rotation
    errorHandler: async (error: any) => {
      const { response, config } = error;

      // Nếu gặp lỗi 401 (Hết hạn Access Token) và yêu cầu này chưa từng được thử lại ngầm
      if (
        response &&
        response.status === 401 &&
        config &&
        !config.headers?._retry
      ) {
        // Đánh dấu yêu cầu này đã được retry ngầm để tránh lặp vô tận nếu cả hai token đều hết hạn
        if (!config.headers) {
          config.headers = {};
        }
        config.headers._retry = true;

        // Chống xung đột: nếu nhiều request 401 cùng lúc, chỉ cho 1 request thực hiện refresh
        if (window.__refreshTokenPromise) {
          try {
            await window.__refreshTokenPromise;
            // Lấy token mới sau khi refresh xong và thử lại request gốc
            const newToken = localStorage.getItem('accessToken');
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
              return umiRequest(config.url, config);
            }
          } catch {
            // Refresh thất bại ở tiến trình khác -> chuyển tới xử lý cuối
          }
        } else {
          try {
            // 1. Gọi API Refresh Token ngầm sử dụng HttpOnly Cookie an toàn
            const refreshPromise = umiRequest<any>('/api/auth/refresh-token', {
              method: 'POST',
              // Truyền cờ _retry vào header để bỏ qua middleware bắt lỗi lặp
              headers: { _retry: 'true' } as any,
            });
            window.__refreshTokenPromise = refreshPromise;

            const refreshRes = await refreshPromise;

            if (
              refreshRes &&
              refreshRes.isSuccess &&
              refreshRes.data?.accessToken
            ) {
              const newToken = refreshRes.data.accessToken;

              // 2. Ghi đè Access Token mới thu được vào Local Storage
              localStorage.setItem('accessToken', newToken);

              // 3. Cập nhật lại Authorization Header mới
              config.headers.Authorization = `Bearer ${newToken}`;

              // 4. Thực thi lại yêu cầu gốc ban đầu bị lỗi một cách hoàn toàn tự động
              return umiRequest(config.url, config);
            }
          } catch (refreshError) {
            // Nếu cả Refresh Token cũng hết hạn (sau 7 ngày), dọn dẹp bộ nhớ và đẩy ra trang Đăng nhập
            localStorage.clear();
            window.location.href = '/user/login';
            throw refreshError;
          } finally {
            window.__refreshTokenPromise = null;
          }
        }
      }

      // Xử lý chặn cuối nếu refresh thất bại hoặc gặp lỗi 401 khác
      if (response && response.status === 401) {
        localStorage.clear();
        window.location.href = '/user/login';
      }

      throw error;
    },
  },
};
