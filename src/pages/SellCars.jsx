import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./SellCars.css";
import API_ENDPOINTS from "../services/apiService";

function SellCars() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "car",
    brand: "",
    model: "",
    year: "",
    price: "",
    condition: "",
    battery: "",
    location: "",
    phone: "",
    description: "",
    imagesPreview: [],
    color: "",
    images: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // get current user id from localStorage (set by login)
  const currentUserId = (() => {
    const id =
      localStorage.getItem("userID") || localStorage.getItem("userId") || null;
    return id ? Number(id) : null;
  })();

  useEffect(() => {
    // revoke object URLs when component unmounts
    return () => {
      formData.imagesPreview.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cloudinary config (provided)
  const CLOUDINARY_CLOUD_NAME = "dy0wv3u6y";
  const CLOUDINARY_UPLOAD_PRESET = "react_unsigned_preset";
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

  const uploadToCloudinary = async (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) throw new Error("File quá lớn (max 5MB)");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error("Upload thất bại: " + txt);
    }
    const json = await res.json();
    return json.secure_url || json.url;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // limit number of images
    const maxImages = 10;
    const existing = formData.images.length;
    const remaining = Math.max(0, maxImages - existing);
    const toProcess = files.slice(0, remaining);

    // create previews immediately
    const newPreviews = toProcess.map((f) => URL.createObjectURL(f));
    setFormData((prev) => ({
      ...prev,
      imagesPreview: [...prev.imagesPreview, ...newPreviews],
    }));

    try {
      const uploadedUrls = await Promise.all(
        toProcess.map((f) => uploadToCloudinary(f))
      );
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (err) {
      console.error("Cloudinary upload error", err);
      setError(err.message || "Lỗi khi upload ảnh");
      // revoke previews for failed ones
      newPreviews.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      setFormData((prev) => ({
        ...prev,
        imagesPreview: prev.imagesPreview.slice(
          0,
          Math.max(0, prev.imagesPreview.length - newPreviews.length)
        ),
      }));
    }
  };

  const removeImage = (index) => {
    const preview = formData.imagesPreview[index];
    try {
      URL.revokeObjectURL(preview);
    } catch {}
    setFormData((prev) => {
      const nextPreviews = prev.imagesPreview.filter((_, i) => i !== index);
      const nextUrls = (prev.images || []).filter((_, i) => i !== index);
      return { ...prev, imagesPreview: nextPreviews, images: nextUrls };
    });
  };

  const validate = () => {
    // basic validation
    if (!currentUserId) {
      setError("Bạn cần đăng nhập để đăng tin.");
      return false;
    }
    if (!formData.brand) {
      setError("Vui lòng chọn hãng.");
      return false;
    }
    if (!formData.model) {
      setError("Vui lòng nhập model.");
      return false;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError("Giá phải lớn hơn 0.");
      return false;
    }
    if (!formData.description) {
      setError("Vui lòng nhập mô tả.");
      return false;
    }
    if (!formData.location) {
      setError("Vui lòng nhập địa chỉ.");
      return false;
    }
    if (!formData.phone) {
      setError("Vui lòng nhập số điện thoại.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      const BRAND_MAP = {
        VinFast: 1,
        BYD: 2,
        CARL: 3,
        Hyundai: 4,
        Popa: 5,
        Tesla: 6,
        CATL: 7,
        Other: null,
      };

      const brandId = BRAND_MAP[formData.brand];
      const categoryId = formData.category === "car" ? 1 : 2;

      // Prepare the listing payload according to the API structure
      const listingPayload = {
        title: `${formData.brand} ${formData.model}`,
        description: formData.description,
        price: Number(formData.price),
        categoryId: categoryId,
        brandId: brandId,

        // Vehicle info if category is car
        ...(formData.category === "car"
          ? {
              vehicle: {
                model: formData.model,
                color: formData.color || "Not specified",
                year: Number(formData.year) || new Date().getFullYear(),
                price: Number(formData.price),
                condition: formData.battery || "Used",
              },
            }
          : {
              // Battery info if category is battery
              battery: {
                capacity: Number(formData.battery) || 100,
                voltage: 48,
                cycleCount: 0,
                price: Number(formData.price),
                condition: formData.condition || "Used",
              },
            }),

        // Image handling according to API structure
        imageURLs: formData.images,
        primaryImageIndex: 0, // First image is primary
      };

      console.debug("Sending listing payload:", listingPayload);

      const resp = await fetch(API_ENDPOINTS.create_product_post, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listingPayload),
      });

      let respBody;
      try {
        respBody = await resp.clone().json();
        console.debug("Server response:", resp.status, respBody);
      } catch (err) {
        respBody = await resp.clone().text();
        console.debug("Server response (text):", resp.status, respBody);
      }

      if (!resp.ok) {
        throw new Error(
          typeof respBody === "object"
            ? JSON.stringify(respBody)
            : respBody || `Error ${resp.status}`
        );
      }

      alert(
        "Đăng tin thành công. Tin sẽ ở trạng thái PENDING chờ admin duyệt."
      );
      navigate("/buy");
    } catch (err) {
      console.error("Create listing error:", err);
      setError(err.message || "Lỗi khi tạo bài đăng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="sell-cars-page">
        <div className="container-fluid">
          <div className="sell-cars-content">
            <main className="sell-form-section">
              <div className="form-header">
                <h2>Đăng tin bán sản phẩm</h2>
                <p>
                  Điền đầy đủ thông tin để tin đăng của bạn được duyệt nhanh hơn
                </p>
              </div>

              <form onSubmit={handleSubmit} className="sell-form">
                <div className="form-group">
                  <label className="form-label required">Loại sản phẩm</label>
                  <div className="category-options">
                    <label className="category-option">
                      <input
                        type="radio"
                        name="category"
                        value="car"
                        checked={formData.category === "car"}
                        onChange={handleChange}
                      />
                      <span>🚗 Xe điện</span>
                    </label>
                    <label className="category-option">
                      <input
                        type="radio"
                        name="category"
                        value="battery"
                        checked={formData.category === "battery"}
                        onChange={handleChange}
                      />
                      <span>🔋 Pin sạc</span>
                    </label>
                  </div>
                </div>

                {formData.category === "car" ? (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">Hãng xe</label>
                        <select
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                          required
                          className="form-control"
                        >
                          <option value="">Chọn hãng xe</option>
                          <option value="VinFast">VinFast</option>
                          <option value="BYD">BYD</option>
                          <option value="Hyundai">Hyundai</option>
                          <option value="Tesla">Tesla</option>
                          <option value="Other">Khác</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label required">Dòng xe</label>
                        <input
                          type="text"
                          name="model"
                          value={formData.model}
                          onChange={handleChange}
                          placeholder="VD: VF8, Model 3"
                          required
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">
                          Năm sản xuất
                        </label>
                        <input
                          type="number"
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          placeholder="VD: 2023"
                          min="2015"
                          max={new Date().getFullYear()}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Màu sắc</label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          placeholder="VD: Trắng"
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tình trạng pin</label>
                      <input
                        type="text"
                        name="battery"
                        value={formData.battery}
                        onChange={handleChange}
                        placeholder="VD: Pin còn 95%"
                        className="form-control"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">Loại pin</label>
                        <input
                          type="text"
                          name="model"
                          value={formData.model}
                          onChange={handleChange}
                          placeholder="VD: Lithium-ion 48V 100Ah"
                          required
                          className="form-control"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label required">
                          Hãng sản xuất
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                          placeholder="VD: CATL"
                          required
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Tình trạng</label>
                      <input
                        type="text"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        placeholder="VD: Còn 90% dung lượng"
                        required
                        className="form-control"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label required">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="VD: 500000000"
                    required
                    min="0"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Mô tả chi tiết</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả..."
                    required
                    rows="6"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">
                    Hình ảnh sản phẩm
                  </label>
                  <div className="image-upload-section">
                    <label className="image-upload-btn">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                      <span>📷 Chọn ảnh</span>
                    </label>
                    <p className="upload-hint">
                      Tối đa 10 ảnh, mỗi ảnh không quá 5MB — upload trực tiếp
                      lên Cloudinary
                    </p>
                  </div>

                  {formData.imagesPreview.length > 0 && (
                    <div className="image-preview-grid">
                      {formData.imagesPreview.map((img, index) => (
                        <div key={index} className="image-preview">
                          <img src={img} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-section-title">Thông tin liên hệ</div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Địa chỉ</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="VD: TP. Hồ Chí Minh"
                      required
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="VD: 0901234567"
                      required
                      pattern="[0-9]{10}"
                      className="form-control"
                    />
                  </div>
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => navigate("/")}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? "Đang gửi..." : "Đăng tin"}
                  </button>
                </div>
              </form>
            </main>

            <aside className="tips-sidebar">
              <div className="tips-card">
                <h3>💡 Mẹo đăng tin hiệu quả</h3>
                <ul className="tips-list">
                  <li>Chụp ảnh rõ nét, đầy đủ các góc của sản phẩm</li>
                  <li>Mô tả chi tiết, trung thực về tình trạng</li>
                  <li>Ghi rõ lý do bán và lịch sử bảo dưỡng</li>
                  <li>Đặt giá hợp lý với thị trường</li>
                  <li>Cung cấp đầy đủ thông tin liên hệ</li>
                </ul>
              </div>

              <div className="tips-card">
                <h3>⚠️ Lưu ý</h3>
                <ul className="tips-list">
                  <li>Không đăng tin trùng lặp</li>
                  <li>Không sử dụng ảnh mạng</li>
                  <li>Không gian lận về thông tin sản phẩm</li>
                  <li>Tuân thủ quy định về giá cả</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

export default SellCars;
