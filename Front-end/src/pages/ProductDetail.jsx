import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import defaultImage from "../assets/VinFast_VF5_Plus.jpg";
import Header from "../components/Header";
import apiService from "../services/apiService";
import { useToast } from "../contexts/ToastContext"; // Thêm import useToast
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [mainImage, setMainImage] = useState(defaultImage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Action states
  const [orderLoading, setOrderLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [isOrderConfirmOpen, setIsOrderConfirmOpen] = useState(false);

  // Comment & rating states
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentLoading, setCommentLoading] = useState(false);
  const [sellerFeedback, setSellerFeedback] = useState(null);
  const [sellerRatingLoading, setSellerRatingLoading] = useState(false);

  // State mới cho gallery ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // State mới cho zoom ảnh
  const [isZoomed, setIsZoomed] = useState(false);

  const { showToast } = useToast(); // Khởi tạo hook toast

  // State cho modal khiếu nại
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintReason, setComplaintReason] = useState("");

  const fetchDetail = async () => {
    try {
      const payload = await apiService.getProductPostById(id);
      const images = Array.isArray(payload.images) ? payload.images : [];
      
      // Sắp xếp lại ảnh, đưa ảnh primary lên đầu
      const sortedImages = [...images].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return 0;
      });

      const primaryUrl = sortedImages.find(img => img.isPrimary)?.url || sortedImages[0]?.url;
      const display = primaryUrl || defaultImage;
      
      setItem({ ...payload, images: sortedImages, display });
      setMainImage(display);
      
      const primaryIndex = sortedImages.findIndex(img => img.url === display);
      setCurrentImageIndex(primaryIndex >= 0 ? primaryIndex : 0);

    } catch (err) {
      setError(err.message || "Lỗi khi tải chi tiết sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // Đổi tên hàm cho đúng với apiService
      const data = await apiService.get_reviews_for_listing(id);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await apiService.isFollowingListing(id);
      setIsFollowing(!!res?.following);
    } catch {
      setIsFollowing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Chuyển sang gọi tuần tự để đảm bảo dữ liệu được tải đúng thứ tự
      await fetchDetail();
      await fetchComments();
      await fetchFollowing();
      setLoading(false); // Chỉ tắt loading sau khi tất cả đã hoàn thành
    };
    loadData();
  }, [id]);

  const sellerProfileId = useMemo(() => {
    const seller = item?.seller;
    if (!seller) return null;
    return seller.id ?? seller.userId ?? seller.userID ?? seller.user?.id ?? null;
  }, [item]);

  useEffect(() => {
    let cancelled = false;
    if (!sellerProfileId) {
      setSellerFeedback(null);
      return () => {
        cancelled = true;
      };
    }

    const loadSellerFeedback = async () => {
      setSellerRatingLoading(true);
      try {
        const data = await apiService.getSellerFeedback(sellerProfileId);
        if (!cancelled) {
          setSellerFeedback(data || null);
        }
      } catch {
        if (!cancelled) {
          setSellerFeedback(null);
        }
      } finally {
        if (!cancelled) {
          setSellerRatingLoading(false);
        }
      }
    };

    loadSellerFeedback();

    return () => {
      cancelled = true;
    };
  }, [sellerProfileId]);

  const fmtPrice = (v) => v == null ? "—" : new Intl.NumberFormat("vi-VN").format(Number(v)) + " đ";
  const fmtDate = (s) => s ? new Date(s).toLocaleDateString("vi-VN") : "—";

  const ratingStats = useMemo(() => {
    const ratedComments = comments.filter((c) => Number.isFinite(Number(c?.rating)));
    const count = ratedComments.length;
    const sum = ratedComments.reduce((acc, c) => acc + Number(c.rating || 0), 0);
    const fallbackAvg = Number(item?.averageRating || 0);

    if (count > 0) {
      const average = sum / count;
      return {
        average,
        count,
        hasReviews: true,
        label: `${average.toFixed(1)} ⭐ (${count} đánh giá)`
      };
    }

    if (fallbackAvg > 0) {
      return {
        average: fallbackAvg,
        count: 0,
        hasReviews: true,
        label: `${fallbackAvg.toFixed(1)} ⭐`
      };
    }

    if (sellerRatingLoading) {
      return {
        average: 0,
        count: 0,
        hasReviews: false,
        label: "Đang tải đánh giá..."
      };
    }

    const sellerCount = Number(sellerFeedback?.totalReviews || 0);
    const sellerAvg = Number(sellerFeedback?.averageRating || 0);
    if (sellerCount > 0 && sellerAvg > 0) {
      return {
        average: sellerAvg,
        count: sellerCount,
        hasReviews: true,
        label: `Người bán: ${sellerAvg.toFixed(1)} ⭐ (${sellerCount} đánh giá)`
      };
    }

    return {
      average: 0,
      count: 0,
      hasReviews: false,
      label: "Chưa có đánh giá"
    };
  }, [comments, item?.averageRating, sellerFeedback, sellerRatingLoading]);

  // Hàm xử lý chuyển ảnh
  const handleImageNavigation = (direction) => {
    if (!item?.images?.length) return;
    const newIndex = (currentImageIndex + direction + item.images.length) % item.images.length;
    setCurrentImageIndex(newIndex);
    setMainImage(item.images[newIndex].url);
  };

  // Hàm xử lý khi click vào thumbnail
  const handleThumbClick = (imgUrl, index) => {
    setMainImage(imgUrl);
    setCurrentImageIndex(index);
  };

  const handleOrderClick = () => {
    if (!apiService.getAuthToken()) {
      showToast("Vui lòng đăng nhập để đặt hàng.", "warning");
      navigate("/login");
      return;
    }
    setIsOrderConfirmOpen(true);
  };

  const handleOrder = async () => {
    if (!apiService.getAuthToken()) {
      setIsOrderConfirmOpen(false);
      showToast("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.", "error");
      navigate("/login");
      return;
    }
    setOrderLoading(true);
    setIsOrderConfirmOpen(false);
    try {
      await apiService.createOrder({ listingId: Number(id), quantity: 1 });
      showToast("Đặt đơn hàng thành công!", "success");
      fetchDetail();
    } catch (err) {
      showToast(err.message || "Đặt đơn hàng thất bại.", "error");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentLoading(true);
    try {
      if (!apiService.isAuthenticated()) {
        showToast("Vui lòng đăng nhập để gửi đánh giá.", "warning");
        navigate("/login");
        return;
      }

      // Gửi đánh giá cho bài đăng hiện tại
      await apiService.create_new_review({
        listingId: Number(id),
        comment: commentText,
        rating: commentRating,
      });
      showToast("Đã gửi bình luận!", "success");
      setCommentText("");
      setCommentRating(5);
      await fetchComments();
    } catch (err) {
      showToast(err.message || "Gửi bình luận thất bại.", "error");
    } finally {
      setCommentLoading(false);
    }
  };

  const seller = item?.seller ?? {};
  const sellerId = sellerProfileId;

  const handleSellerProfile = () => {
    if (sellerId) {
      navigate(`/seller/${sellerId}`);
    }
  };

  const scrollToComments = () => {
    const el = document.getElementById("pd-comments");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFollow = async () => {
    if (!apiService.isAuthenticated()) {
      showToast("Vui lòng đăng nhập để theo dõi.", "warning");
      navigate("/login");
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await apiService.unfollowListing(id);
        showToast("Đã bỏ theo dõi bài đăng.", "info");
        setIsFollowing(false); // Cập nhật state sau khi thành công
      } else {
        await apiService.followListing(id);
        showToast("Đã theo dõi bài đăng!", "success");
        setIsFollowing(true); // Cập nhật state sau khi thành công
      }
    } catch (err) {
      // Hiển thị lỗi từ backend nếu có, nếu không thì hiển thị lỗi mặc định
      const errorMessage = await err.text().catch(() => err.message || "Thao tác thất bại.");
      showToast(errorMessage, "error");
      
      // Đồng bộ lại trạng thái với server khi có lỗi
      fetchFollowing(); 
    } finally {
      setFollowLoading(false);
    }
  };

  // Mở modal khiếu nại
  const openComplaintModal = () => {
    if (!apiService.isAuthenticated()) {
      showToast("Vui lòng đăng nhập để khiếu nại.", "warning");
      navigate("/login");
      return;
    }
    setIsComplaintModalOpen(true);
  };

  // Gửi khiếu nại từ modal
  const handleComplaintSubmit = async () => {
    if (!complaintReason.trim()) {
      showToast("Lý do khiếu nại không được để trống.", "error");
      return;
    }
    setComplaintLoading(true);
    try {
      await apiService.createComplaint({ listingId: id, content: complaintReason });
      showToast("Đã gửi khiếu nại thành công.", "success");
      setIsComplaintModalOpen(false); // Đóng modal sau khi gửi
      setComplaintReason(""); // Reset nội dung
    } catch (err) {
      showToast(err.message || "Gửi khiếu nại thất bại.", "error");
    } finally {
      setComplaintLoading(false);
    }
  };

  if (loading) return <div className="pd-loading">Đang tải...</div>;
  if (error) return <div className="pd-error">{error}</div>;
  if (!item) return <div className="pd-empty">Không tìm thấy sản phẩm.</div>;

  const product = item.product ?? {};
  const hideOrderBtn = ["PROCESSING", "SOLD"].includes(String(item.status).toUpperCase());
  const imageList = item.images?.length ? item.images : [{ url: item.display, isPrimary: true }];

  return (
    <>
      <Header />
      <div className="pd-wrapper">
        <div className="pd-toolbar">
          <button className="pd-back" onClick={() => navigate(-1)}>← Quay lại</button>
        </div>

        <div className="pd-main-card">
          {/* Cột trái: Hình ảnh */}
          <div className="pd-gallery">
            <div className="pd-gallery-main">
              <img
                className="pd-main-image"
                src={mainImage}
                alt={item.title}
                onClick={() => setIsZoomed(true)}
              />
              {imageList.length > 1 && (
                <>
                  <button className="pd-gallery-nav prev" onClick={() => handleImageNavigation(-1)}>‹</button>
                  <button className="pd-gallery-nav next" onClick={() => handleImageNavigation(1)}>›</button>
                </>
              )}
            </div>
            <div className="pd-thumbs">
              {imageList.map((img, idx) => (
                <img
                  key={img.id || idx}
                  src={img?.url || defaultImage}
                  alt={`thumb-${idx}`}
                  className={`pd-thumb ${img?.url === mainImage ? "active" : ""}`}
                  onClick={() => handleThumbClick(img?.url || defaultImage, idx)}
                />
              ))}
            </div>
          </div>

          {/* Cột phải: Thông tin và hành động */}
          <div className="pd-info-actions">
            <div className="pd-header">
              <h1 className="pd-title">{item.title || "—"}</h1>
              <div className="pd-badges">
                <span className="pd-badge category">{item.categoryName || "—"}</span>
                <span className="pd-badge brand">{item.brandName || "—"}</span>
                <span className={`pd-badge status ${String(item.status || "").toLowerCase()}`}>
                  {item.status || "—"}
                </span>
              </div>
            </div>

            <div className="pd-price">{fmtPrice(item.price)}</div>

            <div className="pd-seller-card">
              <button
                type="button"
                className="pd-seller-avatar"
                onClick={handleSellerProfile}
                disabled={!sellerId}
              >
                👤
              </button>
              <div className="pd-seller-info">
                <button
                  type="button"
                  className="pd-seller-name"
                  onClick={handleSellerProfile}
                  disabled={!sellerId}
                >
                  {seller.username || "—"}
                </button>
                <div className="pd-seller-meta">Đăng ngày: {fmtDate(item.createdAt)}</div>
                <button
                  type="button"
                  className={`pd-seller-rating ${ratingStats.hasReviews ? "" : "pd-seller-rating-empty"}`.trim()}
                  onClick={scrollToComments}
                  disabled={!ratingStats.hasReviews}
                >
                  {ratingStats.label}
                </button>
              </div>
              {sellerId && (
                <button type="button" className="pd-btn tertiary" onClick={handleSellerProfile}>
                  Xem hồ sơ
                </button>
              )}
            </div>

            <div className="pd-actions">
              {!hideOrderBtn && (
                <button className="pd-btn primary" onClick={handleOrderClick} disabled={orderLoading}>
                  {orderLoading ? "Đang xử lý..." : "🛒 Đặt mua ngay"}
                </button>
              )}
              <div className="pd-actions-secondary">
                <button
                  className={`pd-btn follow ${isFollowing ? "active" : ""}`}
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {isFollowing ? "❤️ Đã theo dõi" : "🤍 Theo dõi"}
                </button>
                <button className="pd-btn complaint" onClick={openComplaintModal} disabled={complaintLoading}>
                  🚩 Khiếu nại
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Phần chi tiết và bình luận */}
        <div className="pd-details-section">
          <div className="pd-details-card">
            <h3>Mô tả sản phẩm</h3>
            <p>{item.description || "Không có mô tả."}</p>
          </div>

          <div className="pd-details-card">
            <h3>Thông số kỹ thuật</h3>
            <ul className="pd-specs-list">
              {product.model && <li><strong>Model:</strong> {product.model}</li>}
              {product.year && <li><strong>Năm sản xuất:</strong> {product.year}</li>}
              {product.color && <li><strong>Màu sắc:</strong> {product.color}</li>}
              {product.condition && <li><strong>Tình trạng:</strong> {product.condition}</li>}
            </ul>
          </div>

            <div className="pd-details-card" id="pd-comments">
            <div className="pd-comments-header">
              <h3>Bình luận & Đánh giá</h3>
              <span className={`pd-comments-summary ${ratingStats.hasReviews ? "" : "pd-comments-summary-empty"}`.trim()}>
                {ratingStats.label}
              </span>
            </div>
            <form className="pd-comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                rows={3}
                required
              />
              <div className="pd-comment-actions">
                <div className="pd-rating-select">
                  <label>Đánh giá:</label>
                  <select value={commentRating} onChange={(e) => setCommentRating(Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ⭐</option>)}
                  </select>
                </div>
                <button type="submit" className="pd-btn primary" disabled={commentLoading}>
                  {commentLoading ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </form>

            <div className="pd-comments-list">
              {comments.length === 0 ? (
                <div className="pd-comments-empty">Chưa có bình luận nào.</div>
              ) : (
                comments.map((cmt) => (
                  <div className="pd-comment-item" key={cmt.id}>
                    <div className="pd-comment-meta">
                      <strong className="pd-comment-username">{cmt.username || "Ẩn danh"}</strong>
                      <span className="pd-comment-rating">{cmt.rating} ⭐</span>
                    </div>
                    <p className="pd-comment-text">{cmt.text}</p>
                    <span className="pd-comment-date">{fmtDate(cmt.createdAt)}</span>
                  </div>
                )))
              }
            </div>
          </div>
        </div>

        {/* Modal xác nhận đặt hàng */}
        {isOrderConfirmOpen && (
          <div className="pd-confirm-modal-overlay">
            <div className="pd-confirm-modal">
              <h3>Xác nhận đặt mua</h3>
              <p>
                Bạn có chắc chắn muốn đặt mua {" "}
                {item.title ? `"${item.title}"` : "sản phẩm này"}?
              </p>
              <div className="pd-confirm-actions">
                <button
                  className="pd-btn"
                  onClick={() => setIsOrderConfirmOpen(false)}
                  disabled={orderLoading}
                >
                  Hủy
                </button>
                <button
                  className="pd-btn primary"
                  onClick={handleOrder}
                  disabled={orderLoading}
                >
                  {orderLoading ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Khiếu nại */}
        {isComplaintModalOpen && (
          <div className="pd-complaint-modal-overlay">
            <div className="pd-complaint-modal">
              <h3>Gửi khiếu nại về bài đăng</h3>
              <textarea
                placeholder="Vui lòng nhập lý do khiếu nại của bạn..."
                value={complaintReason}
                onChange={(e) => setComplaintReason(e.target.value)}
              />
              <div className="pd-complaint-modal-actions">
                <button className="pd-btn" onClick={() => setIsComplaintModalOpen(false)}>Hủy</button>
                <button className="pd-btn primary" onClick={handleComplaintSubmit} disabled={complaintLoading}>
                  {complaintLoading ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Zoom Ảnh */}
        {isZoomed && (
          <div className="pd-zoom-overlay" onClick={() => setIsZoomed(false)}>
            <button className="pd-zoom-close">&times;</button>
            <img
              src={mainImage}
              alt="Zoomed product"
              className="pd-zoomed-image"
              onClick={(e) => e.stopPropagation()} // Ngăn click vào ảnh đóng modal
            />
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDetail;
