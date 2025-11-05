import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function StatCard({ title, value, sub }) {
  return (
    <div className="ad-card">
      <div className="ad-card-title">{title}</div>
      <div className="ad-card-value">{value}</div>
      {sub && <div className="ad-card-sub">{sub}</div>}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedListing, setSelectedListing] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [listingViewMode, setListingViewMode] = useState("pending"); // 'pending' or 'all'

  const userStr =
    localStorage.getItem("user") || localStorage.getItem("userData");
  const user = userStr
    ? (() => {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      })()
    : null;
  const displayName = user?.username || "Admin";
  const token = localStorage.getItem("authToken");

  const buildUrl = (path) => {
    const baseUrl = "http://localhost:8081/api";
    return `${baseUrl}${path}`;
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "listings") {
      if (listingViewMode === "all") {
        fetchAllListings();
      } else {
        fetchPendingListings();
      }
    } else if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "admin-info") {
      fetchAdminInfo();
    }
  }, [activeTab, listingViewMode]);

  // Load initial dashboard data
  useEffect(() => {
    if (activeTab === "dashboard") {
      if (users.length === 0) fetchUsers();
      if (pendingListings.length === 0) fetchPendingListings();
      if (orders.length === 0) fetchOrders();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl("/users"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
        console.log("Fetched users:", data);
      } else {
        console.error("Failed to fetch users:", res.status);
        alert("Không thể tải danh sách users. Kiểm tra quyền admin.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Lỗi kết nối khi tải users!");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingListings = async () => {
    setLoading(true);
    try {
      // Try the correct pending listings endpoint
      let res = await fetch(buildUrl("/listings/pending"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Raw pending listings response:", data);

        // Handle paginated response structure
        if (data.content && Array.isArray(data.content)) {
          setPendingListings(data.content);
          console.log("Fetched pending listings from content:", data.content);
        } else if (Array.isArray(data)) {
          setPendingListings(data);
          console.log("Fetched pending listings (direct array):", data);
        } else {
          setPendingListings([]);
          console.log("No pending listings found");
        }
      } else {
        // Fallback: try general listings endpoint and filter
        console.log("Pending endpoint failed, trying fallback...");
        res = await fetch(buildUrl("/listings"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const allData = await res.json();
          let pendingData = [];

          if (allData.content && Array.isArray(allData.content)) {
            pendingData = allData.content.filter(
              (listing) => listing.status === "PENDING"
            );
          } else if (Array.isArray(allData)) {
            pendingData = allData.filter(
              (listing) => listing.status === "PENDING"
            );
          }

          setPendingListings(pendingData);
          console.log(
            "Fetched pending listings (filtered from all):",
            pendingData
          );
        } else {
          setPendingListings([]);
          console.error("Failed to fetch listings:", res.status);
        }
      }
    } catch (err) {
      console.error("Error fetching pending listings:", err);
      setPendingListings([]);
      alert("Lỗi khi tải bài đăng chờ duyệt!");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl("/listings"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Raw all listings response:", data);

        // Handle paginated response structure
        if (data.content && Array.isArray(data.content)) {
          setAllListings(data.content);
          console.log("Fetched all listings from content:", data.content);
        } else if (Array.isArray(data)) {
          setAllListings(data);
          console.log("Fetched all listings (direct array):", data);
        } else {
          setAllListings([]);
          console.log("No listings found");
        }
      } else {
        setAllListings([]);
        console.error("Failed to fetch all listings:", res.status);
        alert("Không thể tải danh sách tất cả bài đăng!");
      }
    } catch (err) {
      console.error("Error fetching all listings:", err);
      setAllListings([]);
      alert("Lỗi khi tải tất cả bài đăng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Try different possible endpoints for orders
      let res = await fetch(buildUrl("/orders"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Try alternative endpoint
        res = await fetch(buildUrl("/admin/orders"), {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
        console.log("Fetched orders:", data);
      } else {
        console.error("Failed to fetch orders:", res.status);
        setOrders([]); // Set empty array if no orders found
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminInfo = async () => {
    setLoading(true);
    try {
      const currentUserId =
        localStorage.getItem("userID") || localStorage.getItem("userId");
      if (currentUserId) {
        const res = await fetch(buildUrl(`/users/${currentUserId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAdminInfo(data);
        }
      }
    } catch (err) {
      console.error("Error fetching admin info:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa user này?")) return;

    try {
      const res = await fetch(buildUrl(`/users/${userId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.userid !== userId));
        setSelectedUser(null);
        alert("Xóa user thành công!");
      } else {
        alert("Không thể xóa user!");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Lỗi khi xóa user!");
    }
  };



  const approveListing = async (listingId) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt bài đăng này?")) return;

    try {
      // Try POST method first (similar to reject)
      let res = await fetch(buildUrl(`/listings/${listingId}/approve`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // If POST fails, try PUT method
      if (!res.ok) {
        res = await fetch(buildUrl(`/listings/${listingId}/approve`), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      // If that also fails, try PATCH method
      if (!res.ok) {
        res = await fetch(buildUrl(`/listings/${listingId}`), {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "APPROVED" }),
        });
      }

      if (res.ok) {
        setPendingListings(pendingListings.filter((l) => l.id !== listingId));
        alert("✅ Đã duyệt bài đăng thành công!");
        // Refresh the list to get updated data
        fetchPendingListings();
      } else {
        const errorText = await res.text().catch(() => "");
        console.error("Failed to approve listing:", res.status, errorText);
        alert(
          `❌ Không thể duyệt bài đăng!\nLỗi: ${res.status} - ${errorText}`
        );
      }
    } catch (err) {
      console.error("Error approving listing:", err);
      if (err.message.includes("CORS")) {
        alert("❌ Lỗi CORS! Vui lòng kiểm tra cấu hình backend.");
      } else {
        alert("❌ Lỗi khi duyệt bài đăng!");
      }
    }
  };

  const rejectListing = async (listingId) => {
    // Prompt for rejection reason
    const reason = prompt(
      "Vui lòng nhập lý do từ chối bài đăng:",
      "Không phù hợp với quy định"
    );
    if (!reason || reason.trim() === "") {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }

    if (
      !confirm(`Bạn có chắc chắn muốn từ chối bài đăng này?\nLý do: ${reason}`)
    )
      return;

    try {
      // Use POST method with reason as required by API
      let res = await fetch(buildUrl(`/listings/${listingId}/reject`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      // If POST fails, try PUT method
      if (!res.ok) {
        res = await fetch(buildUrl(`/listings/${listingId}/reject`), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: reason.trim() }),
        });
      }

      // If that also fails, try PATCH method
      if (!res.ok) {
        res = await fetch(buildUrl(`/listings/${listingId}`), {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "REJECTED",
            rejectionReason: reason.trim(),
          }),
        });
      }

      if (res.ok) {
        setPendingListings(pendingListings.filter((l) => l.id !== listingId));
        alert("✅ Đã từ chối bài đăng thành công!");
        // Refresh the list to get updated data
        fetchPendingListings();
      } else {
        const errorText = await res.text().catch(() => "");
        console.error("Failed to reject listing:", res.status, errorText);
        alert(
          `❌ Không thể từ chối bài đăng!\nLỗi: ${res.status} - ${errorText}`
        );
      }
    } catch (err) {
      console.error("Error rejecting listing:", err);
      if (err.message.includes("CORS")) {
        alert("❌ Lỗi CORS! Vui lòng kiểm tra cấu hình backend.");
      } else {
        alert("❌ Lỗi khi từ chối bài đăng!");
      }
    }
  };

  const renderDashboard = () => (
    <>
      <section className="ad-grid">
        <StatCard
          title="Tổng Users"
          value={users.length || "0"}
          sub="Người dùng đã đăng ký"
        />
        <StatCard
          title="Bài đăng chờ duyệt"
          value={pendingListings.length || "0"}
          sub="Cần xem xét"
        />
        <StatCard
          title="Tổng Orders"
          value={orders.length || "0"}
          sub="Đơn hàng"
        />
        <StatCard title="Admin" value={displayName} sub="Đang hoạt động" />
      </section>

      <section className="ad-panels">
        <div className="ad-panel">
          <div className="ad-panel-title">Thống kê hệ thống</div>
          <div className="ad-placeholder">
            <div style={{ textAlign: "left", padding: "20px" }}>
              <p>
                <strong>📊 Tổng quan:</strong>
              </p>
              <p>• Users: {users.length} người dùng</p>
              <p>
                • Pending Listings: {pendingListings.length} bài đăng chờ duyệt
              </p>
              <p>• Orders: {orders.length} đơn hàng</p>
              <br />
              <p>
                <strong>🔧 Quản lý nhanh:</strong>
              </p>
              <button
                className="ad-btn"
                style={{ margin: "5px" }}
                onClick={() => setActiveTab("users")}
              >
                Quản lý Users
              </button>
              <button
                className="ad-btn"
                style={{ margin: "5px" }}
                onClick={() => setActiveTab("listings")}
              >
                Duyệt bài đăng
              </button>
            </div>
          </div>
        </div>
        <div className="ad-panel">
          <div className="ad-panel-title">Hoạt động gần đây</div>
          <div className="ad-placeholder">
            <div style={{ textAlign: "left", padding: "20px" }}>
              <p>
                <strong>🕒 Hôm nay:</strong>
              </p>
              <p>• Hệ thống đang hoạt động bình thường</p>
              <p>• Admin: {displayName} đang online</p>
              <br />
              <p>
                <strong>⚡ Cần chú ý:</strong>
              </p>
              {pendingListings.length > 0 && (
                <p style={{ color: "#fbbf24" }}>
                  • {pendingListings.length} bài đăng chờ duyệt
                </p>
              )}
              {pendingListings.length === 0 && (
                <p style={{ color: "#10b981" }}>
                  • Không có bài đăng chờ duyệt
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderUsers = () => {
    // Filter users based on search term and role
    const filteredUsers = users.filter((user) => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        filterRole === "all" || user.role?.roleName === filterRole;
      return matchesSearch && matchesRole;
    });

    return (
      <div className="ad-content">
        <div className="ad-content-header">
          <h2>Quản lý Users</h2>
          <button className="ad-btn" onClick={fetchUsers}>
            Refresh
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="ad-filters">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="ad-filter-select"
          >
            <option value="all">All_Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MODERATOR">MODERATOR</option>
            <option value="MEMBER">MEMBER</option>
          </select>
        </div>

        <div className="ad-users-layout">
          <div className="ad-users-list">
            <h3>
              Danh sách Users ({filteredUsers.length}/{users.length})
            </h3>
            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <div className="ad-users-grid">
                {filteredUsers.map((user) => (
                  <div
                    key={user.userid}
                    className={`ad-user-card ${
                      selectedUser?.userid === user.userid ? "selected" : ""
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="ad-user-info">
                      <strong>{user.username}</strong>
                      <p>{user.email}</p>
                      <div className="ad-user-meta">
                        <span
                          className={`ad-status ${user.status?.toLowerCase()}`}
                        >
                          {user.status || "active"}
                        </span>
                        <span className="ad-role">
                          {user.role?.roleName || "User"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && !loading && (
                  <p>Không tìm thấy user nào phù hợp</p>
                )}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="ad-user-details">
              <h3>Chi tiết User</h3>
              <div className="ad-user-detail-card">
                <p>
                  <strong>ID:</strong> {selectedUser.userid}
                </p>
                <p>
                  <strong>Username:</strong> {selectedUser.username}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUser.role?.roleName || "User"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedUser.status || "active"}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}
                </p>

                <div className="ad-user-actions">
                  <button
                    className="ad-btn ad-btn-danger"
                    onClick={() => deleteUser(selectedUser.userid)}
                    disabled={selectedUser.role?.roleName === "ADMIN"}
                  >
                    {selectedUser.role?.roleName === "ADMIN"
                      ? "Không thể xóa Admin"
                      : "Xóa User"}
                  </button>
                  <button
                    className="ad-btn"
                    onClick={() => setSelectedUser(null)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderListings = () => {
    const currentListings =
      listingViewMode === "all" ? allListings : pendingListings;
    const currentCount = currentListings.length;

    return (
      <div className="ad-content">
        <div className="ad-content-header">
          <h2>
            📋{" "}
            {listingViewMode === "all"
              ? "Tất cả bài đăng"
              : "Bài đăng chờ duyệt"}
          </h2>
          <div className="ad-header-stats">
            <span className="ad-stat-badge">📊 {currentCount} bài đăng</span>
            <button
              className="ad-btn"
              onClick={
                listingViewMode === "all"
                  ? fetchAllListings
                  : fetchPendingListings
              }
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="ad-view-toggle">
          <button
            className={`ad-toggle-btn ${
              listingViewMode === "pending" ? "active" : ""
            }`}
            onClick={() => setListingViewMode("pending")}
          >
            ⏳ Chờ duyệt ({pendingListings.length})
          </button>
          <button
            className={`ad-toggle-btn ${
              listingViewMode === "all" ? "active" : ""
            }`}
            onClick={() => setListingViewMode("all")}
          >
            📋 Tất cả ({allListings.length})
          </button>
        </div>

        {loading ? (
          <div className="ad-loading">
            <p>Đang tải bài đăng...</p>
          </div>
        ) : (
          <div className="ad-listings-grid">
            {currentListings.map((listing) => (
              <div key={listing.id} className="ad-listing-card">
                {/* Display primary image if available */}
                {listing.primaryImageUrl && (
                  <div className="ad-listing-image">
                    <img
                      src={listing.primaryImageUrl}
                      alt={listing.title}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "12px",
                      }}
                    />
                  </div>
                )}

                <div className="ad-listing-info">
                  <h4>{listing.title || `Listing #${listing.id}`}</h4>
                  <p>
                    <strong>💰 Giá:</strong>{" "}
                    {listing.price?.toLocaleString("vi-VN") || "Chưa có giá"}{" "}
                    {listing.price ? "VND" : ""}
                  </p>
                  <p>
                    <strong>👤 Người đăng:</strong>{" "}
                    {listing.seller?.username ||
                      listing.user?.username ||
                      "Không rõ"}
                  </p>
                  <p>
                    <strong>📅 Ngày đăng:</strong>{" "}
                    {listing.createdAt
                      ? new Date(listing.createdAt).toLocaleDateString("vi-VN")
                      : "Không rõ"}
                  </p>
                  {listing.startDate && (
                    <p>
                      <strong>🚀 Ngày bắt đầu:</strong>{" "}
                      {new Date(listing.startDate).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                  {listing.expiryDate && (
                    <p>
                      <strong>⏰ Ngày hết hạn:</strong>{" "}
                      {new Date(listing.expiryDate).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                  {listing.description && (
                    <p>
                      <strong>📝 Mô tả:</strong>{" "}
                      {listing.description.substring(0, 100)}
                      {listing.description.length > 100 ? "..." : ""}
                    </p>
                  )}
                  <div className="ad-listing-meta">
                    <span className="ad-status pending">
                      {listing.status || "PENDING"}
                    </span>
                    {listing.categoryName && (
                      <span className="ad-role">{listing.categoryName}</span>
                    )}
                    {listing.brandName && (
                      <span
                        className="ad-role"
                        style={{
                          background: "rgba(16, 185, 129, 0.3)",
                          color: "#10b981",
                        }}
                      >
                        {listing.brandName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ad-listing-actions">
                  <button
                    className="ad-btn"
                    onClick={() => setSelectedListing(listing)}
                    style={{ background: "#6366f1", marginRight: "8px" }}
                  >
                    👁️ Chi tiết
                  </button>

                  {/* Show approve/reject buttons only for PENDING listings */}
                  {listing.status === "PENDING" && (
                    <>
                      <button
                        className="ad-btn ad-btn-success"
                        onClick={() => approveListing(listing.id)}
                      >
                        ✅ Duyệt
                      </button>
                      <button
                        className="ad-btn ad-btn-danger"
                        onClick={() => rejectListing(listing.id)}
                      >
                        ❌ Từ chối
                      </button>
                    </>
                  )}


                </div>
              </div>
            ))}
            {currentListings.length === 0 && (
              <div className="ad-empty-state">
                {listingViewMode === "all" ? (
                  <>
                    <p>📭 Chưa có bài đăng nào trong hệ thống</p>
                    <p style={{ fontSize: "14px", marginTop: "8px" }}>
                      Hệ thống chưa có bài đăng nào
                    </p>
                  </>
                ) : (
                  <>
                    <p>🎉 Không có bài đăng nào chờ duyệt</p>
                    <p style={{ fontSize: "14px", marginTop: "8px" }}>
                      Tất cả bài đăng đã được xử lý
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderOrders = () => (
    <div className="ad-content">
      <div className="ad-content-header">
        <h2>Quản lý Orders</h2>
        <button className="ad-btn" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="ad-orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="ad-order-card">
              <div className="ad-order-info">
                <h4>Order #{order.id}</h4>
                <p>
                  <strong>Khách hàng:</strong> {order.user?.username}
                </p>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  {order.totalAmount?.toLocaleString("vi-VN")} VND
                </p>
                <p>
                  <strong>Trạng thái:</strong> {order.status}
                </p>
                <p>
                  <strong>Ngày đặt:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p>Không có order nào</p>}
        </div>
      )}
    </div>
  );

  const renderAdminInfo = () => (
    <div className="ad-content">
      <div className="ad-content-header">
        <h2>Thông tin Admin</h2>
        <button className="ad-btn" onClick={fetchAdminInfo}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : adminInfo ? (
        <div className="ad-admin-info">
          <div className="ad-admin-card">
            <h3>Thông tin cá nhân</h3>
            <p>
              <strong>ID:</strong> {adminInfo.userid}
            </p>
            <p>
              <strong>Username:</strong> {adminInfo.username}
            </p>
            <p>
              <strong>Email:</strong> {adminInfo.email}
            </p>
            <p>
              <strong>Role:</strong> {adminInfo.role?.roleName}
            </p>
            <p>
              <strong>Status:</strong> {adminInfo.status}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(adminInfo.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      ) : (
        <p>Không thể tải thông tin admin</p>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="ad-content">
      <div className="ad-content-header">
        <h2>Reports</h2>
      </div>
      <div className="ad-placeholder">
        <p>Chức năng Reports - Giữ nguyên như yêu cầu</p>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <aside className="ad-sidebar">
        <div className="ad-brand">Admin Panel</div>
        <nav className="ad-nav">
          <a
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </a>
          <a
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Users
          </a>
          <a
            className={activeTab === "listings" ? "active" : ""}
            onClick={() => setActiveTab("listings")}
          >
            Bài đăng chờ duyệt
          </a>
          <a
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </a>
          <a
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </a>
          <a
            className={activeTab === "admin-info" ? "active" : ""}
            onClick={() => setActiveTab("admin-info")}
          >
            Thông tin Admin
          </a>
          <a
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("userData");
              localStorage.removeItem("authToken");
              localStorage.removeItem("userID");
              localStorage.removeItem("isLoggedIn");
              window.location.href = "/login";
            }}
          >
            Logout
          </a>
        </nav>
      </aside>

      <main className="ad-main">
        <header className="ad-header">
          <div className="ad-title">Welcome back, {displayName}</div>
          <div className="ad-actions">
            <button className="ad-btn" onClick={() => navigate("/home")}>
              Trang chủ
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "listings" && renderListings()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "reports" && renderReports()}
        {activeTab === "admin-info" && renderAdminInfo()}
      </main>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div
          className="ad-modal-overlay"
          onClick={() => setSelectedListing(null)}
        >
          <div
            className="ad-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-modal-header">
              <h3>Chi tiết bài đăng</h3>
              <button
                className="ad-modal-close"
                onClick={() => setSelectedListing(null)}
              >
                ✕
              </button>
            </div>

            <div className="ad-modal-body">
              {selectedListing.primaryImageUrl && (
                <img
                  src={selectedListing.primaryImageUrl}
                  alt={selectedListing.title}
                  className="ad-modal-image"
                />
              )}

              <div className="ad-modal-info">
                <h4>{selectedListing.title}</h4>
                <p>
                  <strong>💰 Giá:</strong>{" "}
                  {selectedListing.price?.toLocaleString("vi-VN")} VND
                </p>
                <p>
                  <strong>👤 Người đăng:</strong>{" "}
                  {selectedListing.seller?.username}
                </p>
                <p>
                  <strong>📧 Email:</strong> {selectedListing.seller?.email}
                </p>
                <p>
                  <strong>🏷️ Danh mục:</strong> {selectedListing.categoryName}
                </p>
                <p>
                  <strong>🏢 Thương hiệu:</strong> {selectedListing.brandName}
                </p>
                <p>
                  <strong>📅 Ngày đăng:</strong>{" "}
                  {new Date(selectedListing.createdAt).toLocaleString("vi-VN")}
                </p>
                <p>
                  <strong>🚀 Ngày bắt đầu:</strong>{" "}
                  {new Date(selectedListing.startDate).toLocaleString("vi-VN")}
                </p>
                <p>
                  <strong>⏰ Ngày hết hạn:</strong>{" "}
                  {new Date(selectedListing.expiryDate).toLocaleString("vi-VN")}
                </p>

                {selectedListing.description && (
                  <div>
                    <strong>📝 Mô tả:</strong>
                    <p className="ad-modal-description">
                      {selectedListing.description}
                    </p>
                  </div>
                )}

                {selectedListing.images &&
                  selectedListing.images.length > 0 && (
                    <div>
                      <strong>
                        🖼️ Hình ảnh ({selectedListing.images.length}):
                      </strong>
                      <div className="ad-modal-images">
                        {selectedListing.images.map((image, index) => (
                          <img
                            key={`image-${image.id || index}`}
                            src={image.url}
                            alt={`Image ${index + 1}`}
                            className="ad-modal-thumbnail"
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="ad-modal-actions">
              {/* Show approve/reject buttons only for PENDING listings */}
              {selectedListing.status === "PENDING" && (
                <>
                  <button
                    className="ad-btn ad-btn-success"
                    onClick={() => {
                      approveListing(selectedListing.id);
                      setSelectedListing(null);
                    }}
                  >
                    ✅ Duyệt bài đăng
                  </button>
                  <button
                    className="ad-btn ad-btn-danger"
                    onClick={() => {
                      rejectListing(selectedListing.id);
                      setSelectedListing(null);
                    }}
                  >
                    ❌ Từ chối bài đăng
                  </button>
                </>
              )}

              {/* Always show delete button */}
              <button
                className="ad-btn"
                onClick={() => {
                  deleteListing(selectedListing.id);
                  setSelectedListing(null);
                }}
                style={{ background: "#dc2626", color: "white" }}
              >
                🗑️ Xóa bài đăng
              </button>

              <button
                className="ad-btn"
                onClick={() => setSelectedListing(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
