import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import './UserProfile.css'

function UserProfile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: '',
    icon: '💳',
    accountNumber: '',
    status: 'active',
    color: '#4a90e2'
  })

  // Sample user data
  const userData = {
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
  }

  const stats = {
    totalDeposit: '2,021,345,000',
    orders: 3,
    totalOrderValue: '410,000,000',
    interactions: 31,
    flow: 13,
    campaign: 13,
    sequence: 5
  }

  const [linkedAccounts, setLinkedAccounts] = useState([
    { name: 'MoMo', icon: '💳', accountNumber: '**** 6789', status: 'active', color: '#D82D8B' },
    { name: 'VNPay', icon: '💰', accountNumber: '**** 1234', status: 'active', color: '#0066CC' },
    { name: 'ZaloPay', icon: '💙', accountNumber: '**** 5678', status: 'active', color: '#008FE5' },
    { name: 'VietcomBank', icon: '🏦', accountNumber: '**** 9012', status: 'active', color: '#007B4B' }
  ])

  const channelStats = [
    { name: 'Messenger', icon: '💬', sent: 5000, opened: 2500, clicked: 1000 },
    { name: 'Zalo ZNS', icon: '💙', sent: 1000, opened: 750, clicked: 75 },
    { name: 'Zalo Quan Tâm', icon: '💙', sent: 500, opened: 100, clicked: 100 },
    { name: 'SMS', icon: '💬', sent: 100, opened: 34, clicked: 5 },
    { name: 'Gmail', icon: '✉️', sent: 50, opened: 25, clicked: 5 }
  ]

  // Available icons for selection
  const availableIcons = ['💳', '💰', '💙', '🏦', '💵', '💴', '💶', '💷', '🏧', '💸']
  const availableColors = [
    { name: 'Hồng', value: '#D82D8B' },
    { name: 'Xanh dương', value: '#0066CC' },
    { name: 'Xanh lam', value: '#008FE5' },
    { name: 'Xanh lá', value: '#007B4B' },
    { name: 'Đỏ', value: '#E53935' },
    { name: 'Cam', value: '#FB8C00' },
    { name: 'Tím', value: '#8E24AA' },
    { name: 'Vàng', value: '#FDD835' }
  ]

  const handleAddAccount = () => {
    if (newAccount.name && newAccount.accountNumber) {
      setLinkedAccounts([...linkedAccounts, { ...newAccount }])
      setShowAddAccountModal(false)
      setNewAccount({
        name: '',
        icon: '💳',
        accountNumber: '',
        status: 'active',
        color: '#4a90e2'
      })
    }
  }

  const handleInputChange = (field, value) => {
    setNewAccount({ ...newAccount, [field]: value })
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
                <h3 className="section-title-small">Chính sửa thông tin</h3>
                
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
              {/* Linked Accounts Card */}
              <div className="linked-accounts-card">
                <div className="linked-accounts-header">
                  <div className="header-content">
                    <h3>Liên kết Ngân hàng & Ví điện tử</h3>
                    <p>{linkedAccounts.length} tài khoản đã liên kết</p>
                  </div>
                  <button className="add-account-btn" onClick={() => setShowAddAccountModal(true)}>+ Thêm</button>
                </div>
                <div className="linked-accounts-list">
                  {linkedAccounts.map((account, index) => (
                    <div key={index} className="account-item">
                      <div className="account-icon" style={{ background: account.color }}>
                        {account.icon}
                      </div>
                      <div className="account-info">
                        <h4>{account.name}</h4>
                        <span className="account-number">{account.accountNumber}</span>
                      </div>
                      <span className={`account-status ${account.status}`}>
                        {account.status === 'active' ? '✓ Đã kích hoạt' : 'Chưa kích hoạt'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">🛒</div>
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

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAddAccountModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm Ngân hàng / Ví điện tử</h2>
              <button className="modal-close" onClick={() => setShowAddAccountModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Tên ngân hàng / ví *</label>
                <input 
                  type="text" 
                  placeholder="VD: Techcombank, Agribank, Shopee Pay..."
                  value={newAccount.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Số tài khoản *</label>
                <input 
                  type="text" 
                  placeholder="VD: **** 1234"
                  value={newAccount.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Chọn biểu tượng</label>
                <div className="icon-selector">
                  {availableIcons.map((icon, index) => (
                    <button
                      key={index}
                      className={`icon-option ${newAccount.icon === icon ? 'selected' : ''}`}
                      onClick={() => handleInputChange('icon', icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Chọn màu</label>
                <div className="color-selector">
                  {availableColors.map((color, index) => (
                    <button
                      key={index}
                      className={`color-option ${newAccount.color === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleInputChange('color', color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select 
                  value={newAccount.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="form-select"
                >
                  <option value="active">Đã kích hoạt</option>
                  <option value="inactive">Chưa kích hoạt</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddAccountModal(false)}>
                Hủy
              </button>
              <button 
                className="btn-submit" 
                onClick={handleAddAccount}
                disabled={!newAccount.name || !newAccount.accountNumber}
              >
                Thêm tài khoản
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

