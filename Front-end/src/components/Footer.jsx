import React from 'react'
import './Footer.css'

function Footer() {
  return (
    <footer className="home-footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h3 className="footer-logo">EVMARKETPLAY.VN</h3>
            <p>Nền tảng mua bán xe điện hàng đầu Việt Nam</p>
          </div>
          <div className="col-md-4">
            <h4>Liên kết</h4>
            <ul className="footer-links">
              <li><a href="#">Về chúng tôi</a></li>
              <li><a href="#">Sản phẩm</a></li>
              <li><a href="#">Tin tức</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h4>Liên hệ</h4>
            <p>Email: contact@evmarketplay.vn</p>
            <p>Hotline: 1900 xxxx</p>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12 text-center">
            <p className="copyright">© 2024 EVMARKETPLAY.VN. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

