import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import './Search.css'

function Search() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mock data
  const allProducts = [
    {
      id: 1,
      name: 'VinFast VF5 Plus',
      brand: 'VinFast',
      category: 'car',
      year: 2023,
      mileage: '15,000 km',
      price: 458000000,
      location: 'TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400',
      description: 'Xe đẹp, mới 98%, bảo hành chính hãng',
      views: 234,
      postedTime: '2 giờ trước'
    },
    {
      id: 2,
      name: 'VinFast VF8 Eco',
      brand: 'VinFast',
      category: 'car',
      year: 2023,
      mileage: '8,500 km',
      price: 1050000000,
      location: 'Hà Nội',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400',
      description: 'Full option, như mới, đi ít',
      views: 567,
      postedTime: '5 giờ trước'
    },
    {
      id: 3,
      name: 'VinFast VF3 Mini',
      brand: 'VinFast',
      category: 'car',
      year: 2024,
      mileage: '3,200 km',
      price: 240000000,
      location: 'Đà Nẵng',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400',
      description: 'Xe mới, đi rất ít, giá tốt',
      views: 892,
      postedTime: '1 ngày trước'
    },
    {
      id: 4,
      name: 'BYD Atto 3',
      brand: 'BYD',
      category: 'car',
      year: 2023,
      mileage: '12,000 km',
      price: 765000000,
      location: 'TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      description: 'Xe đẹp, bảo dưỡng định kỳ',
      views: 445,
      postedTime: '3 giờ trước'
    },
    {
      id: 5,
      name: 'Hyundai Kona Electric',
      brand: 'Hyundai',
      category: 'car',
      year: 2022,
      mileage: '25,000 km',
      price: 680000000,
      location: 'Bình Dương',
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
      description: 'Pin tốt, đi êm, tiết kiệm',
      views: 321,
      postedTime: '1 ngày trước'
    },
    {
      id: 6,
      name: 'Tesla Model 3',
      brand: 'Tesla',
      category: 'car',
      year: 2021,
      mileage: '35,000 km',
      price: 1250000000,
      location: 'Hà Nội',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
      description: 'Autopilot, full option',
      views: 1234,
      postedTime: '2 ngày trước'
    },
    {
      id: 7,
      name: 'Pin Lithium 48V 100Ah',
      brand: 'CATL',
      category: 'battery',
      condition: 'Còn 95% dung lượng',
      price: 25000000,
      location: 'TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
      description: 'Pin chính hãng, còn bảo hành 2 năm',
      views: 156,
      postedTime: '6 giờ trước'
    },
    {
      id: 8,
      name: 'Bộ Pin Tesla 75kWh',
      brand: 'Tesla',
      category: 'battery',
      condition: 'Còn 90% dung lượng',
      price: 180000000,
      location: 'Hà Nội',
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
      description: 'Pin tháo xe, hoạt động tốt',
      views: 89,
      postedTime: '12 giờ trước'
    },
    {
      id: 9,
      name: 'Pin LG 60kWh',
      brand: 'LG Chem',
      category: 'battery',
      condition: 'Còn 92% dung lượng',
      price: 95000000,
      location: 'Đà Nẵng',
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
      description: 'Pin chất lượng cao, bảo hành 1 năm',
      views: 203,
      postedTime: '8 giờ trước'
    }
  ]

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🔍', count: allProducts.length },
    { id: 'car', name: 'Xe điện', icon: '🚗', count: allProducts.filter(p => p.category === 'car').length },
    { id: 'battery', name: 'Pin sạc', icon: '🔋', count: allProducts.filter(p => p.category === 'battery').length }
  ]

  const filteredProducts = allProducts.filter(product => {
    const matchesQuery = query === '' || 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

    return matchesQuery && matchesCategory
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  return (
    <>
      <Header />
      <div className="search-page">
        <div className="container-fluid">
        {/* Categories Banner */}
        <div className="categories-banner">
          <h2>Danh mục sản phẩm</h2>
          <div className="category-grid">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`category-card ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div className="category-icon">{cat.icon}</div>
                <div className="category-info">
                  <h3>{cat.name}</h3>
                  <p>{cat.count} sản phẩm</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="search-results-section">
          <div className="results-header">
            <h2>
              {query ? `Kết quả tìm kiếm cho "${query}"` : 'Tất cả sản phẩm'}
              <span className="results-count">({filteredProducts.length} sản phẩm)</span>
            </h2>
            <div className="sort-options">
              <select className="sort-select">
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="popular">Phổ biến nhất</option>
              </select>
            </div>
          </div>

          {/* Products List */}
          {filteredProducts.length > 0 ? (
            <div className="products-list">
              {filteredProducts.map(product => (
                <div key={product.id} className="search-product-card">
                  <div className="product-image-wrapper">
                    <img src={product.image} alt={product.name} />
                    <span className="category-badge">
                      {product.category === 'car' ? '🚗 Xe điện' : '🔋 Pin sạc'}
                    </span>
                  </div>
                  
                  <div className="product-details-wrapper">
                    <div className="product-main-info">
                      <h3 className="product-title">{product.name}</h3>
                      <p className="product-price-large">{formatPrice(product.price)}</p>
                      
                      <div className="product-specs">
                        {product.category === 'car' ? (
                          <>
                            <span className="spec-item">📅 {product.year}</span>
                            <span className="spec-item">📏 {product.mileage}</span>
                            <span className="spec-item">🏭 {product.brand}</span>
                          </>
                        ) : (
                          <>
                            <span className="spec-item">🔋 {product.condition}</span>
                            <span className="spec-item">🏭 {product.brand}</span>
                          </>
                        )}
                      </div>

                      <p className="product-desc">{product.description}</p>

                      <div className="product-meta">
                        <span className="meta-item">📍 {product.location}</span>
                        <span className="meta-item">👁️ {product.views} lượt xem</span>
                        <span className="meta-item">🕐 {product.postedTime}</span>
                      </div>
                    </div>

                    <div className="product-actions">
                      <button className="btn-view-details">Xem chi tiết</button>
                      <button className="btn-contact">Liên hệ</button>
                      <button className="btn-favorite">❤️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>Không tìm thấy kết quả</h3>
              <p>Hãy thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm</p>
              <button className="btn-view-all" onClick={() => { setQuery(''); setSelectedCategory('all'); }}>
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}

export default Search

