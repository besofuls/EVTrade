
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultImage from '../assets/VinFast_VF5_Plus.jpg';
import Header from '../components/Header';
import API_ENDPOINTS from '../services/apiService';
import './BuyCars.css';

function BuyCars() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([5000000, 2000000000]);

  const [listings, setListings] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sortOption, setSortOption] = useState('newest');

  const token = localStorage.getItem('authToken');

  const normalizeBrands = (raw) => {
    const arr = Array.isArray(raw) ? raw : raw?.content ?? [];
    if (!arr.length) return [];
    // Map to { id, name, ...original }
    return arr.map((b, i) => ({
      ...b,
      id: b.id ?? b.brandID ?? b.brandId ?? String(b.brandName ?? `brand-${i}`),
      name: b.brandName ?? b.name ?? String(b.id ?? `brand-${i}`)
    }));
  };

  const normalizeCategories = (raw) => {
    const arr = Array.isArray(raw) ? raw : raw?.content ?? [];
    if (!arr.length) return [];
    return arr.map((c, i) => ({
      ...c,
      id: c.id ?? c.categoryID ?? c.categoryId ?? String(c.categoryName ?? `cat-${i}`),
      name: c.categoryName ?? c.name ?? String(c.id ?? `cat-${i}`)
    }));
  };

  const normalizeListings = (raw) => {
    const arr = Array.isArray(raw) ? raw : raw?.content ?? [];
    return arr.map((p, i) => {
      const id = p.id ?? p.uuid ?? p.productId ?? p.productID ?? p.listingId ?? `product-${i}`;
      const title = p.title ?? p.name ?? p.productTitle ?? p.listingTitle ?? '';
      const price = p.price ?? p.pricing?.price ?? p.listingPrice ?? 0;

      // Possible image fields returned by backend
      const imgs =
        p.images ||
        p.imagesList ||
        p.listingImages ||
        p.listing_image ||
        p.listing_image_list ||
        p.listingImageList ||
        p.imageUrls ||
        [];

      let displayImage = defaultImage;

      if (Array.isArray(imgs) && imgs.length) {
        // prefer explicit primary flag, else first item
        const primary = imgs.find((im) => im.is_primary || im.primary || im.isPrimary) || imgs[0];
        // primary may be string or object { url | path | imageUrl }
        if (primary) {
          if (typeof primary === 'string') displayImage = primary;
          else displayImage = primary.url || primary.path || primary.imageUrl || primary.image || defaultImage;
        }
      } else if (typeof imgs === 'string' && imgs) {
        displayImage = imgs;
      } else if (p.primaryImageUrl) {
        displayImage = p.primaryImageUrl;
      } else if (p.vehicle?.imageUrl) {
        displayImage = p.vehicle.imageUrl;
      }

      const categoryName = p.categoryName ?? p.category?.categoryName ?? p.category?.name ?? '';
      return { ...p, id, title, price, displayImage, categoryName };
    });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const headers = {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        };

        const [brandsRes, catsRes] = await Promise.all([
          fetch(API_ENDPOINTS.get_all_brands, { headers }),
          fetch(API_ENDPOINTS.get_all_categories, { headers })
        ]);

        // parse safely
        const brandsData = await safeJson(brandsRes);
        const catsData = await safeJson(catsRes);

        // handle permission-in-body cases
        if (isPermissionError(brandsData) || isPermissionError(catsData)) {
          localStorage.removeItem('authToken');
          setError('Quyền truy cập bị từ chối. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }

        if (!brandsRes.ok) throw new Error(brandsData?.message || 'Không thể tải danh sách hãng xe');
        if (!catsRes.ok) throw new Error(catsData?.message || 'Không thể tải danh sách danh mục');

        setBrands(normalizeBrands(brandsData));
        setCategories(normalizeCategories(catsData));
        setError(null);
      } catch (err) {
        console.error('fetchFilters error:', err);
        setError(err.message || 'Lỗi khi tải bộ lọc');
      }
    };

    if (token) fetchFilters();
  }, [token, navigate]);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const paramsObj = {
          page: 0,
          size: 20,
          status: 'APPROVED'
        };
        if (selectedCategory !== 'all') paramsObj.categoryId = selectedCategory;
        if (selectedBrand !== 'all') paramsObj.brandId = selectedBrand;
        paramsObj.minPrice = priceRange[0];
        paramsObj.maxPrice = priceRange[1];

        const url = API_ENDPOINTS.getAll_products_post(paramsObj);
        const headers = {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        };

        const res = await fetch(url, { method: 'GET', headers });
        const data = await safeJson(res);

        if (isPermissionError(data)) {
          localStorage.removeItem('authToken');
          setError('Quyền truy cập bị từ chối. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }

        if (!res.ok) throw new Error(data?.message || 'Lỗi khi tải dữ liệu');

        setListings(normalizeListings(data));
        setError(null);
      } catch (err) {
        console.error('fetchListings error:', err);
        setError(err.message || 'Không thể tải danh sách sản phẩm');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchListings();
  }, [token, selectedCategory, selectedBrand, priceRange, navigate]);

  // helper utils
  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const isPermissionError = (body) => {
    if (!body) return false;
    return body.code === 403 || body.msg === 'permission error' || body.error === 'exceptions.UserAuthError';
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  const formatPriceShort = (price) => {
    if (price >= 1000000000) return (price / 1000000000).toFixed(1) + ' tỷ';
    if (price >= 1000000) return (price / 1000000).toFixed(0) + ' triệu';
    return price.toLocaleString('vi-VN') + ' đ';
  };

  const getSortedListings = (items) => {
    switch (sortOption) {
      case 'price-asc':
        return [...items].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case 'price-desc':
        return [...items].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case 'newest':
        return [...items].sort((a, b) => 
          new Date(b.created_at ?? b.createdAt ?? 0) - new Date(a.created_at ?? a.createdAt ?? 0)
        );
      default:
        return items;
    }
  };

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import './BuyCars.css'

function BuyCars() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [priceRange, setPriceRange] = useState([5000000, 2000000000])

  // Mock data - Xe điện đã qua sử dụng
  const products = [
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
      views: 234
    },
    {
      id: 2,
      name: 'VinFast VF8',
      brand: 'VinFast',
      category: 'car',
      year: 2023,
      mileage: '8,500 km',
      price: 1050000000,
      location: 'Hà Nội',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400',
      description: 'Full option, như mới, đi ít',
      views: 567
    },
    {
      id: 3,
      name: 'VinFast VF3',
      brand: 'VinFast',
      category: 'car',
      year: 2024,
      mileage: '3,200 km',
      price: 240000000,
      location: 'Đà Nẵng',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400',
      description: 'Xe mới, đi rất ít, giá tốt',
      views: 892
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
      views: 445
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
      views: 321
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
      views: 1234
    },
    // Pin sạc
    {
      id: 7,
      name: 'Pin Lithium 48V 100Ah',
      brand: 'CATL',
      category: 'battery',
      condition: 'Còn 95% dung lượng',
      price: 25000000,
      location: 'TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
      description: 'Pin chính hãng, còn bảo hành',
      views: 156
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
      views: 89
    }
  ]

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false
    if (selectedBrand !== 'all' && product.brand !== selectedBrand) return false
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false
    return true
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  const formatPriceShort = (price) => {
    if (price >= 1000000000) {
      return (price / 1000000000).toFixed(1) + ' tỷ'
    } else if (price >= 1000000) {
      return (price / 1000000).toFixed(0) + ' triệu'
    }
    return price.toLocaleString('vi-VN') + ' đ'
  }


  return (
    <>
      <Header />
      <div className="buy-cars-page">
        <div className="container-fluid">

          <div className="buy-cars-content">
            <aside className="filter-sidebar">
              <div className="filter-section">
                <h3>Danh mục</h3>
                <div className="filter-options">
                  <label className="filter-option">
                    <input type="radio" name="category" value="all" checked={selectedCategory === 'all'} onChange={(e) => setSelectedCategory('all')} />
                    <span>Tất cả</span>
                  </label>
                  {categories.map((c) => (
                    <label key={`cat-${c.id}`} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        value={String(c.id)}
                        checked={String(selectedCategory) === String(c.id)}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Hãng xe</h3>
                <div className="filter-options">
                  <label className="filter-option">
                    <input type="radio" name="brand" value="all" checked={selectedBrand === 'all'} onChange={(e) => setSelectedBrand('all')} />
                    <span>Tất cả</span>
                  </label>
                  {brands.map((b) => (
                    <label key={`brand-${b.id}`} className="filter-option">
                      <input
                        type="radio"
                        name="brand"
                        value={String(b.id)}
                        checked={String(selectedBrand) === String(b.id)}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Khoảng giá</h3>
                <div className="price-range-display">
                  <span className="price-label">Từ: {formatPriceShort(priceRange[0])}</span>
                  <span className="price-label">Đến: {formatPriceShort(priceRange[1])}</span>
                </div>
                <div className="price-slider-container">
                  <input type="range" min="5000000" max="2000000000" step="5000000" value={priceRange[0]} onChange={(e) => { const v = Number(e.target.value); if (v < priceRange[1]) setPriceRange([v, priceRange[1]]); }} />
                  <input type="range" min="5000000" max="2000000000" step="5000000" value={priceRange[1]} onChange={(e) => { const v = Number(e.target.value); if (v > priceRange[0]) setPriceRange([priceRange[0], v]); }} />
                </div>
              </div>

              <button className="reset-filter-btn" onClick={() => { setSelectedCategory('all'); setSelectedBrand('all'); setPriceRange([5000000, 2000000000]); }}>Xóa bộ lọc</button>
            </aside>

            <main className="products-section">
              <div className="products-header">
                <h2>Sản phẩm ({listings.length})</h2>
                <div className="sort-options">
                  <select 
                    className="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                  </select>
                </div>
              </div>

              {isLoading && <div className="loading-state">Đang tải sản phẩm...</div>}
              {error && <div className="error-state">{error}</div>}

              {!isLoading && !error && (
                <>
                  <div className="products-grid">
                    {getSortedListings(listings).map((p, idx) => (
                      <div key={`product-${p.id ?? idx}`} className="product-card" onClick={() => navigate(`/product/${p.id}`)}>
                        <div className="product-image">
                          <img src={p.displayImage || defaultImage} alt={p.title || p.name || 'product'} />
                          <span className="product-badge">{p.categoryName}</span>
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{p.title || p.name}</h3>
                          <p className="product-price">{formatPrice(p.price ?? 0)}</p>
                          <div className="product-details">
                            {p.categoryName === 'Xe điện' ? (
                              <>
                                <span>🚗 {p.product?.year}</span>
                                <span>📏 {p.product?.odometer} km</span>
                              </>
                            ) : (
                              <span>🔋 {p.product?.condition}</span>
                            )}
                          </div>
                          <p className="product-location">📍 {p.seller?.address || 'N/A'}</p>
                          <p className="product-description">{p.description}</p>
                          <div className="product-footer">
                            <button className="contact-btn" onClick={(e) => { e.stopPropagation(); }}>Liên hệ</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {listings.length === 0 && <div className="no-products"><p>Không tìm thấy sản phẩm phù hợp</p></div>}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default BuyCars;

        <div className="buy-cars-content">
          {/* Sidebar Filter */}
          <aside className="filter-sidebar">
            <div className="filter-section">
              <h3>Danh mục</h3>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === 'all'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  />
                  <span>Tất cả</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    value="car"
                    checked={selectedCategory === 'car'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  />
                  <span>Xe điện</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    value="battery"
                    checked={selectedCategory === 'battery'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  />
                  <span>Pin sạc</span>
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h3>Hãng xe</h3>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="brand"
                    value="all"
                    checked={selectedBrand === 'all'}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  />
                  <span>Tất cả</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="brand"
                    value="VinFast"
                    checked={selectedBrand === 'VinFast'}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  />
                  <span>VinFast</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="brand"
                    value="BYD"
                    checked={selectedBrand === 'BYD'}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  />
                  <span>BYD</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="brand"
                    value="Hyundai"
                    checked={selectedBrand === 'Hyundai'}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  />
                  <span>Hyundai</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="brand"
                    value="Tesla"
                    checked={selectedBrand === 'Tesla'}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  />
                  <span>Tesla</span>
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h3>Khoảng giá</h3>
              <div className="price-range-display">
                <span className="price-label">Từ: {formatPriceShort(priceRange[0])}</span>
                <span className="price-label">Đến: {formatPriceShort(priceRange[1])}</span>
              </div>
              <div className="price-slider-container">
                <input
                  type="range"
                  min="5000000"
                  max="2000000000"
                  step="5000000"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (value < priceRange[1]) {
                      setPriceRange([value, priceRange[1]])
                    }
                  }}
                  className="price-slider price-slider-min"
                />
                <input
                  type="range"
                  min="5000000"
                  max="2000000000"
                  step="5000000"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (value > priceRange[0]) {
                      setPriceRange([priceRange[0], value])
                    }
                  }}
                  className="price-slider price-slider-max"
                />
              </div>
            </div>

            <button 
              className="reset-filter-btn"
              onClick={() => {
                setSelectedCategory('all')
                setSelectedBrand('all')
                setPriceRange([5000000, 2000000000])
              }}
            >
              Xóa bộ lọc
            </button>
          </aside>

          {/* Products Grid */}
          <main className="products-section">
            <div className="products-header">
              <h2>Sản phẩm ({filteredProducts.length})</h2>
              <div className="sort-options">
                <select className="sort-select">
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="popular">Phổ biến</option>
                </select>
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    <span className="product-badge">
                      {product.category === 'car' ? 'Xe điện' : 'Pin sạc'}
                    </span>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">{formatPrice(product.price)}</p>
                    <div className="product-details">
                      {product.category === 'car' ? (
                        <>
                          <span>🚗 {product.year}</span>
                          <span>📏 {product.mileage}</span>
                        </>
                      ) : (
                        <span>🔋 {product.condition}</span>
                      )}
                    </div>
                    <p className="product-location">📍 {product.location}</p>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-views">👁️ {product.views} lượt xem</span>
                      <button className="contact-btn">Liên hệ</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="no-products">
                <p>Không tìm thấy sản phẩm phù hợp</p>
              </div>
            )}
          </main>
        </div>
      </div>
      </div>
    </>
  )
}

export default BuyCars


