import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import apiService from "../services/apiService";
import "./SellCars.css";

function SellCars() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    brandId: "",
    categoryId: "",
    images: [],
    // vehicle fields
    model: "",
    color: "",
    year: "",
    vehiclePrice: "",
    vehicleCondition: "",
    // battery fields
    capacity: "",
    voltage: "",
    cycleCount: "",
    batteryPrice: "",
    batteryCondition: "",
    type: "vehicle", // "vehicle" or "battery"
  });

  // Check login & fetch brands/categories
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      const token = apiService.getAuthToken();
      if (!token || apiService.isTokenExpired()) {
        apiService.clearAuthToken();
        navigate("/login");
        return;
      }
      try {
        // Đúng: gọi hàm trả về Promise
        const brandsData = await apiService.getBrands();
        setBrands(brandsData);

        const categoriesData = await apiService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Nếu thay đổi trường "price" thì cập nhật luôn các trường bên dưới
    if (name === "price") {
      setFormData((prev) => ({
        ...prev,
        price: value,
        vehiclePrice: value,
        batteryPrice: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle file upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  // Remove image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    // Nếu xóa ảnh chính thì reset về 0
    if (primaryImageIndex === index) setPrimaryImageIndex(0);
    else if (primaryImageIndex > index)
      setPrimaryImageIndex(primaryImageIndex - 1);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Nếu đang gửi thì bỏ qua
    setSubmitting(true);
    setError("");
    const token = apiService.getAuthToken();
    if (!token || apiService.isTokenExpired()) {
      apiService.clearAuthToken();
      navigate("/login");
      return;
    }
    try {
      // Tạo object listing
      const listingObj = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        brandId: formData.brandId,
        categoryId: formData.categoryId,
        primaryImageIndex: primaryImageIndex,
      };

      if (formData.type === "vehicle") {
        listingObj.vehicle = {
          model: formData.model,
          color: formData.color,
          year: formData.year,
          price: formData.price,
          condition: formData.vehicleCondition,
        };
      }
      if (formData.type === "battery") {
        listingObj.battery = {
          capacity: formData.capacity,
          voltage: formData.voltage,
          cycleCount: formData.cycleCount,
          price: formData.price,
          condition: formData.batteryCondition,
        };
      }

      // Gọi apiService để gửi bài đăng
      await apiService.createProductPost(listingObj, formData.images);

      alert("Đã đăng tin thành công! Tin của bạn đang chờ duyệt.");
      navigate("/buy");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false); // Mở lại nút sau khi gửi xong
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
              {error && <div className="error">{error}</div>}
              <form onSubmit={handleSubmit} className="sell-form">
                {/* Tiêu đề, mô tả, giá */}
                <div className="form-group">
                  <label className="form-label required">
                    Tiêu đề bài đăng
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="VD: Xe điện Tesla Model 3 2023"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Mô tả chi tiết</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="form-control"
                    placeholder="VD: Xe mới sử dụng 6 tháng, còn bảo hành..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="form-control"
                    placeholder="VD: 50000000"
                  />
                </div>
                {/* Brand & Category dropdown */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Hãng sản xuất</label>
                    <select
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleChange}
                      required
                      className="form-control"
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
                    <label className="form-label required">Danh mục</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((c) => (
                        <option key={c.categoryId} value={c.categoryId}>
                          {c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Chọn loại sản phẩm */}
                <div className="form-group">
                  <label className="form-label required">Loại sản phẩm</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="type"
                        value="vehicle"
                        checked={formData.type === "vehicle"}
                        onChange={handleChange}
                      />{" "}
                      Xe điện
                    </label>
                    <label style={{ marginLeft: 20 }}>
                      <input
                        type="radio"
                        name="type"
                        value="battery"
                        checked={formData.type === "battery"}
                        onChange={handleChange}
                      />{" "}
                      Pin sạc
                    </label>
                  </div>
                </div>
                {/* Vehicle fields */}
                {formData.type === "vehicle" && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">Dòng xe</label>
                        <input
                          type="text"
                          name="model"
                          value={formData.model}
                          onChange={handleChange}
                          required
                          className="form-control"
                          placeholder="VD: Model 3"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label required">Màu xe</label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          required
                          className="form-control"
                          placeholder="VD: Đỏ"
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
                          required
                          min="2015"
                          max={new Date().getFullYear()}
                          className="form-control"
                          placeholder="VD: 2023"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label required">
                          Giá xe (VNĐ)
                        </label>
                        <input
                          type="number"
                          name="vehiclePrice"
                          value={formData.vehiclePrice}
                          readOnly
                          required
                          min="0"
                          className="form-control"
                          placeholder="VD: 40000000"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label required">
                        Tình trạng xe
                      </label>
                      <input
                        type="text"
                        name="vehicleCondition"
                        value={formData.vehicleCondition}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="VD: Đã sử dụng"
                      />
                    </div>
                  </>
                )}
                {/* Battery fields */}
                {formData.type === "battery" && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">
                          Dung lượng (kWh)
                        </label>
                        <input
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleChange}
                          required
                          min="0"
                          className="form-control"
                          placeholder="VD: 75.0"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label required">
                          Điện áp (V)
                        </label>
                        <input
                          type="number"
                          name="voltage"
                          value={formData.voltage}
                          onChange={handleChange}
                          required
                          min="0"
                          className="form-control"
                          placeholder="VD: 4000000"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">
                          Số lần sạc
                        </label>
                        <input
                          type="number"
                          name="cycleCount"
                          value={formData.cycleCount}
                          onChange={handleChange}
                          required
                          min="0"
                          className="form-control"
                          placeholder="VD: 50"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label required">
                          Giá pin (VNĐ)
                        </label>
                        <input
                          type="number"
                          name="batteryPrice"
                          value={formData.batteryPrice}
                          readOnly
                          required
                          min="0"
                          className="form-control"
                          placeholder="VD: 2500"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label required">
                        Tình trạng pin
                      </label>
                      <input
                        type="text"
                        name="batteryCondition"
                        value={formData.batteryCondition}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="VD: Mới"
                      />
                    </div>
                  </>
                )}
                {/* Images */}
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
                      Tối đa 10 ảnh, mỗi ảnh không quá 5MB
                    </p>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="image-preview-grid">
                      {formData.images.map((img, index) => (
                        <div key={index} className="image-preview-with-radio">
                          <div className="image-preview">
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`Preview ${index + 1}`}
                            />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </button>
                          </div>
                          <div className="primary-radio-below">
                            <label>
                              <input
                                type="radio"
                                name="primaryImage"
                                checked={primaryImageIndex === index}
                                onChange={() => setPrimaryImageIndex(index)}
                              />
                              Ảnh chính
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Submit */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => navigate("/")}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-submit">
                    Đăng tin
                  </button>
                </div>
              </form>
            </main>
            {/* Sidebar Tips */}
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
      {submitting && (
        <div className="submit-overlay">
          <div className="submit-spinner"></div>
          <div>Đang gửi bài đăng...</div>
        </div>
      )}
    </>
  );
}

export default SellCars;
