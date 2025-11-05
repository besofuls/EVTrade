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