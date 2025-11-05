import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";
import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState("");

  useEffect(() => {
    setLoadingUsers(true);
    setUserError("");
    apiService.getAllUsers()
      .then(data => setUsers(data))
      .catch(err => setUserError(err.message))
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleDisableUser = async (userId) => {
    try {
      await apiService.disableUser(userId);
      setUsers(users => users.map(u => u.userID === userId ? { ...u, status: "Disabled" } : u));
    } catch (err) {
      alert("Khóa người dùng thất bại: " + err.message);
    }
  };

  const handleEnableUser = async (userId) => {
    try {
      await apiService.enableUser(userId);
      setUsers(users => users.map(u => u.userID === userId ? { ...u, status: "Active" } : u));
    } catch (err) {
      alert("Mở khóa người dùng thất bại: " + err.message);
    }
  };

  return (
    <div className="admin-dashboard-main">
      <h1 className="admin-dashboard-title">Quản lý người dùng</h1>
      <div className="admin-dashboard-section">
        <h2>Danh sách người dùng</h2>
        {loadingUsers && <div>Đang tải...</div>}
        {userError && <div style={{ color: "red" }}>{userError}</div>}
        {!loadingUsers && !userError && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên tài khoản</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.userID}>
                  <td>{user.userID}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {Array.isArray(user.roles)
                      ? user.roles.join(", ")
                      : typeof user.role === "object" && user.role !== null
                        ? user.role.roleName
                        : user.role || ""}
                  </td>
                  <td>{user.status}</td>
                  <td>
                    {user.status === "Active" ? (
                      <button
                        className="admin-user-btn"
                        style={{ background: "#c62828", color: "#fff", marginRight: 8 }}
                        onClick={() => handleDisableUser(user.userID)}
                      >
                        Khóa
                      </button>
                    ) : (
                      <button
                        className="admin-user-btn"
                        style={{ background: "#2e7d32", color: "#fff" }}
                        onClick={() => handleEnableUser(user.userID)}
                      >
                        Mở khóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;