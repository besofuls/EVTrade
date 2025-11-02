import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import UserManagement from "./UserManagement";
import ProductManagement from "./ProductManagement";
import TransactionManagement from "./TransactionManagement";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="admin-dashboard-wrapper">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-dashboard-main">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        {activeTab === "users" && <UserManagement />}
        {activeTab === "posts" && <ProductManagement />}
        {activeTab === "orders" && <TransactionManagement />}
        {/* Nếu muốn giữ trang tổng quan */}
        {activeTab === "overview" && (
          <>
            <div className="admin-dashboard-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-icon users"></div>
                <div>
                  <div className="admin-stat-label">Người dùng</div>
                  <div className="admin-stat-value"></div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon posts"></div>
                <div>
                  <div className="admin-stat-label">Bài đăng</div>
                  <div className="admin-stat-value"></div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon orders"></div>
                <div>
                  <div className="admin-stat-label">Đơn hàng</div>
                  <div className="admin-stat-value"></div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon complaints"></div>
                <div>
                  <div className="admin-stat-label">Khiếu nại</div>
                  <div className="admin-stat-value"></div>
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
        {/* Thêm các tab khác nếu cần */}
      </div>
    </div>
  );
}

export default AdminDashboard;