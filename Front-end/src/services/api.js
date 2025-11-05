import axios from 'axios';

// Cấu hình base URL cho API
// Sử dụng '/api' để dùng Vite proxy (bypass CORS)
const API_BASE_URL = '/api';

// Tạo instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để xử lý response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - xóa thông tin đăng nhập và chuyển về trang login
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userID');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

