import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import apiService from "../services/apiService";
import Header from "../components/Header";
import "./MyOrders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  // State mới để lưu chi tiết bài đăng và trạng thái tải của modal
  const [listingDetails, setListingDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  const filteredOrders = useMemo(() => {
    if (!statusFilter) {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const getStatusClass = (status) => {
    return status ? `status-${status.toLowerCase().replace("_", "-")}` : "";
  };

  // Cập nhật hàm để tải chi tiết bài đăng
  const handleShowDetails = async (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
    setModalLoading(true);
    setListingDetails(null); // Reset chi tiết cũ

    try {
      // Gọi API để lấy chi tiết bài đăng bằng listingId
      const details = await apiService.getProductPostById(order.listingId);
      setListingDetails(details);
    } catch (err) {
      console.error("Không thể tải chi tiết bài đăng:", err);
      // Có thể thêm state để hiển thị lỗi trong modal
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
    setListingDetails(null); // Reset cả chi tiết bài đăng
  };

  return (
    <>
      <Header />
      <div className="my-orders-container">
        <div className="my-orders-content">
          <div className="my-orders-header">
            <h2>Đơn hàng của tôi</h2>
            <div className="filter-container">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </div>
          </div>

          {loading && <p className="loading-text">Đang tải...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && filteredOrders.length === 0 && (
            <p className="no-orders-text">
              {statusFilter
                ? "Không có đơn hàng nào khớp với bộ lọc."
                : "Bạn chưa có đơn hàng nào."}
            </p>
          )}
          {!loading && filteredOrders.length > 0 && (
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Bài đăng</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td data-label="Mã Đơn">#{order.orderId}</td>
                      <td data-label="Bài đăng" className="listing-cell">
                        <button
                          onClick={() => handleShowDetails(order)}
                          className="listing-title-button"
                        >
                          {order.listingTitle || `Listing #${order.listingId}`}
                        </button>
                      </td>
                      <td data-label="Tổng Tiền">
                        {order.totalAmount?.toLocaleString()} VNĐ
                      </td>
                      <td data-label="Trạng Thái">
                        <span
                          className={`status-badge ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cập nhật Modal để hiển thị hình ảnh và chi tiết */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              &times;
            </button>
            <h3>Chi tiết bài đăng</h3>
            {modalLoading ? (
              <p>Đang tải chi tiết...</p>
            ) : listingDetails ? (
              <div className="order-details-form">
                <img 
                  // SỬA "imageUrl" THÀNH "url" Ở ĐÂY
                  src={listingDetails.images && listingDetails.images.length > 0 ? listingDetails.images[0].url : 'https://via.placeholder.com/400x300?text=No+Image'} 
                  alt={listingDetails.title} 
                  className="modal-listing-image"
                />
                <p>
                  <strong>Tiêu đề:</strong> {listingDetails.title}
                </p>
                <p>
                  <strong>Giá:</strong> {listingDetails.price?.toLocaleString()} VNĐ
                </p>
                <p>
                  <strong>Mô tả:</strong> {listingDetails.description}
                </p>
                <hr />
                <p>
                  <strong>Số lượng trong đơn:</strong> {selectedOrder.quantity}
                </p>
                <p>
                  <strong>Ngày tạo đơn:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <Link
                  to={`/product/${selectedOrder.listingId}`}
                  className="go-to-product-btn"
                >
                  Đi đến trang sản phẩm
                </Link>
              </div>
            ) : (
              <p>Không thể tải chi tiết bài đăng.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MyOrders;