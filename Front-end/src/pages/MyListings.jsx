import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import apiService from "../services/apiService";
import Modal from "react-modal";
import "./MyListings.css";

Modal.setAppElement("#root");

// Trạng thái ưu tiên sắp xếp
const STATUS_ORDER = [
  "ACTIVE",
  "SOLD",
  "PROCESSING",
  "PENDING",
  "FLAGGED",
  "REJECTED",
];

const STATUS_LABELS = {
  ACTIVE: "Đang bán",
  SOLD: "Đã bán",
  PROCESSING: "Đang thanh toán",
  PENDING: "Đang chờ duyệt",
  FLAGGED: "Bị flagged",
  REJECTED: "Bị từ chối",
};

const normalizeStatus = (status) => String(status || "").trim().toUpperCase();
const isEditableStatus = (status) => {
  const normalized = normalizeStatus(status);
  return normalized.includes("FLAG") || normalized.includes("REJECT");
};

const FILTER_MAP = {
  ALL: () => true,
  PAYING: (status) =>
    ["PENDING", "PROCESSING", "PARTIALLY_PAID"].includes(normalizeStatus(status)),
  ACTIVE: (status) => normalizeStatus(status) === "ACTIVE",
  SOLD: (status) => normalizeStatus(status) === "SOLD",
  FLAGGED: (status) => isEditableStatus(status),
};

