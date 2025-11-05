import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/apiService'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error('Error parsing user data:', error)
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

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      try {
        // Gọi API logout
        await apiService.logout()
        
        // Cập nhật UI
        setUser(null)
        setShowUserMenu(false)
        
        // Trigger storage event để các component khác cập nhật
        window.dispatchEvent(new Event('storage'))
        
        alert('Đăng xuất thành công!')
        navigate('/')
      } catch (error) {
        console.error('Logout error:', error)
        // Vẫn clear UI và redirect dù API lỗi
        setUser(null)
        setShowUserMenu(false)
        alert('Đã đăng xuất!')
        navigate('/')
      }
    }
  }

  return (
    <header className="home-header">
      <div className="container-fluid">
        <div className="header-content">
          {/* Logo/Site Name */}
          <h1 className="site-logo" onClick={() => navigate('/')}>EVMARKETPLAY.VN</h1>

          {/* Menu Navigation */}
          <nav className="main-nav">
            <a onClick={() => navigate('/buy')} className="nav-link">Mua sản phẩm</a>
            <a onClick={() => navigate('/sell')} className="nav-link">Bán sản phẩm</a>
            <a href="#" className="nav-link">Liên hệ</a>
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
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={handleLogout}>
                      <span>🚪</span> Đăng Xuất
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

