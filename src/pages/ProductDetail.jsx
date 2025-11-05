import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import API_ENDPOINTS from '../services/apiService';
import defaultImage from '../assets/VinFast_VF5_Plus.jpg';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [mainImage, setMainImage] = useState(defaultImage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const url = API_ENDPOINTS.get_detail_product_post
          ? API_ENDPOINTS.get_detail_product_post(id)
          : `${API_ENDPOINTS?.API_BASE_URL || ''}/api/listings/${id}`;

        const res = await fetch(url, {
          headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }
        });

        const json = await (async () => { try { return await res.json(); } catch { return null; } })();
        const payload = json?.data ?? json?.content ?? json ?? null;

        if (!res.ok) {
          const code = payload?.code ?? payload?.data?.code;
          if (code === 403 || payload?.msg === 'permission error' || payload?.error === 'exceptions.UserAuthError') {
            localStorage.removeItem('authToken');
            navigate('/login');
            return;
          }
          throw new Error(payload?.message || 'Không thể tải chi tiết');
        }

        // choose images
        const images = Array.isArray(payload?.images) ? payload.images : [];
        const primary = payload?.primaryImageUrl || images.find((i) => i?.isPrimary || i?.is_primary || i?.primary)?.url;
        const display = primary || images[0]?.url || defaultImage;

        setItem({ ...payload, images, display });
        setMainImage(display);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải chi tiết');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line
  }, [id, token, navigate]);

  const fmtPrice = (v) => (v == null ? '—' : new Intl.NumberFormat('vi-VN').format(Number(v)) + ' đ');
  const fmtDate = (s) => (s ? new Date(s).toLocaleString('vi-VN') : '—');

  if (loading) return <div className="pd-loading">Đang tải...</div>;
  if (error) return <div className="pd-error">{error}</div>;
  if (!item) return <div className="pd-empty">Không tìm thấy sản phẩm</div>;

  const product = item.product ?? {};
  const seller = item.seller ?? {};

  // pick vehicle-like or battery-like info (show only relevant fields)
  const vehicleInfo = {
    model: product.model || product.vehicleModel || product.modelName,
    year: product.year || product.productionYear,
    color: product.color,
    odometer: product.odometer ?? product.km
  };
  const batteryInfo = {
    capacity: product.capacity ?? product.kWh ?? product.batteryCapacity,
    voltage: product.voltage,
    cycles: product.cycleCount ?? product.cycle_count
  };

  const isVehicle = Boolean(vehicleInfo.model || vehicleInfo.year || vehicleInfo.odometer);
  const isBattery = !isVehicle && Boolean(batteryInfo.capacity || batteryInfo.voltage);

  return (
    <>
      <Header />
      <div className="pd-wrapper">
        <div className="pd-toolbar">
          <button className="pd-back" onClick={() => navigate(-1)}>← Quay lại</button>
        </div>

        <div className="pd-card">
          <div className="pd-left">
            <img className="pd-main" src={mainImage || item.display || defaultImage} alt={item.title} />
            <div className="pd-thumbs">
              {(item.images && item.images.length ? item.images : [{ url: item.display }]).map((img, idx) => (
                <img
                  key={idx}
                  src={img?.url || defaultImage}
                  alt={`thumb-${idx}`}
                  className={`pd-thumb ${img?.url === mainImage ? 'active' : ''}`}
                  onClick={() => setMainImage(img?.url || defaultImage)}
                />
              ))}
            </div>
          </div>

          <div className="pd-right">
            <div className="pd-header">
              <h1 className="pd-title">{item.title || '—'}</h1>
              <div className="pd-badges">
                <span className="pd-badge category">{item.categoryName || '—'}</span>
                <span className="pd-badge brand">{item.brandName || '—'}</span>
                {/*<span className={`pd-badge status ${String(item.status || '').toLowerCase()}`}>{item.status || '—'}</span>*/}
              </div>
            </div>

            <div className="pd-price">{fmtPrice(item.price)}</div>

            <div className="pd-meta">
              <div>Đăng: {fmtDate(item.createdAt)}</div>
              <div>Hiệu lực: {fmtDate(item.startDate)} → {fmtDate(item.expiryDate)}</div>
            </div>

            <div className="pd-info">
              <h3>Thông số</h3>
              {isVehicle && (
                <ul className="pd-list">
                  {vehicleInfo.model && <li><strong>Model:</strong> {vehicleInfo.model}</li>}
                  {vehicleInfo.year && <li><strong>Năm:</strong> {vehicleInfo.year}</li>}
                  {vehicleInfo.color && <li><strong>Màu:</strong> {vehicleInfo.color}</li>}
                  {vehicleInfo.odometer && <li><strong>Odometer:</strong> {vehicleInfo.odometer} km</li>}
                </ul>
              )}

              {isBattery && (
                <ul className="pd-list">
                  {batteryInfo.capacity && <li><strong>Dung lượng:</strong> {batteryInfo.capacity} kWh</li>}
                  {batteryInfo.voltage && <li><strong>Điện áp:</strong> {batteryInfo.voltage} V</li>}
                  {batteryInfo.cycles && <li><strong>Số chu kỳ:</strong> {batteryInfo.cycles}</li>}
                </ul>
              )}

              {!isVehicle && !isBattery && <div className="pd-list">Không có thông số thêm.</div>}
            </div>

            <div className="pd-desc">
              <h3>Mô tả</h3>
              <p>{item.description || 'Không có mô tả.'}</p>
            </div>

            <div className="pd-seller">
              <h3>Người bán</h3>
              <div><strong>{seller.username || '—'}</strong></div>
              <div className="pd-seller-meta">{seller.email || '—'}</div>
              <div className="pd-actions">
                <button className="pd-contact">Liên hệ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;