function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState("");
  const [editingListing, setEditingListing] = useState(false);
  const [listingForm, setListingForm] = useState(null);
  const [listingImages, setListingImages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [existingListingImages, setExistingListingImages] = useState([]);
  const [listingPrimaryIndex, setListingPrimaryIndex] = useState(0);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [zoomImage, setZoomImage] = useState(null);

  // Mở rộng bài đăng
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDays, setExtendDays] = useState(1);
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendFeedback, setExtendFeedback] = useState("");
  const [extendConfig, setExtendConfig] = useState({ pricePerDay: 0, maxDays: 30 });

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await apiService.getUserListings();
        setListings(Array.isArray(data) ? data : (Array.isArray(data.content) ? data.content : []));
      } catch (err) {
        setListings([]);
      }
    }
    async function fetchMeta() {
      try {
        setBrands(await apiService.getBrands());
        setCategories(await apiService.getCategories());
        // Lấy config mở rộng từ BE (giả sử có API này)
        const config = await apiService.getExtendConfig();
        setExtendConfig(config || { pricePerDay: 10000, maxDays: 30 });
      } catch {}
    }
    fetchListings();
    fetchMeta();
  }, []);

  useEffect(() => {
    if (!listingImages || listingImages.length === 0) {
      setNewImagePreviews([]);
      return;
    }
    const previews = listingImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setNewImagePreviews(previews);
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [listingImages]);

  useEffect(() => {
    if (!selectedListing || !listingForm) return;

    if (!listingForm.brandId) {
      const brandName =
        selectedListing.brandName || selectedListing.brand?.brandName || "";
      if (brandName) {
        const matchedBrand = brands.find(
          (b) => b.brandName?.toLowerCase() === brandName.toLowerCase()
        );
        if (matchedBrand && matchedBrand.brandId !== listingForm.brandId) {
          setListingForm((prev) => ({ ...prev, brandId: matchedBrand.brandId }));
        }
      }
    }

    if (!listingForm.categoryId) {
      const categoryName =
        selectedListing.categoryName || selectedListing.category?.categoryName || "";
      if (categoryName) {
        const matchedCategory = categories.find(
          (c) => c.categoryName?.toLowerCase() === categoryName.toLowerCase()
        );
        if (matchedCategory && matchedCategory.categoryId !== listingForm.categoryId) {
          setListingForm((prev) => ({
            ...prev,
            categoryId: matchedCategory.categoryId,
          }));
        }
      }
    }
  }, [brands, categories, selectedListing, listingForm]);

  const handleListingImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setListingImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  // Sắp xếp theo trạng thái ưu tiên
  const sortedListings = useMemo(() => {
    const predicate = FILTER_MAP[filter] || FILTER_MAP.ALL;
    return [...listings]
      .filter((item) => predicate(item.status))
      .sort((a, b) => {
        const aStatus = STATUS_ORDER.indexOf(normalizeStatus(a.status));
        const bStatus = STATUS_ORDER.indexOf(normalizeStatus(b.status));
        return (aStatus === -1 ? 99 : aStatus) - (bStatus === -1 ? 99 : bStatus);
      });
  }, [filter, listings]);

  const handleShowListingDetail = (listing) => {
    if (!isEditableStatus(listing.status)) {
      setUpdateFeedback("Chỉ những bài đăng bị từ chối hoặc flagged mới được phép chỉnh sửa.");
      return;
    }
    setUpdateFeedback("");
    const product = listing.product || {};
    const hasVehicleProduct =
      listing.vehicle ||
      product.vehicleId ||
      product.vehicleID ||
      product.model ||
      product.color;
    const hasBatteryProduct =
      listing.battery ||
      product.batteryId ||
      product.batteryID ||
      product.capacity ||
      product.voltage;

    const type = hasVehicleProduct ? "vehicle" : hasBatteryProduct ? "battery" : "vehicle";
    const vehicleData = listing.vehicle || (hasVehicleProduct ? product : {});
    const batteryData = listing.battery || (hasBatteryProduct ? product : {});

    const normalizedImages =
      listing.images && listing.images.length > 0
        ? listing.images.map((img, idx) => ({
            id: img.id ?? idx,
            url: img.url || img.imageURL,
            isPrimary: img.isPrimary || false,
          }))
        : listing.primaryImageUrl
        ? [{ id: -1, url: listing.primaryImageUrl, isPrimary: true }]
        : [];

    const initialPrimary = normalizedImages.findIndex((img) => img.isPrimary);

    const resolvedBrandId =
      listing.brandId ||
      listing.brand?.brandId ||
      listing.brandID ||
      product.brandId ||
      "";
    const resolvedCategoryId =
      listing.categoryId ||
      listing.category?.categoryId ||
      listing.categoryID ||
      product.categoryId ||
      "";

    setSelectedListing(listing);
    setExistingListingImages(normalizedImages);
    setListingPrimaryIndex(initialPrimary >= 0 ? initialPrimary : 0);
    setListingImages([]);
    setListingForm({
      title: listing.title || "",
      description: listing.description || "",
      price: listing.price || "",
      brandId: resolvedBrandId,
      categoryId: resolvedCategoryId,
      type,
      model: vehicleData?.model || "",
      color: vehicleData?.color || "",
      year: vehicleData?.year || "",
      vehicleCondition: vehicleData?.condition || "",
      vehiclePrice: vehicleData?.price || listing.price || "",
      capacity: batteryData?.capacity || "",
      voltage: batteryData?.voltage || "",
      cycleCount: batteryData?.cycleCount || "",
      batteryCondition: batteryData?.condition || "",
      batteryPrice: batteryData?.price || listing.price || "",
      primaryImageIndex: initialPrimary >= 0 ? initialPrimary : 0,
    });
    setShowListingModal(true);
    setEditingListing(true);
    setUpdateFeedback("");
  };

  const handleListingFormChange = (e) => {
    const { name, value } = e.target;
    setListingForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "price"
        ? { vehiclePrice: value, batteryPrice: value }
        : {}),
    }));
  };

  const handleListingTypeChange = (e) => {
    const { value } = e.target;
    setListingForm((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handlePrimaryImageChange = (index) => {
    setListingPrimaryIndex(index);
  };

  const handleRemoveImage = (source, index) => {
    if (source === "existing") {
      setListingPrimaryIndex((prev) => {
        if (prev === index) return 0;
        if (prev > index) return prev - 1;
        return prev;
      });
      setExistingListingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const globalIndex = existingListingImages.length + index;
      setListingPrimaryIndex((prev) => {
        if (prev === globalIndex) return 0;
        if (prev > globalIndex) return prev - 1;
        return prev;
      });
      setListingImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateListing = async () => {
    if (!selectedListing || !listingForm) return;
    const existingUrls = existingListingImages.map((img) => img.url).filter(Boolean);
    if (existingUrls.length === 0 && listingImages.length === 0) {
      setUpdateFeedback("Vui lòng chọn ít nhất một hình ảnh.");
      return;
    }
    if (!listingForm.brandId || !listingForm.categoryId) {
      setUpdateFeedback("Vui lòng chọn đầy đủ hãng và danh mục.");
      return;
    }

    setUpdateLoading(true);
    setUpdateFeedback("");
    try {
      const hasNewImages = listingImages.length > 0;
      let primaryIndexPayload = listingPrimaryIndex;

      if (hasNewImages) {
        primaryIndexPayload =
          listingPrimaryIndex < existingUrls.length
            ? 0
            : listingPrimaryIndex - existingUrls.length;
      }

      const listingObj = {
        title: listingForm.title,
        description: listingForm.description,
        price: listingForm.price,
        brandId: Number(listingForm.brandId),
        categoryId: Number(listingForm.categoryId),
        primaryImageIndex: primaryIndexPayload,
      };

      if (!hasNewImages) {
        listingObj.imageURLs = existingUrls;
      }

      if (listingForm.type === "vehicle") {
        listingObj.vehicle = {
          model: listingForm.model,
          color: listingForm.color,
          year: listingForm.year,
          price: listingForm.price,
          condition: listingForm.vehicleCondition,
        };
      }

      if (listingForm.type === "battery") {
        listingObj.battery = {
          capacity: listingForm.capacity,
          voltage: listingForm.voltage,
          cycleCount: listingForm.cycleCount,
          price: listingForm.price,
          condition: listingForm.batteryCondition,
        };
      }

      await apiService.updateProductPost(
        selectedListing.listingID || selectedListing.id,
        listingObj,
        listingImages
      );

      setUpdateFeedback("Cập nhật bài đăng thành công.");
      const data = await apiService.getUserListings();
      setListings(
        Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : []
      );
      setEditingListing(false);
      setShowListingModal(false);
      setListingImages([]);
      setExistingListingImages([]);
      setListingPrimaryIndex(0);
      setListingForm(null);
      setSelectedListing(null);
    } catch (err) {
      setUpdateFeedback(err.message || "Cập nhật bài đăng thất bại.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Xử lý mở rộng bài đăng
  const handleOpenExtendModal = (listing) => {
    setSelectedListing(listing);
    setExtendDays(1);
    setExtendFeedback("");
    setShowExtendModal(true);
  };

  const handleExtendListing = async () => {
    setExtendLoading(true);
    setExtendFeedback("");
    try {
      await apiService.extendListing(selectedListing.listingID || selectedListing.id, extendDays);
      setExtendFeedback("Mở rộng bài đăng thành công!");
      setShowExtendModal(false);
      // Reload listings
      const data = await apiService.getUserListings();
      setListings(Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : []);
    } catch (err) {
      setExtendFeedback(err.message || "Mở rộng bài đăng thất bại.");
    } finally {
      setExtendLoading(false);
    }
  };

  // Xử lý zoom ảnh
  const handleZoomImage = (imgUrl) => {
    setZoomImage(imgUrl);
  };

  return (
    <div className="my-listings-page">
      <Header />
      <main className="profile-main profile-main-flex">
        <div className="profile-listings-card" style={{ width: "100%" }}>
          <div className="profile-listings-header">
            <h2>Quản lý bài đăng của bạn</h2>
            <div className="profile-listings-filter">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">Tất cả</option>
                <option value="PAYING">Đang thanh toán</option>
                <option value="ACTIVE">Đang bán</option>
                <option value="SOLD">Đã bán</option>
                <option value="FLAGGED">Bị từ chối/flagged</option>
              </select>
            </div>
          </div>
          <div className="profile-listings-list">
            {sortedListings.length === 0 ? (
              <div className="profile-listings-empty">Không có bài đăng phù hợp.</div>
            ) : (
              <table className="profile-listings-table">
                <thead>
                  <tr>
                    <th>Hình</th>
                    <th>Tiêu đề</th>
                    <th>Ngày tạo</th>
                    <th>Giá</th>
                    <th>Trạng thái</th>
                    <th>Ngày hết hạn</th>
                    <th>Lý do từ chối</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedListings.map((item) => {
                    const normalizedStatus = normalizeStatus(item.status);
                    const editable = isEditableStatus(normalizedStatus);
                    const thumbClass = `listing-thumb-large ${editable ? "editable" : "non-editable"}`;
                    const titleClass = `listing-title-link ${editable ? "editable" : "disabled"}`;
                    return (
                      <tr key={item.listingID || item.id}>
                        <td>
                          <img
                            src={item.primaryImageUrl || (item.images && item.images[0]?.url) || "/no-image.png"}
                            alt={item.title || "Hình bài đăng"}
                            className={thumbClass}
                            style={{ cursor: "zoom-in" }}
                            onClick={() => handleZoomImage(item.primaryImageUrl || (item.images && item.images[0]?.url))}
                          />
                        </td>
                        <td>
                          <span className={titleClass}>
                            {item.title || item.shortDescription || "—"}
                          </span>
                        </td>
                        <td>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td>
                          {item.price
                            ? item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                            : "—"}
                        </td>
                        <td>
                          <span className={`listing-status status-${normalizedStatus.toLowerCase()}`}>
                            {STATUS_LABELS[normalizedStatus] || item.status}
                          </span>
                        </td>
                        <td>
                          {item.expiryDate
                            ? new Date(item.expiryDate).toLocaleDateString("vi-VN")
                            : "—"}
                        </td>
                        <td>
                          {/* Hiển thị lý do từ chối nếu có */}
                          {item.rejectionReason || "—"}
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            style={{ marginRight: 8 }}
                            onClick={() => handleOpenExtendModal(item)}
                          >
                            Mở rộng
                          </button>
                          <button
                            className="btn-primary"
                            disabled={!editable}
                            onClick={() => editable && handleShowListingDetail(item)}
                          >
                            Chỉnh sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal xem chi tiết bài đăng */}
      <Modal
        isOpen={showListingModal}
        onRequestClose={() => setShowListingModal(false)}
        className="listing-detail-modal-wide"
        overlayClassName="listing-detail-modal-overlay"
      >
        {selectedListing && listingForm && (
          <div>
            <h2>Chỉnh sửa bài đăng</h2>
            <form
              className="listing-edit-form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateListing();
              }}
            >
              <div className="form-col">
                <div className="form-group">
                  <label>Tiêu đề</label>
                  <input
                    type="text"
                    name="title"
                    value={listingForm.title}
                    onChange={handleListingFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={listingForm.description}
                    onChange={handleListingFormChange}
                    required
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Giá</label>
                  <input
                    type="number"
                    name="price"
                    value={listingForm.price}
                    onChange={handleListingFormChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Hãng sản xuất</label>
                  <select
                    name="brandId"
                    value={listingForm.brandId || ""}
                    onChange={handleListingFormChange}
                    required
                  >
                    <option value="">Chọn hãng</option>
                    {brands.map((b) => (
                      <option key={b.brandId} value={b.brandId}>
                        {b.brandName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select
                    name="categoryId"
                    value={listingForm.categoryId || ""}
                    onChange={handleListingFormChange}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Loại sản phẩm</label>
                  <div className="form-radio-group">
                    <label className="form-radio-option">
                      <input
                        type="radio"
                        name="type"
                        value="vehicle"
                        checked={listingForm.type === "vehicle"}
                        onChange={handleListingTypeChange}
                      />
                      Xe điện
                    </label>
                    <label className="form-radio-option">
                      <input
                        type="radio"
                        name="type"
                        value="battery"
                        checked={listingForm.type === "battery"}
                        onChange={handleListingTypeChange}
                      />
                      Pin sạc
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-col">
                {listingForm.type === "vehicle" && (
                  <>
                    <div className="form-row-inline">
                      <div className="form-group">
                        <label>Dòng xe</label>
                        <input
                          type="text"
                          name="model"
                          value={listingForm.model || ""}
                          onChange={handleListingFormChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Màu xe</label>
                        <input
                          type="text"
                          name="color"
                          value={listingForm.color || ""}
                          onChange={handleListingFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row-inline">
                      <div className="form-group">
                        <label>Năm sản xuất</label>
                        <input
                          type="number"
                          name="year"
                          value={listingForm.year || ""}
                          onChange={handleListingFormChange}
                          required
                          min="2015"
                          max={new Date().getFullYear()}
                        />
                      </div>
                      <div className="form-group">
                        <label>Giá xe (VNĐ)</label>
                        <input
                          type="number"
                          name="vehiclePrice"
                          value={listingForm.price}
                          readOnly
                          className="read-only-input"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Tình trạng xe</label>
                      <input
                        type="text"
                        name="vehicleCondition"
                        value={listingForm.vehicleCondition || ""}
                        onChange={handleListingFormChange}
                        required
                      />
                    </div>
                  </>
                )}

                {listingForm.type === "battery" && (
                  <>
                    <div className="form-row-inline">
                      <div className="form-group">
                        <label>Dung lượng (kWh)</label>
                        <input
                          type="number"
                          name="capacity"
                          value={listingForm.capacity || ""}
                          onChange={handleListingFormChange}
                          required
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Điện áp (V)</label>
                        <input
                          type="number"
                          name="voltage"
                          value={listingForm.voltage || ""}
                          onChange={handleListingFormChange}
                          required
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="form-row-inline">
                      <div className="form-group">
                        <label>Số lần sạc</label>
                        <input
                          type="number"
                          name="cycleCount"
                          value={listingForm.cycleCount || ""}
                          onChange={handleListingFormChange}
                          required
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Giá pin (VNĐ)</label>
                        <input
                          type="number"
                          name="batteryPrice"
                          value={listingForm.price}
                          readOnly
                          className="read-only-input"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Tình trạng pin</label>
                      <input
                        type="text"
                        name="batteryCondition"
                        value={listingForm.batteryCondition || ""}
                        onChange={handleListingFormChange}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-group listing-image-section">
                  <label>Hình ảnh sản phẩm</label>
                  <div className="image-upload-section">
                    <label className="image-upload-btn">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleListingImageChange}
                        hidden
                      />
                      <span>📷 Chọn ảnh</span>
                    </label>
                    <p className="upload-hint">
                      Tối đa 10 ảnh, mỗi ảnh không quá 5MB
                    </p>
                  </div>
                  {(existingListingImages.length > 0 ||
                    newImagePreviews.length > 0) && (
                    <div className="image-preview-grid">
                      {[...existingListingImages.map((img, index) => ({
                        key: `existing-${img.id ?? index}`,
                        preview: img.url,
                        type: "existing",
                        sourceIndex: index,
                      })),
                      ...newImagePreviews.map((img, index) => ({
                        key: `new-${index}`,
                        preview: img.url,
                        type: "new",
                        sourceIndex: index,
                      }))].map((img, idx) => (
                        <div className="image-preview-with-radio" key={img.key}>
                          <div className="image-preview">
                            <img
                              src={img.preview}
                              alt={`Listing ${idx + 1}`}
                              style={{ cursor: "zoom-in" }}
                              onClick={() => handleZoomImage(img.preview)}
                            />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => handleRemoveImage(img.type, img.sourceIndex)}
                            >
                              ×
                            </button>
                          </div>
                          <div className="primary-radio-below">
                            <label>
                              <input
                                type="radio"
                                name="primaryImageUpdate"
                                checked={listingPrimaryIndex === idx}
                                onChange={() => handlePrimaryImageChange(idx)}
                              />
                              Ảnh chính
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions form-actions-wide">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowListingModal(false);
                    setEditingListing(false);
                    setSelectedListing(null);
                    setListingForm(null);
                    setListingImages([]);
                    setExistingListingImages([]);
                    setListingPrimaryIndex(0);
                    setNewImagePreviews([]);
                    setUpdateFeedback("");
                  }}
                  disabled={updateLoading}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={updateLoading}>
                  {updateLoading ? "Đang cập nhật..." : "Cập nhật bài đăng"}
                </button>
              </div>
            </form>
            {updateFeedback && (
              <div className={`update-feedback ${updateFeedback.includes("thất bại") ? "error" : "success"}`}>
                {updateFeedback}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal zoom ảnh */}
      {zoomImage && (
        <div className="pd-zoom-overlay" onClick={() => setZoomImage(null)}>
          <button className="pd-zoom-close" onClick={() => setZoomImage(null)}>&times;</button>
          <img
            src={zoomImage}
            alt="Zoomed"
            className="pd-zoomed-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal mở rộng bài đăng */}
      <Modal
        isOpen={showExtendModal}
        onRequestClose={() => setShowExtendModal(false)}
        className="listing-detail-modal-wide"
        overlayClassName="listing-detail-modal-overlay"
      >
        <div>
          <h2>Mở rộng bài đăng</h2>
          <div className="form-group">
            <label>Chọn số ngày muốn mở rộng (tối đa {extendConfig.maxDays} ngày):</label>
            <input
              type="number"
              min={1}
              max={extendConfig.maxDays}
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Giá tiền cần thanh toán:</label>
            <div style={{ fontWeight: "bold", fontSize: "18px", color: "#dc2626" }}>
              {(extendDays * extendConfig.pricePerDay).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
            </div>
          </div>
          <div className="form-actions form-actions-wide">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowExtendModal(false)}
              disabled={extendLoading}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleExtendListing}
              disabled={extendLoading}
            >
              {extendLoading ? "Đang xử lý..." : "Xác nhận mở rộng"}
            </button>
          </div>
          {extendFeedback && (
            <div className={`update-feedback ${extendFeedback.includes("thất bại") ? "error" : "success"}`}>
              {extendFeedback}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default MyListings;