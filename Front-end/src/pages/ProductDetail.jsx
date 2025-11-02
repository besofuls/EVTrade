import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import defaultImage from "../assets/VinFast_VF5_Plus.jpg";
import Header from "../components/Header";
import apiService from "../services/apiService";
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

  // Comment & rating states
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentLoading, setCommentLoading] = useState(false);

  // State mới cho gallery ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // State mới cho zoom ảnh
  const [isZoomed, setIsZoomed] = useState(false);

  // Feedback states
  const [topMessage, setTopMessage] = useState({ text: "", type: "" });
  const [commentFeedback, setCommentFeedback] = useState({ text: "", type: "" });
  const [complaintFeedback, setComplaintFeedback] = useState({ text: "", type: "" });

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
      const data = await apiService.getListingComments(id);
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
    setLoading(true);
    Promise.all([fetchDetail(), fetchComments(), fetchFollowing()]);
  }, [id]);

  const fmtPrice = (v) => v == null ? "—" : new Intl.NumberFormat("vi-VN").format(Number(v)) + " đ";
  const fmtDate = (s) => s ? new Date(s).toLocaleDateString("vi-VN") : "—";

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

  const handleOrder = async () => {
    setOrderLoading(true);
    setTopMessage({ text: "", type: "" });
    if (!apiService.getAuthToken()) {
      navigate("/login");
      return;
    }
    try {
      await apiService.createOrder({ listingId: Number(id), quantity: 1 });
      setTopMessage({ text: "Đặt đơn hàng thành công!", type: "success" });
      fetchDetail(); // Tải lại để cập nhật trạng thái
    } catch (err) {
      setTopMessage({ text: err.message || "Đặt đơn hàng thất bại.", type: "error" });
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentLoading(true);
    setCommentFeedback({ text: "", type: "" });
    try {
      await apiService.createListingComment(id, { text: commentText, rating: commentRating });
      setCommentFeedback({ text: "Đã gửi bình luận!", type: "success" });
      setCommentText("");
      setCommentRating(5);
      fetchComments();
    } catch (err) {
      setCommentFeedback({ text: "Gửi bình luận thất bại.", type: "error" });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await apiService.unfollowListing(id);
        setIsFollowing(false);
      } else {
        await apiService.followListing(id);
        setIsFollowing(true);
      }
    } catch {}
    setFollowLoading(false);
  };

  const handleComplaint = async () => {
    setComplaintLoading(true);
    setComplaintFeedback({ text: "", type: "" });
    try {
      await apiService.createComplaint({ listingId: id, reason: "Khiếu nại bài đăng này" });
      setComplaintFeedback({ text: "Đã gửi khiếu nại thành công.", type: "success" });
    } catch (err) {
      setComplaintFeedback({ text: "Gửi khiếu nại thất bại.", type: "error" });
    } finally {
      setComplaintLoading(false);
    }
  };

  if (loading) return <div className="pd-loading">Đang tải...</div>;
  if (error) return <div className="pd-error">{error}</div>;
  if (!item) return <div className="pd-empty">Không tìm thấy sản phẩm.</div>;

  const product = item.product ?? {};
  const seller = item.seller ?? {};
  const hideOrderBtn = ["PROCESSING", "SOLD"].includes(String(item.status).toUpperCase());
  const imageList = item.images?.length ? item.images : [{ url: item.display, isPrimary: true }];

  return (
    <>
      <Header />
      <div className="pd-wrapper">
        <div className="pd-toolbar">
          <button className="pd-back" onClick={() => navigate(-1)}>← Quay lại</button>
        </div>

        {topMessage.text && (
          <div className={`pd-top-message ${topMessage.type}`}>{topMessage.text}</div>
        )}

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
              <div className="pd-seller-avatar">👤</div>
              <div className="pd-seller-info">
                <div className="pd-seller-name">{seller.username || "—"}</div>
                <div className="pd-seller-meta">Đăng ngày: {fmtDate(item.createdAt)}</div>
              </div>
            </div>

            <div className="pd-actions">
              {!hideOrderBtn && (
                <button className="pd-btn primary" onClick={handleOrder} disabled={orderLoading}>
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
                <button className="pd-btn complaint" onClick={handleComplaint} disabled={complaintLoading}>
                  🚩 Khiếu nại
                </button>
              </div>
              {complaintFeedback.text && (
                <div className={`pd-feedback ${complaintFeedback.type}`}>{complaintFeedback.text}</div>
              )}
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

          <div className="pd-details-card">
            <h3>Bình luận & Đánh giá</h3>
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
            {commentFeedback.text && (
              <div className={`pd-feedback ${commentFeedback.type}`}>{commentFeedback.text}</div>
            )}

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
                ))
              )}
            </div>
          </div>
        </div>

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
