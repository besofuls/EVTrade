import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* Header/Navbar */}
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-10 text-center">
              <h1 className="hero-title" onClick={() => navigate('/')}>EVMARKETPLAY.VN</h1>
              <p className="hero-subtitle">Nền tảng mua bán xe điện hàng đầu Việt Nam</p>
              <p className="hero-description">
                Khám phá và sở hữu những mẫu xe điện hiện đại, thân thiện với môi trường. Tương lai xanh bắt đầu từ đây.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary-large">
                  Tìm kiếm sản phẩm
                </button>
                <button className="btn-secondary-large">
                  Đăng tin bán sản phẩm
                </button>
              </div>
            </div>
          </div>

          {/* Stats in Hero */}
          <div className="row mt-5">
            <div className="col-md-4">
              <div className="hero-stat">
                <h3 className="hero-stat-number">10,000+</h3>
                <p className="hero-stat-label">Thành viên</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="hero-stat">
                <h3 className="hero-stat-number">5,000+</h3>
                <p className="hero-stat-label">Giao dịch thành công</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="hero-stat">
                <h3 className="hero-stat-number">98%</h3>
                <p className="hero-stat-label">Khách hàng hài lòng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Cách thức hoạt động */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">Cách thức hoạt động</h2>
          <p className="section-subtitle">Quy trình đơn giản, nhanh chóng chỉ với 4 bước</p>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Đăng ký tài khoản</h3>
              <p>Tạo tài khoản miễn phí chỉ trong vài phút</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>Tìm kiếm xe điện</h3>
              <p>Duyệt xe hoặc đăng tin bán xe của bạn</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Liên hệ & thương lượng</h3>
              <p>Trao đổi trực tiếp với người mua/bán</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-item">
              <div className="step-number">4</div>
              <h3>Hoàn tất giao dịch</h3>
              <p>Thanh toán an toàn và nhận xe</p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section - Tính năng nổi bật */}
      <section className="highlights-section">
        <div className="container">
          <h2 className="section-title">Tính năng nổi bật</h2>
          <p className="section-subtitle">Trải nghiệm dịch vụ tốt nhất cho mọi giao dịch</p>
          <div className="row mt-5 g-4">
            <div className="col-lg-4 col-md-6">
              <div className="highlight-card">
                <div className="highlight-icon-wrapper">
                  <div className="highlight-icon">🔒</div>
                </div>
                <h3>Bảo mật thanh toán</h3>
                <p>Hệ thống thanh toán được mã hóa SSL, bảo vệ thông tin tài chính tuyệt đối</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="highlight-card">
                <div className="highlight-icon-wrapper">
                  <div className="highlight-icon">✅</div>
                </div>
                <h3>Xác minh người dùng</h3>
                <p>Người dùng được xác minh danh tính, đảm bảo giao dịch an toàn</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="highlight-card">
                <div className="highlight-icon-wrapper">
                  <div className="highlight-icon">📊</div>
                </div>
                <h3>Báo cáo chi tiết</h3>
                <p>Thông tin đầy đủ với lịch sử sử dụng và kiểm định chất lượng</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="highlight-card">
                <div className="highlight-icon-wrapper">
                  <div className="highlight-icon">🔋</div>
                </div>
                <h3>Kiểm tra pin chuyên nghiệp</h3>
                <p>Đánh giá tình trạng pin lithium với công nghệ hiện đại, chính xác</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="highlight-card">
                <div className="highlight-icon-wrapper">
                  <div className="highlight-icon">⚡</div>
                </div>
                <h3>Giao dịch nhanh chóng</h3>
                <p>Quy trình mua bán đơn giản, hoàn tất giao dịch chỉ trong vài phút</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="highlight-card">
                <div className="highlight-icon-wrapper">
                  <div className="highlight-icon">💰</div>
                </div>
                <h3>Giá cả minh bạch</h3>
                <p>Định giá công khai, không phí ẩn, mọi chi phí được hiển thị rõ ràng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Đánh giá */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Khách hàng nói gì về chúng tôi</h2>
          <div className="row mt-5 g-4">
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p className="testimonial-text">
                  "Tôi đã mua chiếc xe điện Tesla Model 3 qua EVMARKETPLAY.VN. 
                  Quy trình rất nhanh chóng và minh bạch. Rất hài lòng!"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">N</div>
                  <div>
                    <h4>Nguyễn Văn A</h4>
                    <p>Hà Nội</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p className="testimonial-text">
                  "Nền tảng tuyệt vời! Tôi đã bán được xe VinFast VF8 chỉ sau 3 ngày đăng tin. 
                  Hỗ trợ nhiệt tình và chuyên nghiệp."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">T</div>
                  <div>
                    <h4>Trần Thị B</h4>
                    <p>TP.HCM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p className="testimonial-text">
                  "Hệ thống xác minh rất tốt, tôi cảm thấy an tâm khi giao dịch. 
                  Giá cả hợp lý và minh bạch."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">L</div>
                  <div>
                    <h4>Lê Văn C</h4>
                    <p>Đà Nẵng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Bắt đầu hành trình xe điện của bạn</h2>
          <p className="cta-description">Tham gia cộng đồng mua bán xe điện lớn nhất Việt Nam. Mua xe, bán xe, trao đổi - tất cả trong một nền tảng.</p>
          <div className="cta-buttons">
            <button className="btn-cta-primary" onClick={() => navigate('/register')}>
              Đăng ký ngay
            </button>
            <button className="btn-cta-secondary">
              Xem sản phẩm
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home
