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
  const [paymentsError, setPaymentsError] = useState(""); // Thêm state cho lỗi payment
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
    setPaymentsError(""); // Reset lỗi mỗi khi mở modal
    try {
      const data = await apiService.getTransactionPayments(transaction.transactionId || transaction.id);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setPayments([]);
      setPaymentsError(err.message || "Không thể tải lịch sử thanh toán."); // Set lỗi
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
                <th>Người bán/Sở hữu</th>
                <th>Nội dung</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tran => {
                // Một giao dịch được xem là dịch vụ nếu nó không có orderId
                const isServiceTransaction = !tran.orderId;

                return (
                  <tr key={tran.transactionId || tran.id}>
                    <td>{tran.transactionId || tran.id}</td>
                    <td>{tran.createdAt ? new Date(tran.createdAt).toLocaleString() : "—"}</td>
                    <td>{tran.status}</td>
                    <td>{tran.totalAmount?.toLocaleString()}₫</td>
                    <td>{tran.paidAmount?.toLocaleString()}₫</td>
                    
                    {/* Cột Người mua */}
                    <td>
                      {isServiceTransaction 
                        ? <span style={{ fontStyle: 'italic', color: '#555' }}>N/A (Dịch vụ)</span> 
                        : (tran.buyerUsername || "—")}
                    </td>

                    {/* Cột Người bán/Sở hữu */}
                    <td>{tran.sellerUsername || "—"}</td>
                    
                    {/* Cột Nội dung/Bài đăng */}
                    <td>
                      {isServiceTransaction ? (
                        <>
                          <span style={{ fontWeight: 'bold', color: '#007bff' }}>[Gia hạn]</span> {tran.listingTitle || "—"}
                        </>
                      ) : (
                        tran.listingTitle || "—"
                      )}
                    </td>

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
                );
              })}
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
                ) : paymentsError ? ( // Hiển thị lỗi nếu có
                  <div style={{ color: "red" }}>{paymentsError}</div>
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
