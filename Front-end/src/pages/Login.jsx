import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="login-page">
      {/* Website branding */}
      <div className="website-branding" onClick={() => navigate('/')}>EVMARKETPLAY.VN</div>
      
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="col-12 d-flex align-items-center justify-content-center">
            <div className="login-card">
              {/* Language Selector */}
              <div className="language-selector">
                <span>Tiếng Việt (VIE)</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Login Content */}
              <div className="login-content">
                <h1 className="login-title">Đăng Nhập</h1>
                
                <form className="login-form">
                  <div className="mb-4">
                    <label className="form-label">Tên tài khoản</label>
                    <input 
                      type="text" 
                      className="form-control custom-input" 
                      placeholder=""
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">MẬT KHẨU</label>
                    <div className="password-input">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-control custom-input" 
                        placeholder=""
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          {showPassword ? (
                            <>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                            </>
                          ) : (
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2"/>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary login-button w-100">
                    Đăng Nhập
                  </button>
                </form>

                <div className="divider">
                  <span>Hoặc</span>
                </div>

                <div className="social-login">
                  <button className="btn social-button google mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" className="me-2">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Đăng nhập với Google
                  </button>
                  
                  <button className="btn social-button facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" className="me-2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Đăng nhập với Facebook
                  </button>
                </div>

                <div className="signup-link text-center mt-4">
                  Chưa có tài khoản ? <a href="#" className="signup-text" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Đăng ký</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
