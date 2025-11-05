import React from 'react'

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-section">
          <h4>EVMARKETPLAY.VN</h4>
          <p>Nền tảng mua bán xe điện hàng đầu Việt Nam</p>
        </div>
        <div className="footer-section">
          <h4>Liên kết</h4>
          <p><a href="/about">Về chúng tôi</a></p>
          <p><a href="/products">Sản phẩm</a></p>
          <p><a href="/news">Tin tức</a></p>
        </div>
        <div className="footer-section">
          <h4>Liên hệ</h4>
          <p>Email: contact@evmarketplay.vn</p>
          <p>Hotline: 1900 xxxx</p>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>© 2024 EVMARKETPLAY.VN. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

