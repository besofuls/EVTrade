import React, { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import UserManagement from "./UserManagement";
import ProductManagement from "./ProductManagement";
import TransactionManagement from "./TransactionManagement";
import ContractManagement from "./ContractManagement";
import ComplaintManagement from "./ComplaintManagement";
import { useToast } from "../contexts/ToastContext";
import apiService from "../services/apiService";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [stats, setStats] = useState({
    memberCount: 0,
    listingCount: 0,
    transactionCount: 0,
    complaintCount: 0,
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState("");
  const [extendPriceInput, setExtendPriceInput] = useState(5000);
  const [configSaving, setConfigSaving] = useState(false);
  const { showToast } = useToast();

  const extractArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  const countFrom = (data) => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    if (typeof data.totalElements === "number") return data.totalElements;
    if (Array.isArray(data.content)) return data.content.length;
    if (typeof data.count === "number") return data.count;
    if (typeof data.total === "number") return data.total;
    return 0;
  };

  const determineMemberCount = (users) => {
    const list = extractArray(users);
    const normalizeRoles = (user) => {
      if (Array.isArray(user?.roles)) {
        return user.roles.map((role) => {
          if (typeof role === "string") return role;
          if (role?.roleName) return role.roleName;
          if (role?.name) return role.name;
          return "";
        });
      }
      if (user?.role) {
        if (typeof user.role === "string") return [user.role];
        if (user.role?.roleName) return [user.role.roleName];
        if (user.role?.name) return [user.role.name];
      }
      return [];
    };

    return list.filter((user) => {
      const roles = normalizeRoles(user).map((role) => String(role).toUpperCase());
      if (roles.length === 0) return true;
      if (roles.some((role) => role.includes("ADMIN") || role.includes("MODERATOR"))) {
        return false;
      }
      if (roles.some((role) => role.includes("MEMBER") || role.includes("USER"))) {
        return true;
      }
      return true;
    }).length;
  };

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const [usersData, listingsData, transactionsData, complaintsData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllListings(),
        apiService.getAllTransactions(),
        apiService.get_all_complaints(),
      ]);

      const memberCount = determineMemberCount(usersData);
      const listingCount = countFrom(listingsData);
      const transactionCount = countFrom(transactionsData);
      const complaintCount = countFrom(complaintsData);

      setStats({
        memberCount,
        listingCount,
        transactionCount,
        complaintCount,
      });
    } catch (error) {
      const message = error?.message || "Không thể tải số liệu tổng quan.";
      setStatsError(message);
      showToast(message, "error");
    } finally {
      setStatsLoading(false);
    }
  }, [showToast]);

  const loadExtendConfig = useCallback(async () => {
    setConfigLoading(true);
    setConfigError("");
    try {
      const config = await apiService.getExtendConfig();
      const price = Number(config.EXTEND_PRICE_PER_DAY) || 5000;
      setExtendPriceInput(price);
    } catch (error) {
      const message = error?.message || "Không thể tải cấu hình hệ thống.";
      setConfigError(message);
      showToast(message, "error");
    } finally {
      setConfigLoading(false);
    }
  }, [showToast]);

  const handleSaveExtendPrice = async () => {
    if (!extendPriceInput || extendPriceInput <= 0) {
      setConfigError("Giá gia hạn phải lớn hơn 0.");
      return;
    }

    setConfigSaving(true);
    setConfigError("");
    try {
      await apiService.updateExtendConfig(extendPriceInput);
      showToast("Cập nhật giá gia hạn thành công.", "success");
      await loadExtendConfig();
    } catch (error) {
      const message = error?.message || "Không thể cập nhật giá gia hạn.";
      setConfigError(message);
      showToast(message, "error");
    } finally {
      setConfigSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      loadStats();
    }
  }, [activeTab, loadStats]);

  useEffect(() => {
    if (activeTab === "settings") {
      loadExtendConfig();
    }
  }, [activeTab, loadExtendConfig]);

  return (
    <div className="admin-dashboard-wrapper">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-dashboard-main">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        {activeTab === "overview" && (
          <div className="admin-dashboard-overview-header">
            {statsLoading && <div className="admin-dashboard-hint">Đang tải số liệu...</div>}
            {!statsLoading && statsError && (
              <div className="admin-dashboard-error">{statsError}</div>
            )}
          </div>
        )}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "posts" && <ProductManagement />}
        {activeTab === "orders" && <TransactionManagement />}
        {activeTab === "complaints" && <ComplaintManagement />}
        {activeTab === "contracts" && <ContractManagement />}
        {/* Nếu muốn giữ trang tổng quan */}
        {activeTab === "overview" && (
          <>
            <div className="admin-dashboard-stats">
              <div
                className="admin-stat-card admin-stat-card--clickable"
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab("users")}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveTab("users");
                  }
                }}
              >
                <div className="admin-stat-icon users"></div>
                <div>
                  <div className="admin-stat-label">Người dùng</div>
                  <div className="admin-stat-value">
                    {statsLoading ? "..." : stats.memberCount.toLocaleString("vi-VN")}
                  </div>
                  <div className="admin-stat-sub">Thành viên đang hoạt động</div>
                </div>
              </div>
              <div
                className="admin-stat-card admin-stat-card--clickable"
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab("posts")}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveTab("posts");
                  }
                }}
              >
                <div className="admin-stat-icon posts"></div>
                <div>
                  <div className="admin-stat-label">Bài đăng</div>
                  <div className="admin-stat-value">
                    {statsLoading ? "..." : stats.listingCount.toLocaleString("vi-VN")}
                  </div>
                  <div className="admin-stat-sub">Tổng số bài đăng</div>
                </div>
              </div>
              <div
                className="admin-stat-card admin-stat-card--clickable"
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab("orders")}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveTab("orders");
                  }
                }}
              >
                <div className="admin-stat-icon orders"></div>
                <div>
                  <div className="admin-stat-label">Giao dịch</div>
                  <div className="admin-stat-value">
                    {statsLoading ? "..." : stats.transactionCount.toLocaleString("vi-VN")}
                  </div>
                  <div className="admin-stat-sub">Bao gồm đơn hàng & gia hạn</div>
                </div>
              </div>
              <div
                className="admin-stat-card admin-stat-card--clickable"
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab("complaints")}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveTab("complaints");
                  }
                }}
              >
                <div className="admin-stat-icon complaints"></div>
                <div>
                  <div className="admin-stat-label">Khiếu nại</div>
                  <div className="admin-stat-value">
                    {statsLoading ? "..." : stats.complaintCount.toLocaleString("vi-VN")}
                  </div>
                  <div className="admin-stat-sub">Đang có trên hệ thống</div>
                </div>
              </div>
            </div>
            <div className="admin-dashboard-section">
              <h2>Hoạt động gần đây</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Loại</th>
                    <th>Nội dung</th>
                    <th>Người thực hiện</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Dữ liệu động sẽ được render ở đây */}
                </tbody>
              </table>
            </div>
          </>
        )}
        {activeTab === "settings" && (
          <div className="admin-dashboard-section">
            <h2>Cấu hình hệ thống</h2>
            {configLoading ? (
              <div className="admin-dashboard-hint">Đang tải cấu hình...</div>
            ) : (
              <div className="admin-config-card">
                <label htmlFor="extend-price-input">Giá gia hạn mỗi ngày (VND)</label>
                <input
                  id="extend-price-input"
                  type="number"
                  min={1000}
                  step={500}
                  value={extendPriceInput}
                  onChange={(e) => {
                    setConfigError("");
                    setExtendPriceInput(Number(e.target.value));
                  }}
                />
                <small className="admin-config-hint">Giá mặc định là 5.000 VND/ngày nếu chưa cấu hình.</small>
                <div className="admin-config-actions">
                  <button
                    className="btn-primary"
                    onClick={handleSaveExtendPrice}
                    disabled={configSaving || !extendPriceInput || extendPriceInput <= 0}
                  >
                    {configSaving ? "Đang lưu..." : "Lưu cấu hình"}
                  </button>
                </div>
                {configError && (
                  <div className="admin-dashboard-error" style={{ marginTop: 8 }}>
                    {configError}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Thêm các tab khác nếu cần */}
      </div>
    </div>
  );
}

export default AdminDashboard;