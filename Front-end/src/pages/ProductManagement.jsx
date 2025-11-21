import React, { useEffect, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import apiService from "../services/apiService";
import "./ProductManagement.css";

function ProductManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // {type: 'approve'|'reject'|'delete', id: number}
  const [showRejectInput, setShowRejectInput] = useState(false); // Thêm state để kiểm soát hiển thị ô nhập lý do
  const [zoomImageUrl, setZoomImageUrl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const roles = Array.isArray(parsed?.roles) ? parsed.roles : [];
        setIsAdmin(roles.some((role) => String(role).toUpperCase().includes("ADMIN")));
        setIsModerator(roles.some((role) => String(role).toUpperCase().includes("MODERATOR")));
      } catch {
        setIsAdmin(false);
        setIsModerator(false);
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    if (activeTab === "all") {
      apiService.getAllListings()
        .then(data => setPosts(data.content || []))
        .catch(err => {
          const message = err.message || "Không thể tải danh sách bài đăng.";
          setError(message);
          showToast(message, "error");
        })
        .finally(() => setLoading(false));
    }
    if (activeTab === "moderation") {
      apiService.getListingsPending()
        .then(data => setPendingPosts(data.content || []))
        .catch(err => {
          const message = err.message || "Không thể tải danh sách bài chờ duyệt.";
          setError(message);
          showToast(message, "error");
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab, showToast]);

  // Mở modal chi tiết bài đăng
  const handleOpenDetail = (post) => {
    setSelectedPost(post);
    setShowModal(true);
    setRejectReason("");
    setShowRejectInput(false);
    setShowDeleteInput(false);
    setDeleteReason("");
  };

  const handleApprove = (id) => {
    setConfirmAction({ type: "approve", id });
  };

  const doApprove = async (id) => {
    try {
      await apiService.approveListing(id);
      setPendingPosts(pendingPosts => pendingPosts.filter(p => p.id !== id));
      setShowModal(false);
      setConfirmAction(null);
      showToast("Đã duyệt bài đăng!", "success");
    } catch (err) {
      showToast("Duyệt bài đăng thất bại: " + err.message, "error");
    }
  };

  const doReject = async (id) => {
    setRejectLoading(true);
    try {
      await apiService.rejectListing(id, rejectReason);
      setPendingPosts(pendingPosts => pendingPosts.filter(p => p.id !== id));
      setShowModal(false);
      setConfirmAction(null);
      setShowRejectInput(false);
      showToast("Đã từ chối bài đăng!", "success");
    } catch (err) {
      showToast("Từ chối bài đăng thất bại: " + err.message, "error");
    }
    setRejectLoading(false);
  };

  const doDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await apiService.deleteListing(id, deleteReason);
      setPosts(prev => prev.filter(p => p.id !== id));
      setPendingPosts(prev => prev.filter(p => p.id !== id));
      setShowModal(false);
      setConfirmAction(null);
      setShowDeleteInput(false);
      showToast("Đã xóa bài đăng.", "success");
    } catch (err) {
      showToast("Xóa bài đăng thất bại: " + (err.message || ""), "error");
    }
    setDeleteLoading(false);
  };

  return (
    <div className="admin-dashboard-main">
      <h1 className="admin-dashboard-title">Quản lý bài đăng</h1>
      <div className="admin-tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          Tất cả bài đăng
        </button>
        <button
          className={activeTab === "moderation" ? "active" : ""}
          onClick={() => setActiveTab("moderation")}
        >
          Kiểm duyệt bài đăng
        </button>
      </div>
      <div className="admin-dashboard-section">
        {loading && <div>Đang tải...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!loading && !error && activeTab === "all" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Người bán</th>
                <th>Danh mục</th>
                <th>Hãng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>
                    <button
                      className="admin-link-btn"
                      style={{ color: "#1976d2", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                      onClick={() => handleOpenDetail(post)}
                    >
                      {post.title}
                    </button>
                  </td>
                  <td>{post.price?.toLocaleString()}₫</td>
                  <td>{post.status}</td>
                  <td>{new Date(post.createdAt).toLocaleString()}</td>
                  <td>{post.seller?.username}</td>
                  <td>{post.categoryName}</td>
                  <td>{post.brandName}</td>
                  <td>
                    <button
                      className="admin-user-btn"
                      style={{ background: "#1976d2", color: "#fff" }}
                      onClick={() => handleOpenDetail(post)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !error && activeTab === "moderation" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Giá</th>
                <th>Ngày tạo</th>
                <th>Người bán</th>
                <th>Danh mục</th>
                <th>Hãng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pendingPosts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>
                    <button
                      className="admin-link-btn"
                      style={{ color: "#1976d2", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                      onClick={() => handleOpenDetail(post)}
                    >
                      {post.title}
                    </button>
                  </td>
                  <td>{post.price?.toLocaleString()}₫</td>
                  <td>{new Date(post.createdAt).toLocaleString()}</td>
                  <td>{post.seller?.username}</td>
                  <td>{post.categoryName}</td>
                  <td>{post.brandName}</td>
                  <td>
                    <button
                      className="admin-user-btn"
                      style={{ background: "#2e7d32", color: "#fff", marginRight: 8 }}
                      onClick={() => handleOpenDetail(post)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal chi tiết bài đăng */}
        {showModal && selectedPost && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Chi tiết bài đăng</h2>
              <div>
                <strong>Tiêu đề:</strong> {selectedPost.title}<br />
                <strong>Giá:</strong> {selectedPost.price?.toLocaleString()}₫<br />
                <strong>Ngày tạo:</strong> {new Date(selectedPost.createdAt).toLocaleString()}<br />
                <strong>Người bán:</strong> {selectedPost.seller?.username}<br />
                <strong>Danh mục:</strong> {selectedPost.categoryName}<br />
                <strong>Hãng:</strong> {selectedPost.brandName}<br />
                <strong>Trạng thái:</strong> {selectedPost.status}<br />
                {selectedPost.rejectionReason && (
                  <>
                    <strong>Lý do gần nhất:</strong> {selectedPost.rejectionReason}<br />
                  </>
                )}
                <strong>Mô tả:</strong> {selectedPost.description}<br />
                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div style={{ margin: "12px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {selectedPost.images.map((img, idx) => (
                      <img
                        key={img.id || idx}
                        src={img.url}
                        alt={`Ảnh xe ${idx + 1}`}
                        style={{
                          maxWidth: 180,
                          maxHeight: 120,
                          borderRadius: 6,
                          border: img.isPrimary ? "2px solid #1976d2" : "1px solid #ccc",
                          boxShadow: img.isPrimary ? "0 2px 8px rgba(25,118,210,0.12)" : "none",
                          cursor: "pointer"
                        }}
                        onClick={() => setZoomImageUrl(img.url)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {activeTab === "moderation" && (
                  <>
                    <button
                      className="admin-user-btn"
                      style={{ background: "#2e7d32", color: "#fff" }}
                      onClick={() => handleApprove(selectedPost.id)}
                    >
                      Duyệt
                    </button>
                    <button
                      className="admin-user-btn"
                      style={{ background: "#c62828", color: "#fff" }}
                      onClick={() => {
                        setShowRejectInput(true);
                        setRejectReason("");
                        setShowDeleteInput(false);
                        setDeleteReason("");
                      }}
                    >
                      Từ chối
                    </button>
                  </>
                )}
                {(isAdmin || isModerator) && (
                  <button
                    className="admin-user-btn"
                    style={{ background: "#b91c1c", color: "#fff" }}
                    onClick={() => {
                      setShowDeleteInput(true);
                      setDeleteReason("");
                      setShowRejectInput(false);
                      setRejectReason("");
                    }}
                  >
                    Xóa bài đăng
                  </button>
                )}
                <button
                  className="admin-user-btn"
                  style={{ background: "#888", color: "#fff" }}
                  onClick={() => {
                    setShowModal(false);
                    setShowRejectInput(false);
                    setShowDeleteInput(false);
                    setRejectReason("");
                    setDeleteReason("");
                  }}
                >
                  Đóng
                </button>
              </div>
              {/* Nếu bấm từ chối thì hiện ô nhập lý do */}
              {showRejectInput && (
                <div style={{ marginTop: 16 }}>
                  <label>Lý do từ chối:</label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                    disabled={rejectLoading}
                  />
                  <button
                    className="admin-user-btn"
                    style={{ background: "#c62828", color: "#fff", marginTop: 8 }}
                    onClick={() => {
                      if (!rejectReason.trim()) {
                        showToast("Vui lòng nhập lý do từ chối!", "warning");
                        return;
                      }
                      setConfirmAction({ type: "reject", id: selectedPost.id });
                    }}
                    disabled={rejectLoading}
                  >
                    Xác nhận từ chối
                  </button>
                  <button
                    className="admin-user-btn"
                    style={{ background: "#888", color: "#fff", marginLeft: 8, marginTop: 8 }}
                    onClick={() => setShowRejectInput(false)}
                    disabled={rejectLoading}
                  >
                    Hủy
                  </button>
                </div>
              )}
              {(isAdmin || isModerator) && showDeleteInput && (
                <div style={{ marginTop: 16 }}>
                  <label>Lý do xóa bài đăng:</label>
                  <textarea
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                    style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc", minHeight: 80 }}
                    disabled={deleteLoading}
                  />
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                      className="admin-user-btn"
                      style={{ background: "#b91c1c", color: "#fff" }}
                      onClick={() => {
                        if (!deleteReason.trim()) {
                          showToast("Vui lòng nhập lý do xóa bài đăng!", "warning");
                          return;
                        }
                        setConfirmAction({ type: "delete", id: selectedPost.id });
                      }}
                      disabled={deleteLoading}
                    >
                      Xác nhận xóa
                    </button>
                    <button
                      className="admin-user-btn"
                      style={{ background: "#888", color: "#fff" }}
                      onClick={() => {
                        setShowDeleteInput(false);
                        setDeleteReason("");
                      }}
                      disabled={deleteLoading}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal xác nhận duyệt/từ chối */}
        {confirmAction && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 350 }}>
              <h3>Xác nhận</h3>
              <div style={{ margin: "16px 0" }}>
                {confirmAction.type === "approve" && "Bạn có chắc chắn muốn duyệt bài đăng này?"}
                {confirmAction.type === "reject" && (
                  <>
                    <div>Bạn có chắc chắn muốn từ chối bài đăng này?</div>
                    <div><strong>Lý do:</strong> {rejectReason}</div>
                  </>
                )}
                {confirmAction.type === "delete" && (
                  <>
                    <div>Bạn có chắc chắn muốn xóa bài đăng này?</div>
                    <div><strong>Lý do:</strong> {deleteReason}</div>
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="admin-user-btn"
                  style={{ background: "#1976d2", color: "#fff" }}
                  onClick={() => {
                    if (confirmAction.type === "approve") doApprove(confirmAction.id);
                    else if (confirmAction.type === "reject") doReject(confirmAction.id);
                    else if (confirmAction.type === "delete") doDelete(confirmAction.id);
                  }}
                  disabled={(confirmAction.type === "reject" && rejectLoading) || (confirmAction.type === "delete" && deleteLoading)}
                >
                  Xác nhận
                </button>
                <button
                  className="admin-user-btn"
                  style={{ background: "#888", color: "#fff" }}
                  onClick={() => setConfirmAction(null)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal zoom ảnh */}
        {zoomImageUrl && (
          <div className="modal-overlay zoom-image" onClick={() => setZoomImageUrl(null)}>
            <div
              className="modal-content zoom-image"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={zoomImageUrl}
                alt="Zoom ảnh xe"
                className="zoom-image-img"
              />
              <button
                className="zoom-image-close"
                onClick={() => setZoomImageUrl(null)}
                title="Đóng"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductManagement;