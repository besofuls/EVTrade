import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import apiService from '../services/apiService'
import Header from '../components/Header'
import './Search.css'

function Search() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const location = useLocation()
  const navigate = useNavigate()

  // Initialize query from URL and always use URL param when calling API
  const getQueryFromLocation = () => new URLSearchParams(location.search).get('q') || ''

  const [query, setQuery] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('q') || ''
    } catch {
      return ''
    }
  })

  // Fetch products from API when sort or URL query changes
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      setError('')
      try {
        const q = getQueryFromLocation()
        // sync local state for display
        setQuery(q)

        const params = {
          status: 'ACTIVE',
          size: 50,
          sortBy: sort === 'newest' ? 'createdAt' : 'price',
          sortDir: sort === 'price-asc' ? 'asc' : sort === 'price-desc' ? 'desc' : 'desc',
          keyword: q // <-- gửi q vào keyword
        }
        const res = await apiService.searchProductPosts(params)
        setProducts(res.content || [])
      } catch (err) {
        setError('Không thể tải sản phẩm')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [sort, location.search]) // depend on location.search so header navigate triggers fetch

  // Category mapping
  const categoryMap = [
    { id: 'all', name: 'Tất cả', icon: '🔍' },
    { id: 'car', name: 'Xe điện', icon: '🚗' },
    { id: 'battery', name: 'Pin sạc', icon: '🔋' }
  ]

  // Category filter logic
  const filteredProducts = products.filter(item => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'car')
      return ['SUV', 'CUV', 'Hatchback', 'Sedan/Saloon'].includes(item.categoryName)
    if (selectedCategory === 'battery')
      return ['Lithium-ion', 'Solid-state'].includes(item.categoryName)
    return true
  })

  // Category counts
  const categoryCounts = {
    all: products.length,
    car: products.filter(item =>
      ['SUV', 'CUV', 'Hatchback', 'Sedan/Saloon'].includes(item.categoryName)
    ).length,
    battery: products.filter(item =>
      ['Lithium-ion', 'Solid-state'].includes(item.categoryName)
    ).length
  }

  // Format price
  const formatPrice = price =>
    price ? new Intl.NumberFormat('vi-VN').format(price) + ' đ' : 'Liên hệ'

  // Handler chuyển trang chi tiết sản phẩm
  const goToDetail = id => {
    navigate(`/product/${id}`)
  }

  return (
    <>
      <Header />
      <div className="search-page">
        <div className="container-fluid">
          {/* Categories Banner */}
          <div className="categories-banner">
            <h2>Danh mục sản phẩm</h2>
            <div className="category-grid">
              {categoryMap.map(cat => (
                <div
                  key={cat.id}
                  className={`category-card ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <div className="category-icon">{cat.icon}</div>
                  <div className="category-info">
                    <h3>{cat.name}</h3>
                    <p>{categoryCounts[cat.id]} sản phẩm</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results Header */}
          <div className="results-header">
            <h2>
              Kết quả tìm kiếm cho "{query}"
              <span className="results-count">({filteredProducts.length} sản phẩm)</span>
            </h2>
            <div className="sort-options">
              <select
                className="sort-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="popular">Phổ biến nhất</option>
              </select>
            </div>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="no-results">Đang tải sản phẩm...</div>
          ) : error ? (
            <div className="no-results">{error}</div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-list">
              {filteredProducts.map(product => (
                <div key={product.id} className="search-product-card">
                  <div
                    className="product-image-wrapper"
                    style={{ cursor: 'pointer' }}
                    onClick={() => goToDetail(product.id)}
                  >
                    <img
                      src={product.primaryImageUrl || product.images?.[0]?.url || 'https://via.placeholder.com/300x250?text=No+Image'}
                      alt={product.title}
                    />
                    <span className="category-badge">
                      {['SUV', 'CUV', 'Hatchback', 'Sedan/Saloon'].includes(product.categoryName)
                        ? '🚗 Xe điện'
                        : ['Lithium-ion', 'Solid-state'].includes(product.categoryName)
                        ? '🔋 Pin sạc'
                        : product.categoryName}
                    </span>
                  </div>
                  <div className="product-details-wrapper">
                    <div className="product-main-info">
                      <h3
                        className="product-title"
                        style={{ cursor: 'pointer', color: '#007bff' }}
                        onClick={() => goToDetail(product.id)}
                      >
                        {product.title}
                      </h3>
                      <p className="product-price-large">{formatPrice(product.price)}</p>
                      <div className="product-specs">
                        {product.product && (
                          <>
                            <span className="spec-item">📅 {product.product.year}</span>
                            <span className="spec-item">🏭 {product.brandName}</span>
                            <span className="spec-item">🎨 {product.product.color}</span>
                            <span className="spec-item">⚡ {product.product.condition}</span>
                          </>
                        )}
                      </div>
                      <p className="product-desc">{product.description}</p>
                      <div className="product-meta">
                        <span className="meta-item">👤 {product.seller?.username}</span>
                        <span className="meta-item">🕐 {new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="product-actions">
                      <button
                        className="btn-view-details"
                        onClick={() => goToDetail(product.id)}
                      >
                        Xem chi tiết
                      </button>
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
    </>
  )
}

export default Search

