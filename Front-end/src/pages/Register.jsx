import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backgroundVideo from '../assets/33vfxVliVS7mnZQ8o2LDBHzOqvL.mp4'
import apiService from '../services/apiService'
import './Register.css'

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (!agreedToTerms) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ')
      return
    }

    setLoading(true)

    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      }

      // Bước 1: Đăng ký
      const registerResponse = await apiService.register(registerData)
      
      if (registerResponse) {
        console.log('Registration successful:', registerResponse)
        
        // Bước 2: Tự động đăng nhập sau khi đăng ký thành công
        try {
          const loginResponse = await apiService.login({
            username: formData.username,
            password: formData.password
          })
          
          if (loginResponse && loginResponse.token) {
            console.log('Auto-login successful')
            
            // Trigger storage event để Header cập nhật
            window.dispatchEvent(new Event('storage'))
            
            alert('Đăng ký thành công! Chào mừng bạn đến với EVMARKETPLAY.VN!')
            
            // Chuyển về trang chủ với trạng thái đã đăng nhập
            setTimeout(() => {
              navigate('/')
            }, 100)
          } else {
            // Nếu auto-login fail, chuyển đến trang login
            alert('Đăng ký thành công! Vui lòng đăng nhập.')
            navigate('/login')
          }
        } catch (loginErr) {
          console.error('Auto-login error:', loginErr)
          // Nếu auto-login fail, vẫn cho user đăng nhập thủ công
          alert('Đăng ký thành công! Vui lòng đăng nhập.')
          navigate('/login')
        }
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      {/* Video Background */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      
      {/* Back to Home Button */}
      <button className="back-home-btn" onClick={() => navigate('/')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Trang chủ</span>
      </button>
      
      {/* Website branding */}
      <div className="website-branding" onClick={() => navigate('/')}>EVMARKETPLAY.VN</div>
      
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="col-12 d-flex align-items-center justify-content-center">
            <div className="register-card">
              {/* Language Selector */}
              <div className="language-selector">
                <span>Tiếng Việt (VIE)</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Register Content */}
              <div className="register-content">
                <h1 className="register-title">Đăng ký</h1>
                
                {error && (
                  <div className="alert alert-danger" role="alert" style={{fontSize: '12px', padding: '8px'}}>
                    {error}
                  </div>
                )}
                
                <form className="register-form" onSubmit={handleSubmit}>
                  <div className="mb-1">
                    <label className="form-label">Tên tài khoản</label>
                    <input 
                      type="text"
                      name="username"
                      className="form-control custom-input" 
                      placeholder=""
                      value={formData.username}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="form-label">Email</label>
                    <input 
                      type="email"
                      name="email"
                      className="form-control custom-input" 
                      placeholder=""
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="form-label">MẬT KHẨU</label>
                    <div className="password-input">
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control custom-input" 
                        placeholder=""
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
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

                  <div className="mb-1">
                    <label className="form-label">XÁC NHẬN MẬT KHẨU</label>
                    <div className="password-input">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="form-control custom-input" 
                        placeholder=""
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          {showConfirmPassword ? (
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

                  <div className="form-check mb-1">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="termsCheck"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      disabled={loading}
                    />
                    <label className="form-check-label terms-label" htmlFor="termsCheck">
                      I have read and agreed to the Terms of Service and Privacy Policy
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary register-button w-100"
                    disabled={loading}
                  >
                    {loading ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN'}
                  </button>
                </form>

                <div className="divider">
                  <span>Hoặc</span>
                </div>

                <div className="social-login">
                  <button className="btn social-button google">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="me-1">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Đăng nhập với Google
                  </button>
                  
                  <button className="btn social-button facebook">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" className="me-1">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Đăng nhập với Facebook
                  </button>
                </div>

                <div className="signup-link text-center">
                  Đã có tài khoản ? <a href="#" className="signup-text" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
