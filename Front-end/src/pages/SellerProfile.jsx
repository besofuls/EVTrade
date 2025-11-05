import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import apiService from "../services/apiService";
import "./SellerProfile.css";

function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getSellerFeedback(sellerId);
        if (!active) return;
        if (!data) {
          setError("Không tìm thấy thông tin người bán.");
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || "Không thể tải thông tin người bán.");
        setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (sellerId) {
      fetchProfile();
    }

    return () => {
      active = false;
    };
  }, [sellerId]);

  const sortedListings = useMemo(() => {
    if (!profile?.listings) return [];
    return [...profile.listings].sort((a, b) => b.reviewCount - a.reviewCount);
  }, [profile]);

  const recentComments = useMemo(() => {
    if (!sortedListings.length) return [];
    const merged = sortedListings
      .flatMap((listing) =>
        (listing.comments || []).map((comment) => ({
          ...comment,
          listingId: listing.listingId,
          listingTitle: listing.title,
        }))
      )
      .filter((c) => c.comment || Number.isFinite(c.rating));

    return merged
      .sort((a, b) => {
        const d1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const d2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return d2 - d1;
      })
      .slice(0, 6);
  }, [sortedListings]);

  const fmtDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "—");
  const fmtDateTime = (value) => (value ? new Date(value).toLocaleString("vi-VN") : "—");
  const fmtRating = (value) =>
    Number.isFinite(value) ? value.toFixed(1) : "0.0";

  const handleBack = () => navigate(-1);

  const handleListingNavigate = (listingId) => {
    if (listingId) {
      navigate(`/product/${listingId}`);
    }
  };

  return (
    <>
      <Header />
      <div className="seller-profile-wrapper">
        <div className="seller-profile-toolbar">
          <button className="seller-profile-back" onClick={handleBack}>
            ← Quay lại
          </button>
        </div>

        {loading && <div className="seller-profile-state">Đang tải thông tin người bán...</div>}
        {!loading && error && (
          <div className="seller-profile-state error">{error}</div>
        )}

        {!loading && !error && profile && (
          <div className="seller-profile-content">
            <section className="seller-profile-card">
              <div className="seller-profile-avatar">👤</div>
              <div className="seller-profile-main">
                <h1 className="seller-profile-name">
                  {profile.sellerName || profile.sellerUsername || "Người bán"}
                </h1>
                {profile.sellerUsername && (
                  <div className="seller-profile-username">@{profile.sellerUsername}</div>
                )}
                <div className="seller-profile-meta">
                  <span>Thành viên từ {fmtDate(profile.memberSince)}</span>
                  <span>• Tổng bài đăng: {profile.totalListings || 0}</span>
                </div>
                <div className="seller-profile-contact">
                  {profile.email && <span>📧 {profile.email}</span>}
                  {profile.phone && <span>📞 {profile.phone}</span>}
                  {profile.address && <span>📍 {profile.address}</span>}
                </div>
              </div>
              <div className="seller-profile-stats">
                <div className="seller-profile-stat">
                  <div className="label">Đánh giá TB</div>
                  <div className="value">
                    {fmtRating(profile.averageRating)} <span>⭐</span>
                  </div>
                </div>
                <div className="seller-profile-stat">
                  <div className="label">Lượt đánh giá</div>
                  <div className="value">{profile.totalReviews || 0}</div>
                </div>
                <div className="seller-profile-stat">
                  <div className="label">Bài đăng</div>
                  <div className="value">{profile.totalListings || 0}</div>
                </div>
              </div>
            </section>

            <section className="seller-profile-section">
              <div className="seller-profile-section-header">
                <h2>Nhận xét gần đây</h2>
                <span className="seller-profile-section-sub">
                  {recentComments.length > 0
                    ? `${recentComments.length} bình luận gần nhất của người mua`
                    : "Chưa có nhận xét nào"}
                </span>
              </div>
              {recentComments.length === 0 ? (
                <div className="seller-profile-empty">Người bán chưa có bình luận.</div>
              ) : (
                <div className="seller-profile-comments">
                  {recentComments.map((comment) => (
                    <div className="seller-profile-comment" key={`${comment.reviewId}-${comment.listingId}`}>
                      <div className="comment-header">
                        <div className="comment-author">
                          <span className="comment-name">
                            {comment.buyerName || "Người mua ẩn danh"}
                          </span>
                          {Number.isFinite(comment.rating) && (
                            <span className="comment-rating">{comment.rating} ⭐</span>
                          )}
                        </div>
                        <div className="comment-meta">
                          <button
                            type="button"
                            className="comment-listing"
                            onClick={() => handleListingNavigate(comment.listingId)}
                          >
                            {comment.listingTitle || "Xem bài đăng"}
                          </button>
                          <span className="comment-date">{fmtDateTime(comment.createdAt)}</span>
                        </div>
                      </div>
                      {comment.comment && (
                        <p className="comment-body">{comment.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="seller-profile-section">
              <div className="seller-profile-section-header">
                <h2>Đánh giá theo bài đăng</h2>
                <span className="seller-profile-section-sub">
                  Tổng cộng {sortedListings.length} bài đăng đã nhận đánh giá
                </span>
              </div>

              {sortedListings.length === 0 ? (
                <div className="seller-profile-empty">
                  Người bán chưa có bài đăng nào được đánh giá.
                </div>
              ) : (
                <div className="seller-profile-listings">
                  {sortedListings.map((listing) => (
                    <div className="seller-profile-listing" key={listing.listingId}>
                      <div className="listing-header">
                        <div>
                          <h3>{listing.title || "Bài đăng không tiêu đề"}</h3>
                          <div className="listing-meta">
                            <span>{listing.reviewCount || 0} lượt đánh giá</span>
                            <span>• Trung bình {fmtRating(listing.averageRating)} ⭐</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="listing-view"
                          onClick={() => handleListingNavigate(listing.listingId)}
                        >
                          Xem bài đăng
                        </button>
                      </div>

                      {(listing.comments || []).length === 0 ? (
                        <div className="listing-empty">Chưa có bình luận.</div>
                      ) : (
                        <ul className="listing-comments">
                          {(listing.comments || []).slice(0, 4).map((comment) => (
                            <li className="listing-comment" key={comment.reviewId}>
                              <div className="listing-comment-header">
                                <span className="listing-comment-name">
                                  {comment.buyerName || "Người mua"}
                                </span>
                                {Number.isFinite(comment.rating) && (
                                  <span className="listing-comment-rating">
                                    {comment.rating} ⭐
                                  </span>
                                )}
                                <span className="listing-comment-date">
                                  {fmtDate(comment.createdAt)}
                                </span>
                              </div>
                              {comment.comment && (
                                <p className="listing-comment-body">{comment.comment}</p>
                              )}
                            </li>
                          ))}
                          {(listing.comments || []).length > 4 && (
                            <li className="listing-comment more">
                              +{(listing.comments || []).length - 4} bình luận khác...
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}

export default SellerProfile;
