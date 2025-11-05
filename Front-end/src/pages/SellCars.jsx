import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import './SellCars.css'

function SellCars() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    category: 'car',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    condition: '',
    battery: '',
    location: '',
    phone: '',
    description: '',
    images: []
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    // Mock image upload
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files.map(f => URL.createObjectURL(f))]
    }))
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Đã đăng tin thành công! Tin của bạn đang chờ duyệt.')
    navigate('/buy')
  }

  return (
    <>
      <Header />
      <div className="sell-cars-page">
        <div className="container-fluid">
          <div className="sell-cars-content">
          {/* Form */}
          <main className="sell-form-section">
            <div className="form-header">
              <h2>Đăng tin bán sản phẩm</h2>
              <p>Điền đầy đủ thông tin để tin đăng của bạn được duyệt nhanh hơn</p>
            </div>

            <form onSubmit={handleSubmit} className="sell-form">
              {/* Loại sản phẩm */}
              <div className="form-group">
                <label className="form-label required">Loại sản phẩm</label>
                <div className="category-options">
                  <label className="category-option">
                    <input
                      type="radio"
                      name="category"
                      value="car"
                      checked={formData.category === 'car'}
                      onChange={handleChange}
                      required
                    />
                    <span>🚗 Xe điện</span>
                  </label>
                  <label className="category-option">
                    <input
                      type="radio"
                      name="category"
                      value="battery"
                      checked={formData.category === 'battery'}
                      onChange={handleChange}
                    />
                    <span>🔋 Pin sạc</span>
                  </label>
                </div>
              </div>

              {/* Thông tin xe điện */}
              {formData.category === 'car' && (
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
                        placeholder="VD: VF8, Model 3, Kona Electric..."
                        required
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Năm sản xuất</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="VD: 2023"
                        required
                        min="2015"
                        max={new Date().getFullYear()}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Số km đã đi</label>
                      <input
                        type="text"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleChange}
                        placeholder="VD: 15,000 km"
                        required
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
                      placeholder="VD: Pin còn 95%, sạc đầy chạy được 350km"
                      className="form-control"
                    />
                  </div>
                </>
              )}

              {/* Thông tin pin sạc */}
              {formData.category === 'battery' && (
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
                      <label className="form-label required">Hãng sản xuất</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="VD: CATL, LG Chem, Panasonic..."
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
                      placeholder="VD: Còn 90% dung lượng, đã dùng 2 năm"
                      required
                      className="form-control"
                    />
                  </div>
                </>
              )}

              {/* Giá bán */}
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

              {/* Mô tả */}
              <div className="form-group">
                <label className="form-label required">Mô tả chi tiết</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về sản phẩm: tình trạng, lý do bán, lịch sử bảo dưỡng..."
                  required
                  rows="6"
                  className="form-control"
                />
              </div>

              {/* Hình ảnh */}
              <div className="form-group">
                <label className="form-label required">Hình ảnh sản phẩm</label>
                <div className="image-upload-section">
                  <label className="image-upload-btn">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <span>📷 Chọn ảnh</span>
                  </label>
                  <p className="upload-hint">Tối đa 10 ảnh, mỗi ảnh không quá 5MB</p>
                </div>

                {formData.images.length > 0 && (
                  <div className="image-preview-grid">
                    {formData.images.map((img, index) => (
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

              {/* Thông tin liên hệ */}
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

              {/* Submit */}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => navigate('/')}>
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
    </>
  )
}

export default SellCars

