import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";
import { useToast } from "../contexts/ToastContext";
import "./SystemConfigPage.css";

function SystemConfigPage() {
  const [configs, setConfigs] = useState({
    EXTEND_PRICE_PER_DAY: "",
    FREE_LISTING_DAYS: "",
    COMMISSION_RATE: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { showToast } = useToast();

  // Lấy tất cả config từ backend
  useEffect(() => {
    setLoading(true);
    setError("");
    setSuccess("");
    apiService
      .getSystemConfigs([
        "EXTEND_PRICE_PER_DAY",
        "FREE_LISTING_DAYS",
        "COMMISSION_RATE",
      ])
      .then((data) => {
        setConfigs({
          EXTEND_PRICE_PER_DAY: data.EXTEND_PRICE_PER_DAY ?? "5000",
          FREE_LISTING_DAYS: data.FREE_LISTING_DAYS ?? "14",
          COMMISSION_RATE: data.COMMISSION_RATE ?? "0.05",
        });
      })
      .catch((err) => {
        setError(err?.message || "Không thể tải cấu hình hệ thống.");
        showToast(err?.message || "Không thể tải cấu hình hệ thống.", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  // Xử lý lưu cấu hình
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiService.updateSystemConfigs({
        EXTEND_PRICE_PER_DAY: String(configs.EXTEND_PRICE_PER_DAY),
        FREE_LISTING_DAYS: String(configs.FREE_LISTING_DAYS),
        COMMISSION_RATE: String(configs.COMMISSION_RATE),
      });
      setSuccess("Cập nhật cấu hình thành công!");
      showToast("Cập nhật cấu hình thành công!", "success");
    } catch (err) {
      setError(err?.message || "Không thể cập nhật cấu hình.");
      showToast(err?.message || "Không thể cập nhật cấu hình.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="system-config-section">
      <h2>Cấu hình hệ thống</h2>
      {loading ? (
        <div className="admin-dashboard-hint">Đang tải cấu hình...</div>
      ) : (
        <div className="system-config-card">
          <label>Giá gia hạn mỗi ngày (VND)</label>
          <input
            type="number"
            min={1000}
            step={500}
            value={configs.EXTEND_PRICE_PER_DAY}
            onChange={(e) =>
              setConfigs((prev) => ({
                ...prev,
                EXTEND_PRICE_PER_DAY: e.target.value,
              }))
            }
          />
          <label>Số ngày đăng miễn phí</label>
          <input
            type="number"
            min={1}
            step={1}
            value={configs.FREE_LISTING_DAYS}
            onChange={(e) =>
              setConfigs((prev) => ({
                ...prev,
                FREE_LISTING_DAYS: e.target.value,
              }))
            }
          />
          <label>Tỷ lệ hoa hồng nền tảng (%)</label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={configs.COMMISSION_RATE}
            onChange={(e) =>
              setConfigs((prev) => ({
                ...prev,
                COMMISSION_RATE: e.target.value,
              }))
            }
          />
          <small className="system-config-hint">
            Giá mặc định là 5.000 VND/ngày, 14 ngày miễn phí, hoa hồng 5% nếu chưa cấu hình.
          </small>
          <div className="system-config-actions">
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>
          {success && (
            <div className="system-config-success">
              {success}
            </div>
          )}
          {error && (
            <div className="system-config-error">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SystemConfigPage;