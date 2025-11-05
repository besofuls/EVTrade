import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import apiService from "../services/apiService";
import "./UserProfile.css";

function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [listings, setListings] = useState([]);
  const [sellerFeedback, setSellerFeedback] = useState(null);
  const [sellerFeedbackError, setSellerFeedbackError] = useState("");
  const [sellerFeedbackLoading, setSellerFeedbackLoading] = useState(true);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userId = storedUser?.userID;

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    async function fetchProfile() {
      setLoading(true);
      setFeedback({ type: "", message: "" });
      try {
        const data = await apiService.getProfile(userId);
        setProfile(data || null);
        setFormData({
          fullName: data?.fullName || "",
          phone: data?.phone || "",
          address: data?.address || "",
          dateOfBirth: data?.dateOfBirth ? data.dateOfBirth.substring(0, 10) : "",
          gender: data?.gender || "",
        });
      } catch (err) {
        setFeedback({ type: "error", message: err.message || "Không thể tải hồ sơ người dùng." });
      } finally {
        setLoading(false);
      }
    }

    async function fetchListings() {
      try {
        const data = await apiService.getUserListings();
        setListings(Array.isArray(data) ? data : (Array.isArray(data.content) ? data.content : []));
      } catch {
        setListings([]);
      }
    }

    async function fetchSellerFeedbackData() {
      setSellerFeedbackLoading(true);
      setSellerFeedbackError("");
      try {
        const data = await apiService.getSellerFeedback(userId);
        setSellerFeedback(data);
      } catch (err) {
        setSellerFeedback(null);
        setSellerFeedbackError(err.message || "Không thể tải dữ liệu đánh giá.");
      } finally {
        setSellerFeedbackLoading(false);
      }
    }

    fetchProfile();
    fetchListings();
    fetchSellerFeedbackData();
  }, [navigate, userId]);

  const ratedListings = useMemo(() => {
    if (!sellerFeedback?.listings) return [];
    return sellerFeedback.listings
      .filter((item) => (item.reviewCount || 0) > 0)
      .map((item) => ({
        ...item,
        comments: Array.isArray(item.comments) ? item.comments : [],
      }));
  }, [sellerFeedback]);

  const recentComments = useMemo(() => {
    if (!ratedListings.length) return [];
    return ratedListings
      .flatMap((listing) =>
        listing.comments.map((comment) => ({
          ...comment,
          listingId: listing.listingId,
          listingTitle: listing.title,
        }))
      )
      .sort((a, b) => {
        const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return t2 - t1;
      })
      .slice(0, 5);
  }, [ratedListings]);

  const fmtRating = (value) =>
    Number.isFinite(value) ? Number(value).toFixed(1) : "0.0";

  const fmtDateTime = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "—";

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) return;

    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = { ...formData };
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      if (!payload.gender) delete payload.gender;

      const updated = await apiService.updateProfile(userId, payload);
      setProfile(updated);
      setFormData({
        fullName: updated.fullName || "",
        phone: updated.phone || "",
        address: updated.address || "",
        dateOfBirth: updated.dateOfBirth ? updated.dateOfBirth.substring(0, 10) : "",
        gender: updated.gender || "",
      });
      setEditing(false);
      setFeedback({ type: "success", message: "Đã lưu hồ sơ thành công." });
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Cập nhật hồ sơ thất bại." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: profile?.fullName || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : "",
      gender: profile?.gender || "",
    });
    setEditing(false);
    setFeedback({ type: "", message: "" });
  };

  return (
    <div className="user-profile-page">
      <Header />
      <main className="profile-main profile-main-flex">
        <div className="profile-left">
          <div className="profile-card">
            <div className="profile-card-header">
              <div>
                <h1>Hồ sơ cá nhân</h1>
                <p className="profile-note">
                  Quản lý thông tin liên hệ của bạn để thuận tiện khi giao dịch.
                </p>
              </div>
              <button
                className="profile-toggle-btn"
                onClick={() => setEditing((prev) => !prev)}
                disabled={loading}
              >
                {editing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
              </button>
            </div>

            {loading ? (
              <div className="profile-loading">Đang tải hồ sơ...</div>
            ) : (
              <>
                {feedback.message && (
                  <div className={`profile-alert ${feedback.type}`}>
                    {feedback.message}
                  </div>
                )}

                <section className="profile-section">
                  <h2>Thông tin tài khoản</h2>
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="label">Tên đăng nhập</span>
                      <span className="value">{profile?.user?.username || storedUser?.username || "—"}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Email</span>
                      <span className="value">{profile?.user?.email || storedUser?.email || "—"}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Quyền</span>
                      <span className="value">
                        {profile?.user?.role?.roleName || storedUser?.roles?.[0] || "Member"}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Ngày tạo</span>
                      <span className="value">
                        {profile?.user?.createdAt
                          ? new Date(profile.user.createdAt).toLocaleString("vi-VN")
                          : "—"}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="label">Ngày cập nhật</span>
                      <span className="value">
                        {profile?.updatedAt
                          ? new Date(profile.updatedAt).toLocaleString("vi-VN")
                          : "—"}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="profile-section">
                  <h2>Thông tin liên hệ</h2>
                  {editing ? (
                    <form className="profile-form" onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="fullName">Họ và tên</label>
                        <input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          placeholder="Nhập họ và tên"
                          onChange={handleChange("fullName")}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          placeholder="Nhập số điện thoại"
                          onChange={handleChange("phone")}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="address">Địa chỉ</label>
                        <textarea
                          id="address"
                          rows={3}
                          value={formData.address}
                          placeholder="Nhập địa chỉ liên hệ"
                          onChange={handleChange("address")}
                        />
                      </div>
                      <div className="form-double">
                        <div className="form-group">
                          <label htmlFor="dateOfBirth">Ngày sinh</label>
                          <input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleChange("dateOfBirth")}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="gender">Giới tính</label>
                          <select
                            id="gender"
                            value={formData.gender}
                            onChange={handleChange("gender")}
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                            <option value="Other">Khác</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          Hủy
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                          {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-info-grid">
                      <div className="profile-info-item">
                        <span className="label">Họ và tên</span>
                        <span className="value">{profile?.fullName || "Chưa cập nhật"}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="label">Số điện thoại</span>
                        <span className="value">{profile?.phone || "Chưa cập nhật"}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="label">Địa chỉ</span>
                        <span className="value">{profile?.address || "Chưa cập nhật"}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="label">Ngày sinh</span>
                        <span className="value">
                          {profile?.dateOfBirth
                            ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                            : "Chưa cập nhật"}
                        </span>
                      </div>
                      <div className="profile-info-item">
                        <span className="label">Giới tính</span>
                        <span className="value">{profile?.gender || "Chưa cập nhật"}</span>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
        <div className="profile-right">
          <div className="profile-feedback-card">
            <div className="profile-feedback-header">
              <h2>Đánh giá từ người mua</h2>
            </div>

            {sellerFeedbackLoading ? (
              <div className="profile-feedback-state">Đang tải dữ liệu đánh giá...</div>
            ) : sellerFeedbackError ? (
              <div className="profile-feedback-state error">{sellerFeedbackError}</div>
            ) : !sellerFeedback ? (
              <div className="profile-feedback-state">Chưa có dữ liệu đánh giá.</div>
            ) : (
              <>
                <div className="profile-feedback-stats">
                  <div className="stat">
                    <span className="label">Đánh giá trung bình</span>
                    <span className="value">
                      {fmtRating(sellerFeedback.averageRating)} <span className="highlight">⭐</span>
                    </span>
                  </div>
                  <div className="stat">
                    <span className="label">Lượt đánh giá</span>
                    <span className="value">{sellerFeedback.totalReviews || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Bài đăng được đánh giá</span>
                    <span className="value">{ratedListings.length}</span>
                  </div>
                </div>

                <div className="profile-feedback-recent">
                  <h3>Nhận xét gần đây</h3>
                  {recentComments.length === 0 ? (
                    <div className="profile-feedback-empty">Chưa có nhận xét từ người mua.</div>
                  ) : (
                    <ul className="profile-feedback-comment-list">
                      {recentComments.map((comment) => (
                        <li key={`${comment.reviewId}-${comment.listingId}`}>
                          <div className="comment-top">
                            <strong>{comment.buyerName || "Người mua"}</strong>
                            {Number.isFinite(comment.rating) && (
                              <span className="badge">{comment.rating} ⭐</span>
                            )}
                            <span className="time">{fmtDateTime(comment.createdAt)}</span>
                          </div>
                          <div className="comment-meta">{comment.listingTitle || "Bài đăng"}</div>
                          {comment.comment && (
                            <p className="comment-text">{comment.comment}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="profile-feedback-listings">
                  <h3>Chi tiết theo bài đăng</h3>
                  {ratedListings.length === 0 ? (
                    <div className="profile-feedback-empty">Bạn chưa có bài đăng nào được đánh giá.</div>
                  ) : (
                    <div className="profile-feedback-list">
                      {ratedListings.map((listing) => (
                        <div className="feedback-listing" key={listing.listingId}>
                          <div className="listing-head">
                            <div>
                              <h4>{listing.title || "Bài đăng không tiêu đề"}</h4>
                              <div className="listing-meta">
                                <span>{listing.reviewCount || 0} lượt đánh giá</span>
                                <span>• Trung bình {fmtRating(listing.averageRating)} ⭐</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="listing-view"
                              onClick={() => navigate(`/product/${listing.listingId}`)}
                            >
                              Xem bài đăng
                            </button>
                          </div>
                          {(listing.comments || []).length === 0 ? (
                            <div className="profile-feedback-empty small">Chưa có bình luận.</div>
                          ) : (
                            <ul className="listing-comment-list">
                              {(listing.comments || []).slice(0, 3).map((comment) => (
                                <li key={comment.reviewId}>
                                  <div className="listing-comment-head">
                                    <strong>{comment.buyerName || "Người mua"}</strong>
                                    {Number.isFinite(comment.rating) && (
                                      <span className="badge">{comment.rating} ⭐</span>
                                    )}
                                    <span className="time">{fmtDateTime(comment.createdAt)}</span>
                                  </div>
                                  {comment.comment && (
                                    <p className="listing-comment-text">{comment.comment}</p>
                                  )}
                                </li>
                              ))}
                              {(listing.comments || []).length > 3 && (
                                <li className="listing-comment-more">
                                  +{(listing.comments || []).length - 3} bình luận khác
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="profile-listings-card">
            <div className="profile-listings-header">
              <h2>Bài đăng gần đây</h2>
              <button
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "15px" }}
                onClick={() => navigate("/my-listings")}
              >
                Xem tất cả
              </button>
            </div>
            <div className="profile-listings-list">
              {listings.length === 0 ? (
                <div className="profile-listings-empty">Không có bài đăng nào.</div>
              ) : (
                <table className="profile-listings-table">
                  <thead>
                    <tr>
                      <th>Hình</th>
                      <th>Tiêu đề</th>
                      <th>Ngày tạo</th>
                      <th>Giá</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.slice(0, 3).map((item) => (
                      <tr key={item.listingID || item.id}>
                        <td>
                          <img
                            src={item.primaryImageUrl || (item.images && item.images[0]?.url) || "/no-image.png"}
                            alt={item.title || "Hình bài đăng"}
                            className="listing-thumb-large"
                          />
                        </td>
                        <td>
                          <span className="listing-title-link">
                            {item.title || item.shortDescription || "—"}
                          </span>
                        </td>
                        <td>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td>
                          {item.price
                            ? item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                            : "—"}
                        </td>
                        <td>
                          <span className={`listing-status status-${String(item.status || "").toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default UserProfile;

