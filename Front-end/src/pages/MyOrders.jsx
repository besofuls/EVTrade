import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import apiService from "../services/apiService";
import Header from "../components/Header";
import { useToast } from "../contexts/ToastContext";
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

  // State cho phần đánh giá
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const { showToast } = useToast();

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
    setHasReviewed(false);

    try {
      // Gọi API để lấy chi tiết bài đăng và danh sách đánh giá
      const [details, reviews] = await Promise.all([
        apiService.getProductPostById(order.listingId),
        apiService.get_reviews_for_listing(order.listingId).catch(() => [])
      ]);
      setListingDetails(details);

      // Kiểm tra xem bài đăng đã có đánh giá nào chưa (1 bài đăng chỉ có 1 review)
      if (Array.isArray(reviews) && reviews.length > 0) {
        setHasReviewed(true);
      } else {
        setHasReviewed(false);
      }
    } catch (err) {
      console.error("Không thể tải chi tiết bài đăng:", err);
      // Có thể thêm state để hiển thị lỗi trong modal
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenReviewModal = () => {
    setShowReviewModal(true);
    setReviewRating(5);
    setReviewComment("");
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmittingReview(true);
    try {
      await apiService.create_new_review({
        listingId: selectedOrder.listingId,
        rating: reviewRating,
        comment: reviewComment
      });
      showToast("Đánh giá thành công!", "success");
      setHasReviewed(true);
      setShowReviewModal(false);
    } catch (err) {
      showToast(err.message || "Đánh giá thất bại", "error");
    } finally {
      setSubmittingReview(false);
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

                {selectedOrder.status === "COMPLETED" && (
                  <div style={{ marginTop: "1rem" }}>
                    {hasReviewed ? (
                      <button className="review-btn disabled" disabled>
                        Đã đánh giá
                      </button>
                    ) : (
                      <button className="review-btn" onClick={handleOpenReviewModal}>
                        Đánh giá sản phẩm
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p>Không thể tải chi tiết bài đăng.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal Đánh giá */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={handleCloseReviewModal}>
          <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseReviewModal}>
              &times;
            </button>
            <h3>Đánh giá sản phẩm</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Đánh giá:</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="form-control"
                >
                  <option value="5">5 ⭐ - Tuyệt vời</option>
                  <option value="4">4 ⭐ - Tốt</option>
                  <option value="3">3 ⭐ - Bình thường</option>
                  <option value="2">2 ⭐ - Tệ</option>
                  <option value="1">1 ⭐ - Rất tệ</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nhận xét:</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-control"
                  rows="4"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  required
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn" disabled={submittingReview}>
                  {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCloseReviewModal}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MyOrders;