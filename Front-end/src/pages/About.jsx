import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import './About.css'

function About() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <div className="about-page">
        <div className="container-fluid">
        {/* Hero Section */}
        <div className="about-hero">
          <h1>Về EVMARKETPLAY.VN</h1>
          <p className="hero-subtitle">Nền tảng trao đổi mua bán xe điện và pin sạc hàng đầu Việt Nam</p>
        </div>

        {/* Main Content */}
        <div className="about-content">
          <section className="about-section">
            <div className="section-icon">🌱</div>
            <h2>Chúng tôi là ai?</h2>
            <p>
              <strong>EVMARKETPLAY.VN</strong> là nền tảng trực tuyến chuyên nghiệp, kết nối người mua và người bán 
              các sản phẩm liên quan đến xe điện đã qua sử dụng và pin sạc chất lượng cao. Chúng tôi ra đời với 
              sứ mệnh tạo ra một thị trường minh bạch, an toàn và đáng tin cậy cho cộng đồng yêu thích xe điện.
            </p>
          </section>

          <section className="about-section">
            <div className="section-icon">🎯</div>
            <h2>Sứ mệnh của chúng tôi</h2>
            <p>
              Chúng tôi tin rằng việc chuyển đổi sang phương tiện xanh là tương lai của giao thông. 
              EVMARKETPLAY.VN được xây dựng để:
            </p>
            <ul className="mission-list">
              <li>🔹 Tạo cầu nối giữa người mua và người bán xe điện đã qua sử dụng</li>
              <li>🔹 Giúp tái sử dụng và kéo dài tuổi thọ của các sản phẩm xe điện</li>
              <li>🔹 Giảm chi phí tiếp cận xe điện cho mọi người</li>
              <li>🔹 Đóng góp vào việc bảo vệ môi trường và phát triển bền vững</li>
              <li>🔹 Xây dựng cộng đồng người dùng xe điện văn minh và uy tín</li>
            </ul>
          </section>

          <section className="about-section">
            <div className="section-icon">⚡</div>
            <h2>Chúng tôi cung cấp gì?</h2>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-icon">🚗</div>
                <h3>Xe điện đã qua sử dụng</h3>
                <p>Đa dạng các dòng xe điện từ VinFast, BYD, Hyundai, Tesla và nhiều thương hiệu khác</p>
              </div>
              <div className="service-card">
                <div className="service-icon">🔋</div>
                <h3>Pin sạc chất lượng</h3>
                <p>Pin Lithium-ion từ các nhà sản xuất uy tín như CATL, LG Chem, Panasonic</p>
              </div>
              <div className="service-card">
                <div className="service-icon">💼</div>
                <h3>Nền tảng giao dịch an toàn</h3>
                <p>Hệ thống đăng tin minh bạch, dễ dàng tìm kiếm và liên hệ</p>
              </div>
              <div className="service-card">
                <div className="service-icon">🤝</div>
                <h3>Cộng đồng tin cậy</h3>
                <p>Kết nối với hàng ngàn người mua bán xe điện trên khắp cả nước</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="section-icon">✨</div>
            <h2>Tại sao chọn chúng tôi?</h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-number">01</span>
                <div className="benefit-content">
                  <h4>Minh bạch & Uy tín</h4>
                  <p>Thông tin rõ ràng, chi tiết về từng sản phẩm. Không có phí ẩn hay gian lận</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-number">02</span>
                <div className="benefit-content">
                  <h4>Dễ dàng sử dụng</h4>
                  <p>Giao diện thân thiện, tìm kiếm nhanh chóng, đăng tin đơn giản</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-number">03</span>
                <div className="benefit-content">
                  <h4>Đa dạng lựa chọn</h4>
                  <p>Hàng trăm sản phẩm từ nhiều thương hiệu, mức giá và tình trạng khác nhau</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-number">04</span>
                <div className="benefit-content">
                  <h4>Hỗ trợ 24/7</h4>
                  <p>Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section cta-section">
            <h2>Bắt đầu ngay hôm nay!</h2>
            <p>Hãy tham gia cộng đồng EVMARKETPLAY.VN để mua bán xe điện và pin sạc một cách dễ dàng nhất</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate('/buy')}>
                Mua sản phẩm
              </button>
              <button className="btn-secondary" onClick={() => navigate('/sell')}>
                Bán sản phẩm
              </button>
            </div>
          </section>
        </div>
      </div>
      </div>
    </>
  )
}

export default About

