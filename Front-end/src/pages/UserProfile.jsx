import {
  faEdit,
  faEnvelope,
  faMapMarkerAlt,
  faPhone,
  faUser
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import apiService from '../services/apiService'
import './UserProfile.css'

function UserProfile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [, setLoading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const token = localStorage.getItem('authToken')
  const currentUserId = Number(localStorage.getItem('userID') || localStorage.getItem('userId') || 0)

  const [userData, setUserData] = useState({
    id: currentUserId,
    fullName: '',
    phone: '',
    address: '',
    email: '',
    avatar: ''
  })
  const [editedUserData, setEditedUserData] = useState({ ...userData })

  const [cartItems, setCartItems] = useState([])
  const [purchasedOrders, setPurchasedOrders] = useState([])

  useEffect(() => {
    if (!currentUserId) return
    fetchProfile()
    fetchCart() 
    // Remove: fetchMyListings()
    fetchPurchasedOrders()
    // eslint-disable-next-line
  }, [currentUserId])

  const resolveBase = () => {
    // ưu tiên lấy API_BASE_URL trực tiếp từ apiService nếu có
    try {
      if (!apiService) return '/api'
      if (typeof apiService === 'string') return apiService.replace(/\/$/, '')
      // apiService.API_BASE_URL đã được thêm vào apiService ở trên
      return apiService.API_BASE_URL || '/api'
    } catch {
      return '/api'
    }
=======
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: '',
    icon: '💳',
    accountNumber: '',
    status: 'active',
    color: '#4a90e2'
  })

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
    sequence: 5

  }
  
  const buildUrl = (path) => `${resolveBase()}${path}`

  const fetchProfile = async () => {
    if (!token || !currentUserId) return
    setLoading(true)
    try {
      // Lấy profile từ /api/profiles/{userId}
      const profileUrl = buildUrl(`/profiles/${currentUserId}`)
      const profileRes = await fetch(profileUrl, { 
        headers: { Authorization: `Bearer ${token}` } 
      })

      // Lấy user info từ /api/users/{userId} 
      const userUrl = buildUrl(`/users/${currentUserId}`)
      const userRes = await fetch(userUrl, {
        headers: { Authorization: `Bearer ${token}` }
      })

      let profile = {}
      let user = {}

      console.log('Profile response status:', profileRes.status)
      console.log('User response status:', userRes.status)

      if (profileRes.ok) {
        profile = await profileRes.json()
        console.log('Profile data:', profile)
      }
      
      if (userRes.ok) {
        user = await userRes.json()
        console.log('User data:', user)
      }

      // Combine profile & user data
      const combinedData = {
        id: currentUserId,
        fullName: profile.fullName || user.username || '',
        phone: profile.phone || '',  // from profile
        address: profile.address || '', // from profile
        email: user.email || '',
        username: user.username || '',
        avatar: user.avatar || ''
      }

      console.log('Combined user data:', combinedData)
      setUserData(combinedData)
      setEditedUserData(combinedData)

    } catch (err) {
      console.error('fetchProfile error', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCart = async () => {
    if (!token || !currentUserId) return
    try {
      const res = await fetch(buildUrl(`/cart/${currentUserId}`), { headers: { Authorization: `Bearer ${token}` }})
      if (!res.ok) { setCartItems([]); return }
      const j = await res.json()
      setCartItems(j || [])
    } catch (err) {
      console.error('fetchCart', err)
      setCartItems([])
    }
  }


  const fetchPurchasedOrders = async () => {
    if (!token || !currentUserId) return
    try {
      const res = await fetch(buildUrl(`/users/${currentUserId}/orders`), { headers: { Authorization: `Bearer ${token}` }})
      if (!res.ok) { setPurchasedOrders([]); return }
      const j = await res.json()
      setPurchasedOrders(j || [])
    } catch (err) {
      console.error('fetchPurchasedOrders', err)
      setPurchasedOrders([])
    }
  }
=======
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


  const handleEditProfileClick = () => {
    setEditedUserData({ ...userData })
    setShowEditProfileModal(true)
  }


  const handleProfileInputChange = (field, value) => {
    setEditedUserData({ ...editedUserData, [field]: value })
  }

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


  const handleSaveProfile = async () => {
    if (!token || !currentUserId) {
      setUserData({ ...editedUserData })
      setShowEditProfileModal(false)
      return
    }
    setSavingProfile(true)
    try {
      // Try updating profile via /profiles endpoint first
      const profileBody = {
        fullName: editedUserData.fullName || '',
        phone: editedUserData.phone || '',
        address: editedUserData.address || '',
        userId: currentUserId
      }
      
      let res = await fetch(buildUrl(`/profiles/${currentUserId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileBody)
      })
      
      // If profiles endpoint fails, try users endpoint with complete data
      if (!res.ok) {
        console.log('Profile endpoint failed, trying users endpoint...')
        const userBody = {
          fullName: editedUserData.fullName || '',
          phone: editedUserData.phone || '',
          address: editedUserData.address || '',
          email: userData.email || '',
          username: userData.username || editedUserData.fullName || ''
        }
        
        res = await fetch(buildUrl(`/users/${currentUserId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(userBody)
        })
      }
      
      if (!res.ok) {
        const txt = await res.text().catch(()=>null)
        throw new Error(txt || `Status ${res.status}`)
      }
      
      const updated = await res.json().catch(()=>null)
      const mapped = updated ? {
        ...userData,
        fullName: updated.fullName || userData.fullName,
        phone: updated.phone || userData.phone,
        address: updated.address || userData.address
      } : { ...userData, ...profileBody }
      
      setUserData(mapped)
      setEditedUserData(mapped)
      setShowEditProfileModal(false)
      alert('Cập nhật profile thành công!')
    } catch (err) {
      console.error('save profile error', err)
      alert('Lưu profile thất bại: ' + err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleRemoveCartItem = async (itemId) => {
    if (!token || !currentUserId) {
      setCartItems(prev => prev.filter(i => i.id !== itemId))
      return
    }
    try {
      const res = await fetch(buildUrl(`/cart/${currentUserId}/items/${itemId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) fetchCart()
      else alert('Xóa thất bại')
    } catch {
      alert('Xóa thất bại')
    }
  }

  const formatPrice = (v) => {
    if (v == null || v === 0) return 'Thỏa thuận'
    return new Intl.NumberFormat('vi-VN').format(v) + ' ₫'
  }

  const statusBadge = (s) => {
    const st = (s || '').toLowerCase()
    if (st === 'approved') return <span className="badge bg-success">Đã duyệt</span>
    if (st === 'pending') return <span className="badge bg-warning text-dark">Chờ duyệt</span>
    if (st === 'rejected') return <span className="badge bg-danger">Bị từ chối</span>
    return <span className="badge bg-secondary">{s}</span>
  }

  const renderCart = () => {
    if (!cartItems.length) return <p>Giỏ hàng trống.</p>
    return (
      <ul className="list-group">
        {cartItems.map(ci => (
          <li key={ci.id || ci.itemId} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{ci.title || ci.name}</strong>
              <div className="text-muted small">{ci.description}</div>
            </div>
            <div>
              <span className="me-3">{ci.price ? formatPrice(ci.price) : ''}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveCartItem(ci.id || ci.itemId)}>Xóa</button>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  const renderPurchasedOrders = () => {
    if (!purchasedOrders.length) return <p>Chưa có đơn hàng đã mua.</p>
    return (
      <div className="list-group">
        {purchasedOrders.map(o => (
          <div key={o.orderId || o.id} className="list-group-item d-flex justify-content-between">
            <div>
              <strong>Đơn #{o.orderNumber || o.id}</strong>
              <div className="text-muted small">{o.items?.length || 0} sản phẩm</div>
              <div className="text-muted small">{o.status}</div>
            </div>
            <div className="text-end">
              <div>{o.total ? formatPrice(o.total) : ''}</div>
              <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => navigate(`/orders/${o.orderId || o.id}`)}>Chi tiết</button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="user-profile-page">
      <Header />

      <div className="profile-container container my-4">
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body text-center">
                <img src={userData.avatar || "https://i.pinimg.com/236x/49/3a/fd/493afd70b634a54bd18992e09c0937d7.jpg"} alt={userData.fullName || 'user'} className="rounded-circle mb-2" style={{width:120,height:120,objectFit:'cover'}} />
                <h4 className="mb-0">{userData.fullName || 'Người dùng'}</h4>
                <p className="text-muted small mb-2">{userData.email}</p>
                <p className="text-muted small">{userData.address}</p>

                <div className="d-grid gap-2">
                  <div className="text-center mt-3">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={handleEditProfileClick}
                    >
                      <FontAwesomeIcon icon={faEdit} className="me-2" />
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                  
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h6>Hành động nhanh</h6>
                <button className="btn btn-sm btn-outline-success w-100 mb-2" onClick={() => navigate('/sell')}>Tạo bài đăng mới</button>
                <button className="btn btn-sm btn-outline-info w-100" onClick={() => setActiveTab('cart')}>Xem giỏ hàng ({cartItems.length})</button>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="mb-3 d-flex gap-2">
              <button className={`btn btn-light ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Tổng quan</button>
              <button className={`btn btn-light ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => setActiveTab('cart')}>Giỏ hàng</button>
              <button className={`btn btn-light ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>Đơn hàng đã mua</button>
            </div>

            {activeTab === 'overview' && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title border-bottom pb-3">
                    Thông tin tài khoản
                  </h5>

                  <div className="row mt-4">
                    <div className="col-md-6">
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">
                          <FontAwesomeIcon icon={faUser} className="me-2" />
                          Họ và tên
                        </h6>
                        <p className="mb-0 fs-5">{userData.fullName || 'Chưa cập nhật'}</p>
                      </div>

                      <div className="mb-4">
                        <h6 className="text-muted mb-2">
                          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                          Email
                        </h6>
                        <p className="mb-0">{userData.email || 'Chưa cập nhật'}</p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Số điện thoại
                        </h6>
                        <p className="mb-0">{userData.phone || 'Chưa cập nhật'}</p>
                      </div>

                      <div className="mb-4">
                        <h6 className="text-muted mb-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                          Địa chỉ
                        </h6>
                        <p className="mb-0">{userData.address || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>

                  
                </div>
              </div>
            )}

            {activeTab === 'cart' && (
              <div>
                <h4>Giỏ hàng</h4>
                {renderCart()}
              </div>
            )}

            {activeTab === 'purchases' && (
              <div>
                <h4>Đơn hàng đã mua</h4>
                {renderPurchasedOrders()}
              </div>
            )}
          </div>
        </div>
      </div>


      {showEditProfileModal && (
        <div className="modal-overlay" onClick={() => setShowEditProfileModal(false)}>
          <div className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>

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

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAddAccountModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h2>Chỉnh sửa thông tin cá nhân</h2>
              <button className="modal-close" onClick={() => setShowEditProfileModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Họ và tên</label>
                <input type="text" className="form-input" value={editedUserData.fullName || ''} onChange={(e) => handleProfileInputChange('fullName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="tel" className="form-input" value={editedUserData.phone || ''} onChange={(e) => handleProfileInputChange('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input type="text" className="form-input" value={editedUserData.address || ''} onChange={(e) => handleProfileInputChange('address', e.target.value)} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditProfileModal(false)}>Hủy</button>
              <button className="btn-submit" onClick={handleSaveProfile} disabled={savingProfile}>{savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default UserProfile

