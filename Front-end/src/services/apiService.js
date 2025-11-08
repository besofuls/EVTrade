// API service for handling all backend communications

const API_BASE_URL = "http://localhost:8080/api";

const apiService = {
  // thêm export của API_BASE_URL để các module khác có thể dùng trực tiếp
  API_BASE_URL,
  // thiết lập các phương thức api ở đây
  //api complaint controller (feedback)
  /**
   * @param {number} complaintId - ID của khiếu nại cần giải quyết.
   */
  resolve_complaint: async function (complaintId, status) {
    const token = this.getAuthToken();
    if (!token) throw new Error("Bạn cần đăng nhập.");
    const res = await fetch(`${API_BASE_URL}/complaints/${complaintId}/resolve`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Không thể cập nhật trạng thái khiếu nại");
    }

    return await res.json();
  },

  /**
   * Lấy danh sách khiếu nại (dành cho admin/moderator).
   * @param {object} params - ví dụ { status: 'Pending' }
   */
  get_all_complaints: async function (params = {}) {
    const token = this.getAuthToken();
    if (!token) throw new Error("Bạn cần đăng nhập.");

    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : "";

    const res = await fetch(`${API_BASE_URL}/complaints${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Không thể tải danh sách khiếu nại");
    }

    if (res.status === 204) return [];

    return await res.json();
  },

  createComplaint: async function ({ listingId, content }) {
    const token = this.getAuthToken();
    if (!token) throw new Error("Bạn cần đăng nhập để gửi khiếu nại.");

    const userData = (() => {
      try {
        return JSON.parse(localStorage.getItem("userData") || "{}");
      } catch {
        return {};
      }
    })();

    const userId = userData?.userID;
    if (!userId) throw new Error("Không xác định được người dùng. Vui lòng đăng nhập lại.");

    const payload = {
      userId,
      listingId: Number(listingId),
      content,
    };

    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Không thể gửi khiếu nại");
    }

    return await res.json();
  },

  getMyComplaints: async function () {
    const token = this.getAuthToken();
    if (!token) throw new Error("Bạn cần đăng nhập.");

    const userData = (() => {
      try {
        return JSON.parse(localStorage.getItem("userData") || "{}");
      } catch {
        return {};
      }
    })();

    const userId = userData?.userID;
    if (!userId) throw new Error("Không xác định được người dùng. Vui lòng đăng nhập lại.");

    const list = await this.get_all_complaints();
    return Array.isArray(list) ? list.filter((item) => item?.user?.userID === userId) : [];
  },

  //review controller
  create_new_review: async function (reviewPayload) {
    const token = this.getAuthToken();
    if (!token) throw new Error("Vui lòng đăng nhập để đánh giá.");

    const userData = (() => {
      try {
        return JSON.parse(localStorage.getItem("userData") || "{}");
      } catch {
        return {};
      }
    })();

    const resolvedUserId = reviewPayload?.userId ?? userData?.userID;
    const payload = {
      ...reviewPayload,
      userId: resolvedUserId != null ? Number(resolvedUserId) : resolvedUserId,
    };

    if (!payload.userId) {
      throw new Error("Không xác định được người dùng. Vui lòng đăng nhập lại.");
    }

    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Không thể gửi đánh giá");
    }

    return await res.json();
  },

  get_reviews_for_listing: async function (listingId) {
    const res = await fetch(`${API_BASE_URL}/reviews/listing/${listingId}`, {
      headers: {
        Accept: "*/*",
      },
    });

    if (res.status === 204) {
      return [];
    }

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Không thể tải danh sách đánh giá");
    }

    return await res.json();
  },

  getSellerFeedback: async function (sellerId) {
    if (!sellerId) throw new Error("Thiếu mã người bán");

    const token = this.getAuthToken();
    const headers = {
      Accept: "*/*",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/sellers/${sellerId}/feedback`, {
      headers,
    });

    if (res.status === 204) return null;

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Không thể tải đánh giá người bán");
    }

    return await res.json();
  },

  //favorite controller
  /**
   * Thêm một bài đăng vào danh sách yêu thích (POST).
   * @param {number} listingId - ID của bài đăng cần thêm.
   */
  add_favorite: (listingId) =>
    `${API_BASE_URL}/favorites/listings/${listingId}`,

  /**
   * Xóa một bài đăng khỏi danh sách yêu thích (DELETE).
   * @param {number} listingId - ID của bài đăng cần xóa.
   */
  remove_favorite: (listingId) =>
    `${API_BASE_URL}/favorites/listings/${listingId}`,

  /**
   * Lấy danh sách tất cả các bài đăng yêu thích của người dùng (GET).
   */
  get_my_favorites: `${API_BASE_URL}/favorites/listings`,

  // User authentication endpoints
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Tên đăng nhập hoặc mật khẩu không đúng");
    }

    const data = await response.json();
    persistAuthData(data);

    return data;
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Đăng ký thất bại");
    }

    // Debug: Log response từ backend
    console.log("Register response status:", response.status);

    // Parse response - backend có thể trả JSON hoặc text
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      console.log("Register response (JSON):", data);
    } else {
      data = await response.text();
      console.log("Register response (Text):", data);
      // Nếu backend trả text, wrap thành object
      data = { success: true, message: data };
    }

    return data;
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem("authToken");

      // Gọi API logout nếu có token
      if (token) {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Logout response:", response.status);

        // Không cần kiểm tra response.ok vì dù API fail vẫn phải clear localStorage
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Tiếp tục clear localStorage dù API lỗi
    } finally {
      // Luôn luôn xóa localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userID");

      console.log("Local storage cleared");
    }
  },

  // Utility methods
  setAuthToken: (token) => {
    localStorage.setItem("authToken", token);
  },

  getAuthToken: () => {
    return localStorage.getItem("authToken");
  },

  clearAuthToken: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userID");
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    return !!(token && userData);
  },

  getTokenPayload: function () {
    const token = this.getAuthToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  },

  isTokenExpired: function () {
    const token = this.getAuthToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  // Social login (Google OAuth || Facebook OAuth)
  socialLogin: async function ({ provider, accessToken }) {
    const res = await fetch(`${API_BASE_URL}/auth/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({ provider, accessToken }),
    });
    if (!res.ok) throw new Error("Social login failed");
    const data = await res.json();
    persistAuthData(data);
    return data;
  },

  // Google OAuth login with authorization code
  googleCodeLogin: async (code) => {
    const res = await fetch(`${API_BASE_URL}/auth/google/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error("Google login failed");
    const data = await res.json();
    persistAuthData(data);
    return data;
  },

  ///////////////////////////////////////////////////////////////////////////////
  // API PROFILE NGƯỜI DÙNG
  getProfile: async function (userId) {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Không thể tải hồ sơ người dùng");
    return await res.json();
  },

  updateProfile: async function (userId, profileData) {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error("Cập nhật hồ sơ thất bại");
    return await res.json();
  },

  getUserListings: async function () {
    const token = this.getAuthToken();
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const userId = userData.userID;
    if (!userId) throw new Error("Không tìm thấy userID");

    const url = new URL(`${API_BASE_URL}/listings`);
    url.searchParams.append("userId", userId);
    url.searchParams.append("size", "100"); // Giới hạn 100 bài đăng

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể tải danh sách bài đăng");
    return await res.json();
  },

  

  ///////////////////////////////////////////////////////////////////////////////
  // API TẠO BÀI ĐĂNG SẢN PHẨM
  // Lấy danh sách brand (public, không cần token)
  getBrands: async function () {
    const res = await fetch(`${API_BASE_URL}/brands`, {
      headers: {
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể tải danh sách hãng xe");
    return await res.json();
  },

  // Lấy danh sách category (public, không cần token)
  getCategories: async function () {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể tải danh sách danh mục xe");
    return await res.json();
  },

  // API VỀ BÀI ĐĂNG SẢN PHẨM
  // Tạo bài đăng sản phẩm mới với hình ảnh
  createProductPost: async function (listingObj, images) {
    const token = this.getAuthToken();
    const form = new FormData();

    // Đưa toàn bộ thông tin bài đăng vào field 'listing' dưới dạng JSON string
    form.append("listing", JSON.stringify(listingObj));

    // Đưa từng ảnh vào field 'images'
    if (images && Array.isArray(images)) {
      images.forEach((file) => {
        form.append("images", file);
      });
    }

    const res = await fetch(`${API_BASE_URL}/listings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // KHÔNG đặt Content-Type, để browser tự set boundary
      },
      body: form,
    });

    if (!res.ok) throw new Error("Không thể tạo bài đăng sản phẩm");
    return await res.json();
  },

  // Tìm kiếm bài đăng sản phẩm (public, không cần token)
  searchProductPosts: async function (searchParams) {
    const query = new URLSearchParams(searchParams).toString();
    const res = await fetch(`${API_BASE_URL}/listings/search?${query}`, {
      headers: {
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể tìm kiếm bài đăng sản phẩm");
    return await res.json();
  },

  // Lấy chi tiết bài đăng sản phẩm theo ID (public, không cần token)
  getProductPostById: async function (listingId) {
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
      headers: {
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể tải chi tiết bài đăng sản phẩm");
    return await res.json();
  },

  // Cập nhật bài đăng
  updateProductPost: async function (listingId, listingObj, images) {
    const token = this.getAuthToken();
    const form = new FormData();
    form.append("listing", JSON.stringify(listingObj));
    if (images && Array.isArray(images)) {
      images.forEach((file) => {
        form.append("images", file);
      });
    }
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Cập nhật bài đăng thất bại");
    }
    return await res.json();
  },

  // Lấy cấu hình hệ thống public (ví dụ: giá gia hạn)
  getExtendConfig: async function () {
    // Giả sử backend có endpoint này để trả về các config public
    // GET /api/system-config/public?keys=EXTEND_PRICE_PER_DAY
    const res = await fetch(`${API_BASE_URL}/system-config/public?keys=EXTEND_PRICE_PER_DAY`);
    if (!res.ok) return { EXTEND_PRICE_PER_DAY: 5000 }; // Giá trị mặc định
    const configs = await res.json();
    return configs;
  },

  updateExtendConfig: async function (pricePerDay) {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/system-config/extend-price`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({ pricePerDay }),
    });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Không thể cập nhật cấu hình hệ thống");
    }
    return await res.json();
  },

  // Tạo thanh toán để gia hạn bài đăng
  createExtendPayment: async function (listingId, days) {
    const token = this.getAuthToken();
    const url = new URL(`${API_BASE_URL}/listings/${listingId}/extend-payment`);
    url.searchParams.append("days", days);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Không thể tạo yêu cầu gia hạn");
    }
    return await res.json();
  },

  ///////////////////////////////////////////////////////////////////////////////

  // API VỀ ĐƠN HÀNG
  // Tạo đơn hàng mới
  createOrder: async function (orderObj) {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(orderObj),
    });
    if (!res.ok) throw new Error("Không thể tạo đơn hàng");
    return await res.json();
  },

  // Lấy danh sách đơn hàng của user hiện tại
  getMyOrders: async function () {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
    return await res.json();
  },

  //////////////////////////////////////////////////////////////////////////////////

  // API GIAO DỊCH VÀ THANH TOÁN
  // Lấy danh sách giao dịch của user hiện tại
  getTransactions: async function () {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    if (res.status === 204) {
      return [];
    }

    if (!res.ok) {
      let message = "Không thể tải giao dịch";
      if (res.status === 401) {
        message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (res.status === 403) {
        message = "Bạn không có quyền truy cập giao dịch này.";
      }
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }

    return await res.json();
  },

  // Tạo thanh toán cho một giao dịch
  createPayment: async function ({ transactionId, amount }) {
    const token = this.getAuthToken();
    const body = {
      transactionId,
      amount,
      paymentMethod: "VNPAY",
      paymentProvider: "VNPAY",
    };
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Không tạo được thanh toán");
    return await res.json();
  },
  ////////////////////////////////////////////////////////////////////////////////
  // API CHO ADMIN VÀ MODERATOR
  // Lấy danh sách tất cả người dùng (chỉ dành cho Admin)
  getAllUsers: async function () {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể tải danh sách người dùng");
    return await res.json();
  },

  getAdminOverviewStats: async function () {
    const token = this.getAuthToken();
    if (!token) throw new Error("Bạn cần đăng nhập.");

    const res = await fetch(`${API_BASE_URL}/admin/stats/overview`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Không thể tải số liệu thống kê");
    }

    return await res.json();
  },

  // Khóa hoặc mở khóa người dùng (chỉ dành cho Admin)
  disableUser: async function (userId) {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/users/${userId}/disable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể khóa người dùng");
    return await res.json();
  },

  // Mở khóa người dùng (chỉ dành cho Admin)
  enableUser: async function (userId) {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/users/${userId}/enable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể mở khóa người dùng");
    return await res.json();
  },

  // Lấy danh sach tất cả bài đăng (chỉ dành cho Moderator và Admin)
  getAllListings: async function () {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/listings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể tải danh sách bài đăng");
    return await res.json();
  },

  // Lấy danh sách tất cả bài đăng status PENDING (chỉ dành cho Moderator và Admin)
  getListingsPending: async function () {
    const token = this.getAuthToken();
    const url = new URL(`${API_BASE_URL}/listings`);
    url.searchParams.append("status", "PENDING");
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể tải danh sách bài đăng");
    return await res.json();
  },

  // Phê duyệt bài đăng (chỉ dành cho Moderator và Admin)
  approveListing: async function (listingId) {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (!res.ok) throw new Error("Không thể phê duyệt bài đăng");
    return await res.json();
  },

  // Từ chối bài đăng (chỉ dành cho Moderator và Admin)
  rejectListing: async function (id, reason) {
    const res = await fetch(
      `${API_BASE_URL}/listings/${id}/reject?reason=${encodeURIComponent(
        reason
      )}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          Accept: "*/*",
        },
      }
    );
    if (!res.ok) throw new Error("Từ chối bài đăng thất bại");
    return await res.json();
  },

  // Lấy danh sách tất cả giao dịch (chỉ dành cho Admin)
  getAllTransactions: async function () {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/admin/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Không thể tải danh sách giao dịch");
    }
    return await res.json();
  },

  getOrdersForAdmin: async function () {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (res.status === 204) {
      return [];
    }
    if (!res.ok) {
      const message = res.status === 401
        ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        : "Không thể tải danh sách đơn hàng";
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    return await res.json();
  },

  createContract: async function (contractData) {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/contracts/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(contractData),
    });
    if (!res.ok) {
      const text = await res.text();
      const error = new Error(text || "Không thể tạo hợp đồng");
      error.status = res.status;
      throw error;
    }
    return await res.json();
  },

  getContractsForAdmin: async function () {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/contracts/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (res.status === 204) {
      return [];
    }
    if (!res.ok) {
      const message = res.status === 401
        ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        : "Không thể tải danh sách hợp đồng";
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    return await res.json();
  },

  getContractByOrder: async function (orderId) {
    const token = this.getAuthToken();
    const res = await fetch(`${API_BASE_URL}/contracts/order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    if (res.status === 404) {
      const error = new Error("Không tìm thấy hợp đồng");
      error.status = 404;
      throw error;
    }
    if (!res.ok) {
      const text = await res.text();
      const error = new Error(text || "Không thể tải thông tin hợp đồng");
      error.status = res.status;
      throw error;
    }
    if (res.status === 204) {
      return null;
    }
    return await res.json();
  },

  // Lấy lịch sử thanh toán của giao dịch (chỉ dành cho Admin)
  getTransactionPayments: async function (transactionId) {
    const token = this.getAuthToken();
    const res = await fetch(
      `${API_BASE_URL}/admin/transactions/${transactionId}/payments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      }
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Không thể tải lịch sử thanh toán");
    }
    return await res.json();
  },

  ///////////////////////////////////////////////////////////////////////////////
};

export default apiService;

const persistAuthData = (data) => {
  if (!data || !data.token) return;

  localStorage.setItem("authToken", data.token);
  localStorage.setItem("tokenType", data.tokenType || "Bearer ");

  const userData = {
    id: data.userID,
    userID: data.userID,
    username: data.username,
    email: data.email,
    roles: [data.role && data.role.toUpperCase()],
  };

  localStorage.setItem("userData", JSON.stringify(userData));
  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userID", data.userID);
  localStorage.setItem("username", data.username);

  const roleAttribute = data.role;
  let roleId = 3;
  if (roleAttribute === "Admin") roleId = 1;
  else if (roleAttribute === "Moderator") roleId = 2;

  localStorage.setItem("role", roleId.toString());
  localStorage.setItem("roleId", roleId.toString());
  localStorage.setItem("roleName", roleAttribute);

  if (roleAttribute === "Admin") {
    console.info(
      `Admin login detected for ${data.username || "unknown user"} (${data.email || "no email"}).`
    );
  }
};
