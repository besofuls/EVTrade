import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import apiService from "../services/apiService";
import { useNavigate, useLocation } from "react-router-dom";
import "./OrderPayment.css";

function MyOrdersPayment() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [paymentTransaction, setPaymentTransaction] = useState(null);
  const [amountInput, setAmountInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Thông báo trạng thái thanh toán từ callback
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    // Lấy trạng thái thanh toán và lý do từ query param
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const reason = params.get("reason");
    setPaymentStatus(status || "");
    // Hiển thị thông báo chi tiết cho từng trường hợp
    if (status === "success") {
      setPaymentMessage("Thanh toán thành công! Cảm ơn bạn đã sử dụng dịch vụ.");
    } else if (status === "fail") {
      setPaymentMessage(
        reason
          ? `Thanh toán thất bại: ${decodeURIComponent(reason)}`
          : `Thanh toán thất bại hoặc bị hủy!
Một số nguyên nhân có thể:
- Bạn đã hủy giao dịch trên cổng thanh toán.
- Ngân hàng từ chối giao dịch (thẻ không đủ tiền, thẻ bị khóa, vượt hạn mức...).
- Sai thông tin giao dịch hoặc mã bảo mật.
- Hệ thống VNPAY hoặc ngân hàng đang bảo trì hoặc lỗi.
- Giao dịch bị timeout hoặc nghi ngờ gian lận.`
      );
    } else {
      setPaymentMessage("");
    }
  }, [location.search]);

  useEffect(() => {
    const isLoggedIn = apiService.isAuthenticated();
    const isExpired = apiService.isTokenExpired();
    if (!isLoggedIn || isExpired) {
      apiService.clearAuthToken();
      navigate("/login");
      return;
    }
    async function fetchTransactions() {
      setLoading(true);
      setError("");
      try {
        const data = await apiService.getTransactions();
        setTransactions(data);
      } catch (err) {
        if (err.status === 401) {
          apiService.clearAuthToken();
          navigate("/login");
          return;
        }
        setError(err.message || "Không thể tải giao dịch");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [navigate]);

  const openPaymentModal = (transaction) => {
    setPaymentTransaction(transaction);
    setAmountInput(transaction.totalAmount - transaction.paidAmount);
    setShowModal(true);
  };

  const handleConfirmPayment = async () => {
    setPayingId(paymentTransaction.transactionId);
    setError("");
    try {
      const data = await apiService.createPayment({
        transactionId: paymentTransaction.transactionId,
        amount: Number(amountInput),
      });
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError("Không nhận được link thanh toán.");
      }
    } catch (err) {
      setError("Thanh toán thất bại.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <>
      <Header />
      <div className="order-payment-page">
        {/* Thông báo trạng thái thanh toán */}
        {paymentStatus && (
          <div
            style={{
              background: paymentStatus === "success" ? "#e6ffe6" : "#ffe6e6",
              color: paymentStatus === "success" ? "#2e7d32" : "#c62828",
              border: paymentStatus === "success" ? "1px solid #b2dfdb" : "1px solid #ffcdd2",
              borderRadius: "8px",
              padding: "14px",
              marginBottom: "18px",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "17px",
              whiteSpace: "pre-line"
            }}
          >
            {paymentMessage}
          </div>
        )}

        <h2>Giao dịch cần thanh toán</h2>
        {loading && <div>Đang tải...</div>}
        {error && <div className="error">{error}</div>}
        {!loading &&
          !error &&
          (transactions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                margin: "32px 0",
                fontSize: "18px",
                color: "#888",
              }}
            >
              Không có giao dịch nào để thanh toán.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Mã giao dịch</th>
                  <th>Ngày tạo</th>
                  <th>Ngày hết hạn</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Đã trả</th>
                  <th>Còn phải trả</th>
                  <th>Thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tran) => (
                  <tr key={tran.transactionId}>
                    <td>{tran.transactionId}</td>
                    <td>{new Date(tran.createdAt).toLocaleString()}</td>
                    <td>{new Date(tran.expiredAt).toLocaleString()}</td>
                    <td>{tran.status}</td>
                    <td>{tran.totalAmount?.toLocaleString()} đ</td>
                    <td>{tran.paidAmount?.toLocaleString()} đ</td>
                    <td>
                      {(tran.totalAmount - tran.paidAmount)?.toLocaleString()} đ
                    </td>
                    <td>
                      {["PENDING", "PARTIALLY_PAID"].includes(tran.status) &&
                      tran.totalAmount - tran.paidAmount > 0 ? (
                        <button
                          className="pay-btn"
                          onClick={() => openPaymentModal(tran)}
                          disabled={payingId === tran.transactionId}
                        >
                          Thanh toán
                        </button>
                      ) : (
                        <span className="paid-info">Đã thanh toán</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}

        {/* Modal nhập số tiền */}
        {showModal && paymentTransaction && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h3>Nhập số tiền cần thanh toán</h3>
              <div style={{ marginBottom: 12 }}>
                <label>
                  Số tiền:
                  <input
                    type="number"
                    min="1"
                    max={
                      paymentTransaction.totalAmount -
                      paymentTransaction.paidAmount
                    }
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    style={{ marginLeft: 8, padding: 6, width: 180 }}
                  />
                  <span style={{ marginLeft: 8 }}>đ</span>
                </label>
              </div>
              <div style={{ marginTop: 18 }}>
                <button
                  className="pay-btn"
                  onClick={handleConfirmPayment}
                  disabled={payingId === paymentTransaction.transactionId}
                >
                  Xác nhận thanh toán
                </button>
                <button
                  className="pay-btn"
                  style={{ marginLeft: 12, background: "#eee", color: "#222" }}
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MyOrdersPayment;
