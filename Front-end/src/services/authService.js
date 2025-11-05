import api from './api';

/**
 * Service xử lý authentication
 */
const authService = {
  /**
   * Đăng nhập người dùng
   * @param {string} username - Tên tài khoản
   * @param {string} password - Mật khẩu
   * @returns {Promise} Response từ API
   */
  login: async (username, password) => {
    const response = await api.post('/users/login', {
      username,
      password,
    });
    
    // Backend trả về user object trực tiếp (chưa có JWT token)
    const userData = response.data;
    
    // Lưu thông tin user vào localStorage để xác thực
    if (userData && userData.userID) {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userID', userData.userID.toString());
    }
    
    return userData;
  },

  /**
   * Đăng xuất người dùng
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userID');
  },

  /**
   * Lấy thông tin user hiện tại
   * @returns {Object|null} User object hoặc null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('user');
  },
};

export default authService;

