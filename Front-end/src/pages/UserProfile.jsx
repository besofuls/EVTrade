import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import './UserProfile.css'

function UserProfile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)

  // Sample user data
  const [userData, setUserData] = useState({
    name: 'Sơn Trường Giang',
    age: 16,
    gender: 'Nam',
    location: 'Hà Nội, Việt Nam',
    phone: '+84 0373467950',
    email: 'gianghosonanh@gmail.com',
    segment: 'Khách hàng thân thiết',
    memberSince: 'Tháng 12',
    country: 'Việt Nam',
    district: 'Quận Cầu Giấy',
    serviceStatus: 'Đang sử dụng',
    renewalDate: 'ĐK 1 năm',
    tags: ['KV Hà Nội', 'KH Premium', 'ĐK 1 năm']
  })

  const [editedUserData, setEditedUserData] = useState({...userData})

  const stats = {
    totalDeposit: '2,021,345,000',
    orders: 3,
    totalOrderValue: '410,000,000',
    interactions: 31,
    flow: 13,
    campaign: 13,
    sequence: 5,
    ordersPurchased: 15,  // Tổng đơn hàng đã mua
    ordersSold: 8         // Tổng đơn hàng đã bán
  }


  const channelStats = [
    { name: 'Messenger', icon: '💬', sent: 5000, opened: 2500, clicked: 1000 },
    { name: 'Zalo ZNS', icon: '💙', sent: 1000, opened: 750, clicked: 75 },
    { name: 'Zalo Quan Tâm', icon: '💙', sent: 500, opened: 100, clicked: 100 },
    { name: 'SMS', icon: '💬', sent: 100, opened: 34, clicked: 5 },
    { name: 'Gmail', icon: '✉️', sent: 50, opened: 25, clicked: 5 }
  ]


  const handleEditProfileClick = () => {
    setEditedUserData({...userData})
    setShowEditProfileModal(true)
  }

  const handleProfileInputChange = (field, value) => {
    setEditedUserData({ ...editedUserData, [field]: value })
  }

  const handleSaveProfile = () => {
    setUserData({...editedUserData})
    setShowEditProfileModal(false)
    alert('Thông tin đã được cập nhật thành công!')
  }

  return (
    <div className="user-profile-page">
      <Header />

      <div className="profile-container">
        {/* Back Button */}
        <div className="back-navigation">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Trở lại danh sách
          </button>
        </div>

        <div className="profile-content">
          {/* Left Sidebar - User Info */}
          <div className="profile-sidebar">
            <div className="user-card">
              {/* Profile Picture */}
              <div className="profile-picture-section">
                <div className="profile-picture">
                  <img src="https://via.placeholder.com/150" alt={userData.name} />
                  <span className="online-status"></span>
                </div>
              </div>

              {/* User Name */}
              <h2 className="user-name">{userData.name}</h2>
              <p className="user-meta">{userData.age} tuổi · {userData.gender} · {userData.location}</p>

              {/* Social Links */}
              <div className="social-links">
                <a href="#" className="social-link twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" className="social-link facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                <a href="#" className="social-link instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="white"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2"/>
                  </svg>
                </a>
                <a href="#" className="social-link linkedin">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>

              {/* Divider */}
              <div className="info-divider"></div>

              {/* Contact Info */}
              <div className="contact-info">
                <div className="contact-info-header">
                  <h3 className="section-title-small">Thông tin liên hệ</h3>
                  <button className="edit-info-btn" title="Chỉnh sửa thông tin" onClick={handleEditProfileClick}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="info-item">
                  <span className="info-icon">📞</span>
                  <div>
                    <label>Điện thoại</label>
                    <p>{userData.phone}</p>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-icon">✉️</span>
                  <div>
                    <label>Email</label>
                    <p>{userData.email}</p>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-icon">👥</span>
                  <div>
                    <label>Segment</label>
                    <p>{userData.segment}</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="info-divider"></div>

              {/* Additional Info */}
              <div className="additional-info">
                <h3 className="section-title-small">THÔNG TIN BỔ SUNG</h3>
                <button className="settings-btn">⚙️</button>
                
                <div className="info-row">
                  <span className="info-label">Quốc gia/Khu vực</span>
                  <span className="info-value">{userData.country}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Quận/Huyện</span>
                  <span className="info-value">{userData.district}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Segment</span>
                  <span className="info-value">{userData.segment}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Tình trạng dịch vụ</span>
                  <span className="info-value">{userData.serviceStatus}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Ngày gia hạn</span>
                  <span className="info-value">{userData.renewalDate}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="user-tags">
                <div className="tags-header">
                  <span>➕ Thêm Tag</span>
                </div>
                <div className="tags-list">
                  {userData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag} <span className="tag-remove">×</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="profile-main">
            {/* Notifications */}
            <div className="notifications">
              <div className="notification birthday">
                <span>🎉</span>
                <p>Hôm nay là sinh nhật của khách hàng <strong>{userData.name}</strong> ({userData.birthday || '02/08/2000'}). Hãy gửi một lời chúc tới anh ấy!</p>
                <button className="close-notification">×</button>
              </div>
              <div className="notification reminder">
                <span>🔔</span>
                <p>Gói dịch vụ của <strong>{userData.name}</strong> sẽ hết hạn vào ngày hôm nay (12/08/2023). Hãy liên hệ tư vấn gia hạn với anh ấy!</p>
                <button className="close-notification">×</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Tổng quan
              </button>
              <button 
                className={`tab ${activeTab === 'interactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('interactions')}
              >
                Tương tác
              </button>
              <button 
                className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Đơn hàng
              </button>
              <button 
                className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
                onClick={() => setActiveTab('activities')}
              >
                Hoạt động
              </button>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
              {/* Tổng đơn hàng đã mua */}
              <div className="stat-card">
                <div className="stat-icon blue">🛍️</div>
                <div className="stat-content">
                  <label>Tổng đơn hàng đã mua</label>
                  <h3>{stats.ordersPurchased}</h3>
                </div>
              </div>

              {/* Tổng đơn hàng đã bán */}
              <div className="stat-card">
                <div className="stat-icon green">💰</div>
                <div className="stat-content">
                  <label>Tổng đơn hàng đã bán</label>
                  <h3>{stats.ordersSold}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">🛒</div>
                <div className="stat-content">
                  <label>Tương tác</label>
                  <h3>{stats.interactions}</h3>
                </div>
              </div>

              <div className="stat-card-row">
                <div className="mini-stat">
                  <label>Đơn đã đặt</label>
                  <h4>{stats.orders}</h4>
                </div>
                <div className="mini-stat">
                  <label>Tổng giá trị đơn hàng</label>
                  <h4>{stats.totalOrderValue}đ</h4>
                </div>
              </div>

              <div className="stat-card-row">
                <div className="mini-stat">
                  <label>Flow</label>
                  <h4>{stats.flow}</h4>
                </div>
                <div className="mini-stat">
                  <label>Campaign</label>
                  <h4>{stats.campaign}</h4>
                </div>
                <div className="mini-stat">
                  <label>Sequence</label>
                  <h4>{stats.sequence}</h4>
                </div>
              </div>
            </div>

            {/* Channel Stats and Device Stats */}
            <div className="analytics-section">
              <div className="channel-stats">
                <h3 className="section-title">Top kênh nhận tin nhắn</h3>
                <p className="section-subtitle">Các kênh khách hàng dùng để mở tin nhắn.</p>
                
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>TÊN KÊNH</th>
                      <th>ĐÃ GỬI</th>
                      <th>ĐÃ NHẬN</th>
                      <th>ĐÃ CLICK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelStats.map((channel, index) => (
                      <tr key={index}>
                        <td>
                          <span className="channel-icon">{channel.icon}</span>
                          {channel.name}
                        </td>
                        <td>{channel.sent}</td>
                        <td>{channel.opened}</td>
                        <td>{channel.clicked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="modal-overlay" onClick={() => setShowEditProfileModal(false)}>
          <div className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa thông tin cá nhân</h2>
              <button className="modal-close" onClick={() => setShowEditProfileModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input 
                    type="text" 
                    placeholder="Nhập họ và tên"
                    value={editedUserData.name}
                    onChange={(e) => handleProfileInputChange('name', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Tuổi *</label>
                  <input 
                    type="number" 
                    placeholder="Nhập tuổi"
                    value={editedUserData.age}
                    onChange={(e) => handleProfileInputChange('age', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giới tính *</label>
                  <select 
                    value={editedUserData.gender}
                    onChange={(e) => handleProfileInputChange('gender', e.target.value)}
                    className="form-select"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Địa chỉ *</label>
                  <input 
                    type="text" 
                    placeholder="Nhập địa chỉ"
                    value={editedUserData.location}
                    onChange={(e) => handleProfileInputChange('location', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input 
                    type="tel" 
                    placeholder="Nhập số điện thoại"
                    value={editedUserData.phone}
                    onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    placeholder="Nhập email"
                    value={editedUserData.email}
                    onChange={(e) => handleProfileInputChange('email', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quốc gia/Khu vực</label>
                  <input 
                    type="text" 
                    placeholder="Nhập quốc gia"
                    value={editedUserData.country}
                    onChange={(e) => handleProfileInputChange('country', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <input 
                    type="text" 
                    placeholder="Nhập quận/huyện"
                    value={editedUserData.district}
                    onChange={(e) => handleProfileInputChange('district', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Segment</label>
                <input 
                  type="text" 
                  placeholder="Nhập segment"
                  value={editedUserData.segment}
                  onChange={(e) => handleProfileInputChange('segment', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditProfileModal(false)}>
                Hủy
              </button>
              <button 
                className="btn-submit" 
                onClick={handleSaveProfile}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}


      <Footer />
    </div>
  )
}

export default UserProfile

