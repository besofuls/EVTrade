import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import apiService from '../services/apiService'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user')
      const token = apiService.getAuthToken()
      // Chỉ bắt đăng nhập ở các trang cần bảo mật
      const protectedPaths = [
        '/user-profile',
        '/my-orders',
        '/orders-payment',
        '/sell'
      ]
      if (!token || apiService.isTokenExpired()) {
        apiService.clearAuthToken();
        setUser(null);
        if (protectedPaths.includes(window.location.pathname)) {
          navigate("/login", { replace: true });
        }
        return;
      }
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }

    checkUser()
    window.addEventListener('storage', checkUser)
    const interval = setInterval(checkUser, 1000)
    
    return () => {
      window.removeEventListener('storage', checkUser)
      clearInterval(interval)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate('/search')
    }
  }

  const openLogoutConfirm = () => {
    setShowUserMenu(false)
    setShowLogoutConfirm(true)
  }

  const closeLogoutConfirm = () => {
    if (loggingOut) return
    setShowLogoutConfirm(false)
  }

  const performLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await apiService.logout()
      setUser(null)
      window.dispatchEvent(new Event('storage'))
      showToast('Đăng xuất thành công!', 'success')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
      showToast('Đã đăng xuất!', 'info')
      navigate('/')
    } finally {
      setShowUserMenu(false)
      setShowLogoutConfirm(false)
      setLoggingOut(false)
    }
  }

  return (
    <header className="home-header">
      <div className="container-fluid">
        <div className="header-content">
          {/* Logo/Site Name */}
          <h1 className="site-logo" onClick={() => navigate('/')}>EVMARKETPLACE</h1>

          {/* Menu Navigation */}
          <nav className="main-nav">
            <a onClick={() => navigate('/buy')} className="nav-link">Mua sản phẩm</a>
            <a onClick={() => navigate('/sell')} className="nav-link">Tạo bài đăng</a>
            <a onClick={() => navigate('/about')} className="nav-link">Về chúng tôi</a>
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
            {!user ? (
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
                  className="btn-member" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Hello, {user.username || user.userName || user.name || 'User'}
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-item" onClick={() => { navigate('/user-profile'); setShowUserMenu(false); }}>
                      <span>👤</span> Tài Khoản Của Tôi
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/my-orders'); setShowUserMenu(false); }}>
                      <span>📦</span> Đơn Đã Mua
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/orders-payment'); setShowUserMenu(false); }}>
                      <span>💳</span> Thanh toán đơn hàng
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/my-complaints'); setShowUserMenu(false); }}>
                      <span>⚠️</span> Khiếu nại của tôi
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/my-favorites'); setShowUserMenu(false); }}>
                      <span>❤️</span> Bài đăng đã thích
                    </div>
                    {/* Thêm nút chuyển qua admin nếu là admin hoặc moderator */}
                    {(user?.roles?.includes("ADMIN") || user?.roles?.includes("MODERATOR")) && (
                      <div className="dropdown-item" onClick={() => { navigate('/admin'); setShowUserMenu(false); }}>
                        <span>🛠️</span> Admin Dashboard
                      </div>
                    )}
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={openLogoutConfirm}>
                      <span>🚪</span> Đăng Xuất
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={closeLogoutConfirm}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Đăng xuất</h3>
            <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
            <div className="logout-modal-actions">
              <button
                className="btn-confirm-logout"
                onClick={performLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={closeLogoutConfirm}
                disabled={loggingOut}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

