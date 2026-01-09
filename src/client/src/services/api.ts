import axios from 'axios';

// Cấu hình base URL cho API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Tạo instance axios với cấu hình mặc định
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token vào request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và error
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ xóa token nếu là lỗi 401 và có token trong localStorage
    // Không tự động redirect, để component xử lý
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        // Chỉ xóa token nếu đã có token (tức là đã đăng nhập trước đó)
        // Không xóa nếu đang trong quá trình đăng nhập
        const isLoginRequest = error.config?.url?.includes('/sessions') || 
                              error.config?.url?.includes('/login');
        
        if (!isLoginRequest) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('company');
          localStorage.removeItem('userType');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
