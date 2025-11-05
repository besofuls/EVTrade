import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";
import Header from "../components/Header"; // 1. Import Header
import "./MyOrders.css"; // 2. Import file CSS

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError("");
      try {
        const data = await apiService.getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    return status ? `status-${status.toLowerCase().replace('_', '-')}` : '';
  };

  return (
    <>
      <Header /> {/* 3. Thêm Header vào đầu trang */}
      <div className="my-orders-container">
        <div className="my-orders-content">
          <h2>Đơn hàng của tôi</h2>
          {loading && <p className="loading-text">Đang tải...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && orders.length === 0 && (
            <p className="no-orders-text">Bạn chưa có đơn hàng nào.</p>
          )}
          {!loading && orders.length > 0 && (
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Sản Phẩm</th>
                    <th>Số Lượng</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td data-label="Mã Đơn">#{order.orderId}</td>
                      <td data-label="Sản Phẩm">{order.listingTitle || `Listing #${order.listingId}`}</td>
                      <td data-label="Số Lượng">{order.quantity}</td>
                      <td data-label="Tổng Tiền">{order.totalAmount?.toLocaleString()} VNĐ</td>
                      <td data-label="Trạng Thái">
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td data-label="Ngày Tạo">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyOrders;