import React, { useEffect, useMemo, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import apiService from "../services/apiService";
import "./ComplaintManagement.css";

function ComplaintManagement() {
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null);
  const { showToast } = useToast();

  const loadComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const data = await apiService.get_all_complaints(params);
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err.message || "Không thể tải khiếu nại.";
      setError(message);
      setComplaints([]);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const sortedComplaints = useMemo(() => {
    return [...complaints].sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [complaints]);

  const fmtDateTime = (value) => (value ? new Date(value).toLocaleString("vi-VN") : "—");

  const handleResolve = async (complaintId, nextStatus) => {
    if (!complaintId) return;
    setProcessing(complaintId);
    try {
      await apiService.resolve_complaint(complaintId, nextStatus);
      await loadComplaints();
      const successMessage =
        nextStatus === "Resolved"
          ? "Đã đánh dấu khiếu nại là đã xử lý."
          : "Đã từ chối khiếu nại.";
      showToast(successMessage, "success");
    } catch (err) {
      showToast(err.message || "Không thể cập nhật trạng thái khiếu nại.", "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="complaint-management">
      <div className="complaint-header">
        <div>
          <h2>Khiếu nại</h2>
          <p>Theo dõi và xử lý khiếu nại từ người dùng.</p>
        </div>
        <div className="complaint-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Resolved">Đã xử lý</option>
            <option value="Rejected">Từ chối</option>
          </select>
          <button type="button" onClick={loadComplaints} className="complaint-refresh">
            Làm mới
          </button>
        </div>
      </div>

      {loading && <div className="complaint-state">Đang tải dữ liệu...</div>}
      {!loading && error && <div className="complaint-error">{error}</div>}

      {!loading && !error && (
        <div className="complaint-table-wrapper">
          {sortedComplaints.length === 0 ? (
            <div className="complaint-state">Không có khiếu nại nào.</div>
          ) : (
            <table className="complaint-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Người gửi</th>
                  <th>Email</th>
                  <th>Bài đăng</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th>
                  <th>Ngày gửi</th>
                  <th>Ngày xử lý</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedComplaints.map((complaint, index) => (
                  <tr key={complaint.complaintID || index}>
                    <td>{complaint.complaintID || index + 1}</td>
                    <td>{complaint?.user?.username || complaint?.user?.email || "—"}</td>
                    <td>{complaint?.user?.email || "—"}</td>
                    <td>{complaint?.listing?.title || "Bài đăng"}</td>
                    <td className="complaint-content">{complaint?.content || "—"}</td>
                    <td>
                      <span className={`complaint-status status-${String(complaint?.status || "").toLowerCase()}`}>
                        {complaint?.status || "Pending"}
                      </span>
                    </td>
                    <td>{fmtDateTime(complaint?.createdAt)}</td>
                    <td>{fmtDateTime(complaint?.resolvedAt)}</td>
                    <td className="complaint-actions">
                      <button
                        type="button"
                        disabled={processing === complaint.complaintID}
                        onClick={() => handleResolve(complaint.complaintID, "Resolved")}
                      >
                        Đánh dấu đã xử lý
                      </button>
                      <button
                        type="button"
                        className="reject"
                        disabled={processing === complaint.complaintID}
                        onClick={() => handleResolve(complaint.complaintID, "Rejected")}
                      >
                        Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default ComplaintManagement;
