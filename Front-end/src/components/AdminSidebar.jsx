import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    // Kiểm tra user ở sidebar
    const storedUser = localStorage.getItem("user");
    let user = null;
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        user = null;
      }
    }
    const roles = user?.roles || [];
    if (!user || !(roles.includes("ADMIN") || roles.includes("MODERATOR"))) {
      setAuthorized(false);
      navigate("/");
    } else {
      setAuthorized(true);
    }
  }, [navigate]);

  if (authorized === false) return null;

  return (
    <div className="admin-dashboard-sidebar">
      <div className="admin-logo">EV Admin</div>
      <ul className="admin-menu">
        <li className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Tổng quan</li>
        <li className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Người dùng</li>
        <li className={activeTab === "posts" ? "active" : ""} onClick={() => setActiveTab("posts")}>Bài đăng</li>
        <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>Giao dịch</li>
        <li className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>Thống kê</li>
        <li onClick={() => { localStorage.clear(); navigate("/"); }}>Đăng xuất</li>
      </ul>
      <button
        className="admin-home-btn"
        onClick={() => navigate("/")}
        style={{
          marginTop: "32px",
          background: "#fff",
          color: "#FFD700",
          border: "2px solid #FFD700",
          borderRadius: "7px",
          padding: "10px 22px",
          fontSize: "15px",
          fontWeight: "700",
          cursor: "pointer",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        Về trang chủ
      </button>
    </div>
  );
}

export default AdminSidebar;