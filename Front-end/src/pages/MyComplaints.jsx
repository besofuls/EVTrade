import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import apiService from "../services/apiService";
import "./MyComplaints.css";

function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true);
      setError("");
      try {
        if (!apiService.isAuthenticated()) {
          navigate("/login", { replace: true });
          return;
        }
        const data = await apiService.getMyComplaints();
        setComplaints(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách khiếu nại.");
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [navigate]);

  const sortedComplaints = useMemo(() => {
    return [...complaints].sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [complaints]);

  const fmtDateTime = (value) => (value ? new Date(value).toLocaleString("vi-VN") : "—");

  return (
    <div className="my-complaints-page">
      <Header />
      <main className="my-complaints-main">
        <div className="my-complaints-card">
          <div className="my-complaints-header">
            <h1>Khiếu nại của tôi</h1>
            <p>Theo dõi các khiếu nại bạn đã gửi cho đội ngũ hỗ trợ.</p>
          </div>

          {loading && <div className="my-complaints-state">Đang tải danh sách...</div>}
          {!loading && error && <div className="my-complaints-error">{error}</div>}
          {!loading && !error && (
            <div className="my-complaints-list">
              {sortedComplaints.length === 0 ? (
                <div className="my-complaints-empty">
                  Bạn chưa gửi khiếu nại nào.
                </div>
              ) : (
                <table className="my-complaints-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Bài đăng</th>
                      <th>Nội dung khiếu nại</th>
                      <th>Trạng thái</th>
                      <th>Ngày gửi</th>
                      <th>Ngày xử lý</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedComplaints.map((complaint, index) => (
                      <tr key={complaint.complaintID || index}>
                        <td>{complaint.complaintID || index + 1}</td>
                        <td>
                          <button
                            type="button"
                            className="my-complaints-link"
                            onClick={() => {
                              if (complaint?.listing?.listingID) {
                                navigate(`/product/${complaint.listing.listingID}`);
                              }
                            }}
                          >
                            {complaint?.listing?.title || "Bài đăng"}
                          </button>
                        </td>
                        <td>
                          <div className="my-complaints-content">
                            {complaint?.content || "—"}
                          </div>
                        </td>
                        <td>
                          <span className={`complaint-status status-${String(complaint?.status || "").toLowerCase()}`}>
                            {complaint?.status || "Pending"}
                          </span>
                        </td>
                        <td>{fmtDateTime(complaint?.createdAt)}</td>
                        <td>{fmtDateTime(complaint?.resolvedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default MyComplaints;
