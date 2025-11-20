import React, { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import UserManagement from "./UserManagement";
import ProductManagement from "./ProductManagement";
import TransactionManagement from "./TransactionManagement";
import ContractManagement from "./ContractManagement";
import ComplaintManagement from "./ComplaintManagement";
import SystemConfigPage from "./SystemConfigPage";
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
  const [financialStats, setFinancialStats] = useState({
    totalOrderRevenue: 0,
    totalExtendRevenue: 0,
    categoryStats: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");


  const { showToast } = useToast();

  const chartColors = ["#2563eb", "#f97316", "#22c55e", "#a855f7", "#eab308", "#ec4899", "#14b8a6"];

  const combinedRevenue = Number(financialStats.totalOrderRevenue || 0) + Number(financialStats.totalExtendRevenue || 0);

  const totalCategoryCount = financialStats.categoryStats.reduce(
    (sum, item) => sum + Number(item?.listingCount || 0),
    0
  );

  const pieGradient = (() => {
    if (!financialStats.categoryStats.length || totalCategoryCount <= 0) {
      return "conic-gradient(#e2e8f0 0deg 360deg)";
    }
    let cumulative = 0;
    const segments = financialStats.categoryStats.map((item, index) => {
      const value = Number(item.listingCount || 0);
      const startAngle = (cumulative / totalCategoryCount) * 360;
      cumulative += value;
      const endAngle = (cumulative / totalCategoryCount) * 360;
      return `${chartColors[index % chartColors.length]} ${startAngle}deg ${endAngle}deg`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  })();

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

  const formatCurrency = (amount) => {
    const numeric = Number(amount);
    const value = Number.isFinite(numeric) ? numeric : 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
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

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const overview = await apiService.getAdminOverviewStats();
      setFinancialStats({
        totalOrderRevenue: Number(overview?.totalOrderRevenue ?? 0),
        totalExtendRevenue: Number(overview?.totalExtendRevenue ?? 0),
        categoryStats: Array.isArray(overview?.categoryStats)
          ? overview.categoryStats.map((item) => ({
              categoryName: item?.categoryName ?? "",
              listingCount: Number(item?.listingCount ?? 0),
            }))
          : [],
      });
    } catch (error) {
      const message = error?.message || "Không thể tải dữ liệu thống kê.";
      setAnalyticsError(message);
      setFinancialStats({
        totalOrderRevenue: 0,
        totalExtendRevenue: 0,
        categoryStats: [],
      });
      showToast(message, "error");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === "overview") {
      loadStats();
    }
  }, [activeTab, loadStats]);

  useEffect(() => {
    if (activeTab === "analytics") {
      loadAnalytics();
    }
  }, [activeTab, loadAnalytics]);

  useEffect(() => {
    // Kiểm tra role khi vào dashboard
    const storedUser = localStorage.getItem("user");
    let user = null;
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        user = null;
      }
    }
    const roles = user?.roles?.map(r => r.toUpperCase()) || [];
    if (roles.includes("MODERATOR") && !roles.includes("ADMIN")) {
      setActiveTab("users");
    } else {
      setActiveTab("overview");
    }
  }, []);

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
        {activeTab === "settings" && <SystemConfigPage />}
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
        {activeTab === "analytics" && (
          <>
            <div className="admin-dashboard-overview-header">
              {analyticsLoading && <div className="admin-dashboard-hint">Đang tải thống kê...</div>}
              {!analyticsLoading && analyticsError && (
                <div className="admin-dashboard-error">{analyticsError}</div>
              )}
            </div>
            <div className="admin-dashboard-section">
              <h2>Tổng quan doanh thu</h2>
              {analyticsLoading ? (
                <div className="admin-dashboard-hint">Đang tổng hợp dữ liệu...</div>
              ) : (
                <div className="admin-analytics-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon orders"></div>
                    <div>
                      <div className="admin-stat-label">Doanh thu giao dịch</div>
                      <div className="admin-stat-value">{formatCurrency(financialStats.totalOrderRevenue)}</div>
                      <div className="admin-stat-sub">Tổng giá trị các đơn hàng hoàn tất</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon extend"></div>
                    <div>
                      <div className="admin-stat-label">Doanh thu gia hạn</div>
                      <div className="admin-stat-value">{formatCurrency(financialStats.totalExtendRevenue)}</div>
                      <div className="admin-stat-sub">Phí thu được từ gia hạn bài đăng</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon revenue"></div>
                    <div>
                      <div className="admin-stat-label">Tổng doanh thu</div>
                      <div className="admin-stat-value">{formatCurrency(combinedRevenue)}</div>
                      <div className="admin-stat-sub">Gồm giao dịch + gia hạn</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="admin-dashboard-section">
              <h2>Phân bố bài đăng theo danh mục</h2>
              {analyticsLoading ? (
                <div className="admin-dashboard-hint">Đang vẽ biểu đồ...</div>
              ) : financialStats.categoryStats.length > 0 ? (
                <div className="admin-analytics-chart">
                  <div className="admin-pie-chart" style={{ background: pieGradient }}>
                    {totalCategoryCount > 0 && (
                      <div className="admin-pie-center">
                        <div className="admin-pie-total">{totalCategoryCount.toLocaleString("vi-VN")}</div>
                        <div className="admin-pie-label">Bài đăng</div>
                      </div>
                    )}
                  </div>
                  <ul className="admin-pie-legend">
                    {financialStats.categoryStats.map((item, index) => {
                      const value = Number(item.listingCount || 0);
                      const percent = totalCategoryCount > 0 ? Math.round((value / totalCategoryCount) * 1000) / 10 : 0;
                      return (
                        <li key={item.categoryName || index}>
                          <span
                            className="legend-color"
                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                          ></span>
                          <span className="legend-name">{item.categoryName || "Không rõ"}</span>
                          <span className="legend-value">
                            {value.toLocaleString("vi-VN")} ({percent}% )
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="admin-dashboard-hint">Chưa có dữ liệu bài đăng để thống kê.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;