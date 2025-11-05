import React, { useEffect, useMemo, useState } from "react";
import apiService from "../services/apiService";
import "./ContractManagement.css";

const DEFAULT_TEMPLATE_ID = "2020443";

function ContractManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualOrders, setManualOrders] = useState([]);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualForm, setManualForm] = useState({
    orderId: "",
    buyerEmail: "",
    buyerName: "",
    sellerEmail: "",
    sellerName: "",
    content: "",
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [editingContacts, setEditingContacts] = useState(false);
  const [editedEmails, setEditedEmails] = useState({ buyerEmail: "", sellerEmail: "" });
  const [emailError, setEmailError] = useState("");
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState("");

  const hasSelection = useMemo(() => Boolean(selectedOrder), [selectedOrder]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "—";
    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numeric)) {
      return value;
    }
    return `${numeric.toLocaleString()}₫`;
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const date = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiService.getOrdersForAdmin();
      const list = Array.isArray(data)
        ? data.filter(item => {
            const status = item.status ? item.status.toUpperCase() : "";
            return status === "COMPLETED" || status === "PENDING";
          })
        : [];
      setOrders(list);
      if (selectedOrder) {
        const updated = list.find(item => item.orderId === selectedOrder.orderId);
        if (updated) {
          setSelectedOrder(prev => ({ ...updated, ...prev }));
          if (!editingContacts) {
            setEditedEmails({
              buyerEmail: updated.buyerEmail || "",
              sellerEmail: updated.sellerEmail || "",
            });
          }
        }
      }
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    setContractsLoading(true);
    setContractsError("");
    try {
      const data = await apiService.getContractsForAdmin();
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      setContractsError(err.message || "Không thể tải danh sách hợp đồng");
    } finally {
      setContractsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchContracts();
  };

  useEffect(() => {
    fetchOrders();
    fetchContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureContractDetails = async (order) => {
    if (order.contractId) {
      return order;
    }
    try {
      const contract = await apiService.getContractByOrder(order.orderId);
      if (contract) {
        const enriched = {
          ...order,
          contractId: contract.contractId,
          contractStatus: contract.status,
          sellerSigningUrl: contract.sellerSigningUrl,
          buyerSigningUrl: contract.buyerSigningUrl,
          signedFileUrl: contract.signedFileUrl,
        };
        setOrders(prev => prev.map(item => (item.orderId === order.orderId ? enriched : item)));
        return enriched;
      }
    } catch (err) {
      if (err?.status !== 404) {
        setFeedback(`Không thể tải thông tin hợp đồng: ${err.message || err}`);
      }
    }
    return order;
  };

  const handleSelectOrder = async (order) => {
    setFeedback("");
    const result = await ensureContractDetails(order);
    setSelectedOrder(result);
    setEditingContacts(false);
    setEditedEmails({
      buyerEmail: result.buyerEmail || "",
      sellerEmail: result.sellerEmail || "",
    });
    setEmailError("");
  };

  const validateEmails = (buyerEmail, sellerEmail) => {
    const buyer = buyerEmail.trim();
    const seller = sellerEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!buyer || !seller) {
      return "Vui lòng nhập đầy đủ email của người mua và người bán.";
    }
    if (!emailRegex.test(buyer)) {
      return "Email người mua không hợp lệ.";
    }
    if (!emailRegex.test(seller)) {
      return "Email người bán không hợp lệ.";
    }
    return "";
  };

  const startEditingContacts = () => {
    if (!selectedOrder) return;
    setEditingContacts(true);
    setEditedEmails({
      buyerEmail: selectedOrder.buyerEmail || "",
      sellerEmail: selectedOrder.sellerEmail || "",
    });
    setEmailError("");
  };

  const cancelEditingContacts = () => {
    setEditingContacts(false);
    setEditedEmails({
      buyerEmail: selectedOrder?.buyerEmail || "",
      sellerEmail: selectedOrder?.sellerEmail || "",
    });
    setEmailError("");
  };

  const handleSaveEmails = () => {
    if (!selectedOrder) return;
    const { buyerEmail, sellerEmail } = editedEmails;
    const errorText = validateEmails(buyerEmail, sellerEmail);
    if (errorText) {
      setEmailError(errorText);
      return;
    }
    const trimmedBuyer = buyerEmail.trim();
    const trimmedSeller = sellerEmail.trim();
    const updatedSelection = {
      ...selectedOrder,
      buyerEmail: trimmedBuyer,
      sellerEmail: trimmedSeller,
    };
    setSelectedOrder(updatedSelection);
    setOrders(prev => prev.map(item => (item.orderId === updatedSelection.orderId ? { ...item, buyerEmail: trimmedBuyer, sellerEmail: trimmedSeller } : item)));
    setEditingContacts(false);
    setEmailError("");
    setFeedback("Đã cập nhật email gửi hợp đồng.");
  };

  const handleEmailChange = (field, value) => {
    setEditedEmails(prev => ({ ...prev, [field]: value }));
  };

  const resetManualForm = () => {
    setManualForm({
      orderId: "",
      buyerEmail: "",
      buyerName: "",
      sellerEmail: "",
      sellerName: "",
      content: "",
    });
  };

  const getDefaultManualContent = (order) => {
    if (!order) return "";
    const suffix = order.listingTitle ? ` - ${order.listingTitle}` : "";
    return `Hợp đồng giao dịch #${order.orderId}${suffix}`;
  };

  const loadManualOrders = async () => {
    setManualLoading(true);
    setManualError("");
    try {
      const data = await apiService.getOrdersForAdmin();
      setManualOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setManualError(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setManualLoading(false);
    }
  };

  const openManualModal = () => {
    setManualOpen(true);
    setManualError("");
    setFeedback("");
    resetManualForm();
    loadManualOrders();
  };

  const closeManualModal = () => {
    setManualOpen(false);
    setManualSubmitting(false);
    setManualError("");
    resetManualForm();
  };

  const handleManualOrderSelect = (value) => {
    if (!value) {
      setManualForm(prev => ({ ...prev, orderId: "" }));
      setManualError("");
      return;
    }
    const order = manualOrders.find(item => String(item.orderId) === value);
    if (order) {
      const buyerEmail = order.buyerEmail || "";
      const sellerEmail = order.sellerEmail || "";
      setManualForm({
        orderId: value,
        buyerEmail,
        buyerName: order.buyerUsername || buyerEmail,
        sellerEmail,
        sellerName: order.sellerUsername || sellerEmail,
        content: getDefaultManualContent(order),
      });
      setManualError("");
    } else {
      setManualForm(prev => ({ ...prev, orderId: value }));
    }
  };

  const handleManualInputChange = (field, value) => {
    setManualForm(prev => ({ ...prev, [field]: value }));
    if (manualError) {
      setManualError("");
    }
  };

  const handleManualSubmit = async (event) => {
    event.preventDefault();
    if (manualSubmitting) {
      return;
    }
    const { orderId, buyerEmail, sellerEmail, buyerName, sellerName, content } = manualForm;
    if (!orderId) {
      setManualError("Vui lòng chọn đơn hàng");
      return;
    }
    const emailValidation = validateEmails(buyerEmail, sellerEmail);
    if (emailValidation) {
      setManualError(emailValidation);
      return;
    }

    const trimmedBuyerEmail = buyerEmail.trim();
    const trimmedSellerEmail = sellerEmail.trim();
    const trimmedBuyerName = (buyerName || "").trim() || trimmedBuyerEmail;
    const trimmedSellerName = (sellerName || "").trim() || trimmedSellerEmail;
    const trimmedContent = (content || "").trim();

    setManualSubmitting(true);
    setManualError("");
    try {
      const payload = {
        orderId: Number(orderId),
        templateId: DEFAULT_TEMPLATE_ID,
        sellerEmail: trimmedSellerEmail,
        sellerName: trimmedSellerName,
        buyerEmail: trimmedBuyerEmail,
        buyerName: trimmedBuyerName,
      };
      if (trimmedContent) {
        payload.content = trimmedContent;
      }
      const contract = await apiService.createContract(payload);
      const numericOrderId = Number(orderId);
      setFeedback(`Đã tạo hợp đồng cho đơn #${orderId}.`);
      setManualOrders(prev => prev.map(item => (
        item.orderId === numericOrderId
          ? {
              ...item,
              contractId: contract.contractId,
              contractStatus: contract.status,
              buyerEmail: trimmedBuyerEmail,
              sellerEmail: trimmedSellerEmail,
            }
          : item
      )));
      if (selectedOrder?.orderId === numericOrderId) {
        const updatedSelection = {
          ...selectedOrder,
          contractId: contract.contractId,
          contractStatus: contract.status,
          sellerSigningUrl: contract.sellerSigningUrl,
          buyerSigningUrl: contract.buyerSigningUrl,
          signedFileUrl: contract.signedFileUrl,
          buyerEmail: trimmedBuyerEmail,
          sellerEmail: trimmedSellerEmail,
        };
        setSelectedOrder(updatedSelection);
        setOrders(prev => prev.map(item => (item.orderId === numericOrderId ? updatedSelection : item)));
      } else {
        setOrders(prev => prev.map(item => (
          item.orderId === numericOrderId
            ? {
                ...item,
                contractId: contract.contractId,
                contractStatus: contract.status,
              }
            : item
        )));
      }
      closeManualModal();
  fetchOrders();
  fetchContracts();
    } catch (err) {
      setManualError(err.message || "Không thể tạo hợp đồng");
    } finally {
      setManualSubmitting(false);
    }
  };

  const handleCreateContract = async () => {
    if (!selectedOrder || creating) {
      return;
    }
    const buyerEmail = (editingContacts ? editedEmails.buyerEmail : selectedOrder.buyerEmail || "").trim();
    const sellerEmail = (editingContacts ? editedEmails.sellerEmail : selectedOrder.sellerEmail || "").trim();
    const errorText = validateEmails(buyerEmail, sellerEmail);
    if (errorText) {
      setEmailError(errorText);
      if (!editingContacts) {
        setEditingContacts(true);
        setEditedEmails({ buyerEmail, sellerEmail });
      }
      return;
    }
    setCreating(true);
    setFeedback("");
    setEmailError("");
    try {
      const payload = {
        orderId: selectedOrder.orderId,
        templateId: DEFAULT_TEMPLATE_ID,
        sellerEmail,
        sellerName: selectedOrder.sellerUsername || selectedOrder.sellerEmail,
        buyerEmail,
        buyerName: selectedOrder.buyerUsername || selectedOrder.buyerEmail,
      };
      const contract = await apiService.createContract(payload);
      const updatedSelection = {
        ...selectedOrder,
        contractId: contract.contractId,
        contractStatus: contract.status,
        sellerSigningUrl: contract.sellerSigningUrl,
        buyerSigningUrl: contract.buyerSigningUrl,
        signedFileUrl: contract.signedFileUrl,
        buyerEmail,
        sellerEmail,
      };
      setSelectedOrder(updatedSelection);
      setOrders(prev => prev.map(item => (item.orderId === updatedSelection.orderId ? updatedSelection : item)));
      setFeedback("Tạo hợp đồng thành công. Đường dẫn ký đã được tạo.");
      fetchContracts();
    } catch (err) {
      setFeedback(`Tạo hợp đồng thất bại: ${err.message || err}`);
    } finally {
      setCreating(false);
    }
  };

  const renderStatusBadge = (status) => {
    if (!status) return "—";
    const normalized = status.toUpperCase();
    switch (normalized) {
      case "SIGNED_BOTH":
      case "SIGNED":
        return "Đã ký";
      case "SIGNED_SELLER":
        return "Người bán đã ký";
      case "SIGNED_BUYER":
        return "Người mua đã ký";
      case "PENDING_BOTH":
      case "PENDING":
        return "Đang chờ";
      case "DECLINED":
        return "Từ chối";
      default:
        return status;
    }
  };

  const renderOrderStatus = (status) => {
    if (!status) return "—";
    switch (status.toUpperCase()) {
      case "PENDING":
        return "Đang chờ";
      case "PROCESSING":
        return "Đang xử lý";
      case "COMPLETED":
        return "Hoàn tất";
      case "CANCELLED":
      case "CANCELED":
        return "Đã hủy";
      case "FAILED":
        return "Thất bại";
      default:
        return status;
    }
  };

  const renderStatusPill = (status, emptyLabel = "—") => {
    if (!status) {
      return <span className="status-pill status-default">{emptyLabel}</span>;
    }
    const normalized = status.toUpperCase();
    let tone = "pending";
    if (normalized.includes("DECLINED") || normalized.includes("REJECT")) {
      tone = "declined";
    } else if (normalized.includes("SIGNED") || normalized.includes("COMPLETED")) {
      tone = "signed";
    }
    return (
      <span className={`status-pill status-${tone}`}>
        {renderStatusBadge(status)}
      </span>
    );
  };

  const renderParticipantStatus = (status) => renderStatusPill(status, "Chưa gửi");

  return (
    <div className="contract-management">
      <div className="contract-management-header">
        <h1>Quản lý hợp đồng</h1>
        <div className="contract-header-actions">
          <button className="contract-refresh-btn" onClick={handleRefresh} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
          <button className="contract-manual-btn" type="button" onClick={openManualModal}>
            Tạo hợp đồng thủ công
          </button>
        </div>
      </div>
      {error && <div className="contract-message error">{error}</div>}
      {feedback && <div className="contract-message info">{feedback}</div>}
      <div className="contract-content">
        <div className="contract-orders-panel">
          <h2>Đơn hàng đang chờ / đã hoàn tất</h2>
          <div className="contract-table-wrapper">
            <table className="admin-table contract-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Ngày tạo</th>
                  <th>Tổng tiền</th>
                  <th>Người mua</th>
                  <th>Người bán</th>
                  <th>Trạng thái đơn</th>
                  <th>Hợp đồng</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      {loading ? "Đang tải dữ liệu..." : "Không có đơn hàng phù hợp."}
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr
                      key={order.orderId}
                      className={selectedOrder?.orderId === order.orderId ? "selected" : ""}
                      onClick={() => handleSelectOrder(order)}
                    >
                      <td>#{order.orderId}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>{order.buyerUsername ? `${order.buyerUsername} (#${order.buyerId})` : order.buyerId}</td>
                      <td>{order.sellerUsername ? `${order.sellerUsername} (#${order.sellerId})` : order.sellerId}</td>
                      <td>{renderOrderStatus(order.status)}</td>
                      <td>{renderStatusBadge(order.contractStatus)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="contract-detail-panel">
          <h2>Chi tiết hợp đồng</h2>
          {!hasSelection ? (
            <div className="contract-placeholder">Chọn một đơn hàng để xem chi tiết.</div>
          ) : (
            <div className="contract-detail-card">
              <div className="detail-row">
                <span>Mã đơn:</span>
                <strong>#{selectedOrder.orderId}</strong>
              </div>
              <div className="detail-row">
                <span>Ngày tạo:</span>
                <strong>{formatDateTime(selectedOrder.createdAt)}</strong>
              </div>
              <div className="detail-row">
                <span>Tổng tiền:</span>
                <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
              </div>
              <div className="detail-section">
                <h3>Người mua</h3>
                <p>ID: {selectedOrder.buyerId}</p>
                <p>Tên đăng nhập: {selectedOrder.buyerUsername || "—"}</p>
                <p>Email hệ thống: {selectedOrder.buyerEmail || "—"}</p>
              </div>
              <div className="detail-section">
                <h3>Người bán</h3>
                <p>ID: {selectedOrder.sellerId}</p>
                <p>Tên đăng nhập: {selectedOrder.sellerUsername || "—"}</p>
                <p>Email hệ thống: {selectedOrder.sellerEmail || "—"}</p>
              </div>
              <div className="detail-section">
                <div className="detail-section-header">
                  <h3>Email gửi hợp đồng</h3>
                  {!editingContacts ? (
                    <button className="detail-small-btn" onClick={startEditingContacts}>Chỉnh sửa</button>
                  ) : (
                    <div className="detail-section-actions">
                      <button className="detail-small-btn primary" onClick={handleSaveEmails}>Lưu</button>
                      <button className="detail-small-btn ghost" onClick={cancelEditingContacts}>Hủy</button>
                    </div>
                  )}
                </div>
                <div className="detail-row editable">
                  <span>Người mua:</span>
                  {editingContacts ? (
                    <input
                      className="detail-email-input"
                      type="email"
                      value={editedEmails.buyerEmail}
                      onChange={e => handleEmailChange("buyerEmail", e.target.value)}
                      placeholder="Nhập email người mua"
                    />
                  ) : (
                    <strong>{editedEmails.buyerEmail || "—"}</strong>
                  )}
                </div>
                <div className="detail-row editable">
                  <span>Người bán:</span>
                  {editingContacts ? (
                    <input
                      className="detail-email-input"
                      type="email"
                      value={editedEmails.sellerEmail}
                      onChange={e => handleEmailChange("sellerEmail", e.target.value)}
                      placeholder="Nhập email người bán"
                    />
                  ) : (
                    <strong>{editedEmails.sellerEmail || "—"}</strong>
                  )}
                </div>
                {emailError && <div className="detail-inline-error">{emailError}</div>}
              </div>
              <div className="detail-section">
                <h3>Hợp đồng</h3>
                <p>Trạng thái: {renderStatusBadge(selectedOrder.contractStatus)}</p>
                {selectedOrder.sellerSigningUrl && (
                  <p>
                    Link người bán: {" "}
                    <a href={selectedOrder.sellerSigningUrl} target="_blank" rel="noreferrer">
                      Mở
                    </a>
                  </p>
                )}
                {selectedOrder.buyerSigningUrl && (
                  <p>
                    Link người mua: {" "}
                    <a href={selectedOrder.buyerSigningUrl} target="_blank" rel="noreferrer">
                      Mở
                    </a>
                  </p>
                )}
                {selectedOrder.signedFileUrl && (
                  <p>
                    Tệp đã ký: {" "}
                    <a href={selectedOrder.signedFileUrl} target="_blank" rel="noreferrer">
                      Tải xuống
                    </a>
                  </p>
                )}
              </div>
              <div className="detail-actions">
                <button
                  className="contract-create-btn"
                  onClick={handleCreateContract}
                  disabled={creating || Boolean(selectedOrder.contractId)}
                >
                  {selectedOrder.contractId ? "Đã tạo hợp đồng" : creating ? "Đang tạo..." : "Tạo hợp đồng"}
                </button>
              </div>
              <div className="detail-hint">
                Template ID mặc định: <code>{DEFAULT_TEMPLATE_ID}</code>
              </div>
            </div>
          )}
        </div>
        <div className="contract-history-panel">
          <div className="contract-history-header">
            <h2>Hợp đồng đã tạo</h2>
            <span className="contract-history-count">{contractsLoading ? "…" : contracts.length}</span>
          </div>
          {contractsError && <div className="contract-message error">{contractsError}</div>}
          <div className="contract-table-wrapper contract-history-table-wrapper">
            <table className="admin-table contract-history-table">
              <thead>
                <tr>
                  <th>Hợp đồng</th>
                  <th>Đơn hàng</th>
                  <th>Cập nhật</th>
                  <th>Trạng thái</th>
                  <th>Người bán</th>
                  <th>Người mua</th>
                  <th>Tệp</th>
                </tr>
              </thead>
              <tbody>
                {contractsLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>Đang tải danh sách hợp đồng...</td>
                  </tr>
                ) : contracts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>Chưa có hợp đồng nào.</td>
                  </tr>
                ) : (
                  contracts.map(contract => {
                    const key = contract.contractId ?? `order-${contract.orderId}`;
                    return (
                      <tr key={key}>
                        <td>{contract.contractId ? `#${contract.contractId}` : "—"}</td>
                        <td>{contract.orderId ? `#${contract.orderId}` : "—"}</td>
                        <td>{formatDateTime(contract.updateAt || contract.signedAt)}</td>
                        <td>{renderStatusPill(contract.status, "Chưa tạo")}</td>
                        <td>
                          <div className="history-party">
                            <span className="history-party-name">{contract.sellerName || contract.sellerEmail || "—"}</span>
                            <span className="history-party-email">{contract.sellerEmail || "—"}</span>
                            {renderParticipantStatus(contract.sellerStatus)}
                          </div>
                        </td>
                        <td>
                          <div className="history-party">
                            <span className="history-party-name">{contract.buyerName || contract.buyerEmail || "—"}</span>
                            <span className="history-party-email">{contract.buyerEmail || "—"}</span>
                            {renderParticipantStatus(contract.buyerStatus)}
                          </div>
                        </td>
                        <td>
                          {contract.signedFileUrl ? (
                            <a href={contract.signedFileUrl} target="_blank" rel="noreferrer">
                              Tải xuống
                            </a>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {manualOpen && (
        <div className="contract-manual-overlay">
          <div className="contract-manual-modal">
            <div className="manual-modal-header">
              <h2>Tạo hợp đồng thủ công</h2>
              <button
                type="button"
                className="detail-small-btn ghost"
                onClick={closeManualModal}
              >
                Đóng
              </button>
            </div>
            {manualError && <div className="contract-message error">{manualError}</div>}
            <form className="manual-form" onSubmit={handleManualSubmit}>
              <label htmlFor="manual-order">Chọn đơn hàng</label>
              <select
                id="manual-order"
                className="manual-select"
                value={manualForm.orderId}
                onChange={e => handleManualOrderSelect(e.target.value)}
                disabled={manualLoading}
              >
                <option value="">-- Chọn đơn hàng --</option>
                {manualOrders.map(order => (
                  <option key={order.orderId} value={order.orderId}>
                    #{order.orderId} • {renderOrderStatus(order.status)} • {(order.buyerUsername || order.buyerEmail || `Buyer #${order.buyerId || "?"}`)} → {(order.sellerUsername || order.sellerEmail || `Seller #${order.sellerId || "?"}`)}
                  </option>
                ))}
              </select>
              {manualLoading && <div className="manual-inline-info">Đang tải danh sách đơn hàng...</div>}
              {!manualLoading && manualOrders.length === 0 && (
                <div className="manual-inline-info">Không có đơn hàng khả dụng.</div>
              )}

              <label htmlFor="manual-buyer-name">Tên người mua</label>
              <input
                id="manual-buyer-name"
                className="manual-input"
                type="text"
                value={manualForm.buyerName}
                onChange={e => handleManualInputChange("buyerName", e.target.value)}
                placeholder="Nhập tên người mua"
              />

              <label htmlFor="manual-buyer-email">Email người mua</label>
              <input
                id="manual-buyer-email"
                className="manual-input"
                type="email"
                value={manualForm.buyerEmail}
                onChange={e => handleManualInputChange("buyerEmail", e.target.value)}
                placeholder="Nhập email người mua"
              />

              <label htmlFor="manual-seller-name">Tên người bán</label>
              <input
                id="manual-seller-name"
                className="manual-input"
                type="text"
                value={manualForm.sellerName}
                onChange={e => handleManualInputChange("sellerName", e.target.value)}
                placeholder="Nhập tên người bán"
              />

              <label htmlFor="manual-seller-email">Email người bán</label>
              <input
                id="manual-seller-email"
                className="manual-input"
                type="email"
                value={manualForm.sellerEmail}
                onChange={e => handleManualInputChange("sellerEmail", e.target.value)}
                placeholder="Nhập email người bán"
              />

              <label htmlFor="manual-content">Nội dung thông báo (tùy chọn)</label>
              <textarea
                id="manual-content"
                className="manual-textarea"
                rows="4"
                value={manualForm.content}
                onChange={e => handleManualInputChange("content", e.target.value)}
                placeholder="Nhập nội dung gửi kèm (nếu có)"
              />

              <div className="manual-actions">
                <button
                  type="button"
                  className="manual-btn ghost"
                  onClick={closeManualModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="manual-btn primary"
                  disabled={manualSubmitting || manualLoading || !manualForm.orderId}
                >
                  {manualSubmitting ? "Đang tạo..." : "Tạo hợp đồng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractManagement;
