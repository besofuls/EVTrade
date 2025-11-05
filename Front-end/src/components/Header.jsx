import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false) // For demo purposes
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Tìm kiếm:', searchQuery)
  }

  return (
    <header className="home-header">
      <div className="container-fluid">
        <div className="header-content">
          {/* Logo/Site Name */}
          <h1 className="site-logo" onClick={() => navigate('/')}>EVMARKETPLAY.VN</h1>

          {/* Menu Navigation */}
          <nav className="main-nav">
            <a href="#" className="nav-link">Mua sản phẩm</a>
            <a href="#" className="nav-link">Bán sản phẩm</a>
            <a href="#" className="nav-link">Liên hệ</a>
            <a href="#" className="nav-link">Về chúng tôi</a>
          </nav>

          {/* Search Bar */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-container">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Auth Buttons - Right */}
          <div className="auth-buttons">
            {!isLoggedIn ? (
              <>
                <button className="btn-login" onClick={() => navigate('/login')}>
                  Đăng nhập
                </button>
                <button className="btn-register" onClick={() => navigate('/register')}>
                  Đăng ký
                </button>
              </>
            ) : (
              <div className="user-menu-container">
                <button 
                  className="user-avatar-btn" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <img src="https://via.placeholder.com/40" alt="User" />
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-item" onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                      <span>👤</span> Thông tin cá nhân
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/my-orders'); setShowUserMenu(false); }}>
                      <span>📦</span> Đơn hàng của tôi
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/settings'); setShowUserMenu(false); }}>
                      <span>⚙️</span> Cài đặt
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => { setIsLoggedIn(false); setShowUserMenu(false); }}>
                      <span>🚪</span> Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Toggle demo login state */}
            <button 
              className="btn-demo-toggle" 
              onClick={() => setIsLoggedIn(!isLoggedIn)}
              style={{ marginLeft: '10px', fontSize: '12px', padding: '5px 10px' }}
            >
              {isLoggedIn ? '👤 Thành viên' : '👤 Thành viên'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

