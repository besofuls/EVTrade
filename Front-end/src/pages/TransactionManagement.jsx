import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";
import "./TransactionManagement.css";

function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    apiService.getAllTransactions()
      .then(data => setTransactions(Array.isArray(data) ? data : (data.content || [])))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleShowPayments = async (transaction) => {
    setSelectedTransaction(transaction);
    setPaymentsLoading(true);
    setShowPaymentsModal(true);
    try {
      const data = await apiService.getTransactionPayments(transaction.transactionId || transaction.id);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setPayments([]);
    }
    setPaymentsLoading(false);
  };

  return (
    <div className="admin-dashboard-main">
      <h1 className="admin-dashboard-title">Quản lý giao dịch</h1>
      <div className="admin-dashboard-section">
        {loading && <div>Đang tải...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Đã thanh toán</th>
                <th>Người mua</th>
                <th>Người bán</th>
                <th>Bài đăng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tran => (
                <tr key={tran.transactionId || tran.id}>
                  <td>{tran.transactionId || tran.id}</td>
                  <td>{tran.createdAt ? new Date(tran.createdAt).toLocaleString() : "—"}</td>
                  <td>{tran.status}</td>
                  <td>{tran.totalAmount?.toLocaleString()}₫</td>
                  <td>{tran.paidAmount?.toLocaleString()}₫</td>
                  <td>{tran.buyerUsername || "—"}</td>
                  <td>{tran.sellerUsername || "—"}</td>
                  <td>{tran.listingTitle || "—"}</td>
                  <td>
                    <button
                      className="admin-user-btn"
                      style={{ background: "#1976d2", color: "#fff" }}
                      onClick={() => handleShowPayments(tran)}
                    >
                      Xem thanh toán
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal lịch sử thanh toán */}
        {showPaymentsModal && (
          <div className="modal-overlay">
            <div className="modal-content payments-modal">
              <h2>Lịch sử thanh toán</h2>
              <div className="payment-summary">
                <div><strong>Giao dịch:</strong> {selectedTransaction?.transactionId || selectedTransaction?.id}</div>
                <div><strong>Bài đăng:</strong> {selectedTransaction?.listingTitle || "—"}</div>
                <div><strong>Người mua:</strong> {selectedTransaction?.buyerUsername || "—"}</div>
                <div><strong>Người bán:</strong> {selectedTransaction?.sellerUsername || "—"}</div>
                <div><strong>Tổng tiền:</strong> {selectedTransaction?.totalAmount?.toLocaleString()}₫</div>
              </div>
              <div className="payment-history-section">
                {paymentsLoading ? (
                  <div>Đang tải lịch sử thanh toán...</div>
                ) : payments.length === 0 ? (
                  <div>Không có lịch sử thanh toán.</div>
                ) : (
                  <div className="payment-history-table-wrapper">
                    <table className="admin-table payment-history-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Số tiền</th>
                          <th>Phương thức</th>
                          <th>Nhà cung cấp</th>
                          <th>Trạng thái</th>
                          <th>Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(pay => (
                          <tr key={pay.paymentId || pay.id}>
                            <td>{pay.paymentId || pay.id}</td>
                            <td>{pay.amount?.toLocaleString()}₫</td>
                            <td>{pay.method}</td>
                            <td>{pay.provider}</td>
                            <td>{pay.status}</td>
                            <td>{pay.paidAt ? new Date(pay.paidAt).toLocaleString() : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <button
                className="admin-user-btn modal-close-btn"
                onClick={() => setShowPaymentsModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionManagement;