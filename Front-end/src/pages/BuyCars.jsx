import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import apiService from "../services/apiService";
import "./BuyCars.css";

function BuyCars() {
  const navigate = useNavigate();

  // Bộ lọc
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceRange, setPriceRange] = useState([5000000, 2000000000]);

  // Dữ liệu
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);

  // thêm state để giữ tên của top 5 để xử lý "khác"
  const [topBrandNames, setTopBrandNames] = useState(new Set());
  const [topCategoryNames, setTopCategoryNames] = useState(new Set());

  // Trạng thái
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy danh sách bài đăng để lọc top brand/category
  useEffect(() => {
    async function fetchFiltersAndListings() {
      try {
        setLoading(true);
        // Lấy tất cả brands, categories và bài đăng đang active
        const [brandsData, categoriesData, listingsData] = await Promise.all([
          apiService.getBrands(),
          apiService.getCategories(),
          apiService.searchProductPosts({
            status: "ACTIVE",
            page: 0,
            size: 1000,
          }),
        ]);
        const posts = listingsData.content || [];

        // Đếm số lượng bài đăng theo brand/category
        const brandCount = {};
        const categoryCount = {};
        posts.forEach((item) => {
          brandCount[item.brandName] = (brandCount[item.brandName] || 0) + 1;
          categoryCount[item.categoryName] =
            (categoryCount[item.categoryName] || 0) + 1;
        });

        // Lọc top 5 brand
        const topBrands = brandsData
          .map((b) => ({
            ...b,
            count: brandCount[b.brandName] || 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Lọc top 5 category
        const topCategories = categoriesData
          .map((c) => ({
            ...c,
            count: categoryCount[c.categoryName] || 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setBrands(topBrands);
        setCategories(topCategories);

        // lưu tên top để xử lý ô "Khác"
        setTopBrandNames(new Set(topBrands.map((b) => b.brandName)));
        setTopCategoryNames(new Set(topCategories.map((c) => c.categoryName)));
      } catch (err) {
        setError("Không thể tải bộ lọc");
      } finally {
        setLoading(false);
      }
    }
    fetchFiltersAndListings();
  }, []);

  // Lấy danh sách bài đăng theo bộ lọc
  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError("");
      try {
        const needClientFilter =
          selectedBrand === "other" || selectedCategory === "other";

        // Lấy tổng số sản phẩm trước
        const firstPageParams = {
          status: "ACTIVE",
          page: 0,
          size: 50, // lấy nhiều nhất có thể
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        };
        if (selectedCategory !== "all" && selectedCategory !== "other")
          firstPageParams.categoryId = selectedCategory;
        if (selectedBrand !== "all" && selectedBrand !== "other")
          firstPageParams.brandId = selectedBrand;

        const firstPage = await apiService.searchProductPosts(firstPageParams);
        let allContent = firstPage.content || [];
        const totalPages = firstPage.totalPages || 1;

        // Nếu còn nhiều trang, gọi tiếp các trang còn lại
        for (let page = 1; page < totalPages; page++) {
          const params = { ...firstPageParams, page };
          const nextPage = await apiService.searchProductPosts(params);
          allContent = allContent.concat(nextPage.content || []);
        }

        // Nếu chọn "other" cho brand/category, loại bỏ các item thuộc top 5 tương ứng
        if (selectedBrand === "other" && topBrandNames.size > 0) {
          allContent = allContent.filter((it) => !topBrandNames.has(it.brandName));
        }
        if (selectedCategory === "other" && topCategoryNames.size > 0) {
          allContent = allContent.filter(
            (it) => !topCategoryNames.has(it.categoryName)
          );
        }
        
        setListings(allContent);
        setTotal(allContent.length);
      } catch (err) {
        setError(err.message || "Không thể tải sản phẩm");
        setListings([]);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [
    selectedCategory,
    selectedBrand,
    priceRange,
    topBrandNames,
    topCategoryNames,
  ]);

  // Hiển thị giá ngắn gọn
  const formatPriceShort = (price) => {
    if (price >= 1000000000) return (price / 1000000000).toFixed(1) + " tỷ";
    if (price >= 1000000) return (price / 1000000).toFixed(0) + " triệu";
    return price.toLocaleString("vi-VN") + " đ";
  };

  // Hiển thị giá đầy đủ
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + " đ";

  return (
    <>
      <Header />
      <div className="buy-cars-page">
        <div className="container-fluid">
          <div className="buy-cars-content">
            {/* Sidebar bộ lọc */}
            <aside className="filter-sidebar">
              <div className="filter-section">
                <h3>Danh mục</h3>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      value="all"
                      checked={selectedCategory === "all"}
                      name="category"
                      onChange={() => setSelectedCategory("all")}
                    />
                    <span>Tất cả</span>
                  </label>

                  {categories.map((c) => (
                    <label key={c.categoryId} className="filter-option">
                      <input
                        type="radio"
                        value={c.categoryId}
                        checked={
                          String(selectedCategory) === String(c.categoryId)
                        }
                        name="category"
                        onChange={() => setSelectedCategory(c.categoryId)}
                      />
                      <span>
                        {c.categoryName}{" "}
                        <span style={{ color: "#999", fontSize: "12px" }}>
                          ({c.count})
                        </span>
                      </span>
                    </label>
                  ))}

                  {/* ô "Khác" cho category */}
                  <label className="filter-option">
                    <input
                      type="radio"
                      value="other"
                      checked={selectedCategory === "other"}
                      name="category"
                      onChange={() => setSelectedCategory("other")}
                    />
                    <span>
                      Khác{" "}
                    </span>
                  </label>
                </div>
              </div>
              <div className="filter-section">
                <h3>Hãng xe</h3>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      value="all"
                      checked={selectedBrand === "all"}
                      name="brand"
                      onChange={() => setSelectedBrand("all")}
                    />
                    <span>Tất cả</span>
                  </label>

                  {brands.map((b) => (
                    <label key={b.brandId} className="filter-option">
                      <input
                        type="radio"
                        value={b.brandId}
                        checked={String(selectedBrand) === String(b.brandId)}
                        name="brand"
                        onChange={() => setSelectedBrand(b.brandId)}
                      />
                      <span>
                        {b.brandName}{" "}
                        <span style={{ color: "#999", fontSize: "12px" }}>
                          ({b.count})
                        </span>
                      </span>
                    </label>
                  ))}

                  {/* ô "Khác" cho brand */}
                  <label className="filter-option">
                    <input
                      type="radio"
                      value="other"
                      checked={selectedBrand === "other"}
                      name="brand"
                      onChange={() => setSelectedBrand("other")}
                    />
                    <span>
                      Khác{" "}
                    </span>
                  </label>
                </div>
              </div>
              <div className="filter-section">
                <h3>Khoảng giá</h3>
                <div className="price-range-display">
                  <span className="price-label">
                    Từ: {formatPriceShort(priceRange[0])}
                  </span>
                  <span className="price-label">
                    Đến: {formatPriceShort(priceRange[1])}
                  </span>
                </div>
                <div className="price-slider-container">
                  <input
                    min="5000000"
                    max="20000000000"
                    step="5000000"
                    type="range"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v < priceRange[1]) setPriceRange([v, priceRange[1]]);
                    }}
                  />
                  <input
                    min="5000000"
                    max="20000000000"
                    step="5000000"
                    type="range"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v > priceRange[0]) setPriceRange([priceRange[0], v]);
                    }}
                  />
                </div>
              </div>
              <button
                className="reset-filter-btn"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                  setPriceRange([5000000, 2000000000]);
                }}
              >
                Xóa bộ lọc
              </button>
            </aside>
            {/* Danh sách sản phẩm */}
            <main className="products-section">
              <div className="products-header">
                <h2>Sản phẩm ({total})</h2>
              </div>
              {loading && (
                <div className="loading-state">Đang tải sản phẩm...</div>
              )}
              {error && <div className="error-state">{error}</div>}
              {!loading && !error && (
                <div className="products-grid">
                  {listings.length > 0 ? (
                    listings.map((item) => (
                      <div
                        key={item.id}
                        className="product-card"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        <div className="product-image">
                          <img
                            src={
                              item.primaryImageUrl ||
                              (item.images &&
                                item.images.find((im) => im.isPrimary)?.url) ||
                              (item.images && item.images[0]?.url) ||
                              "/no-image.png" // dùng ảnh mặc định local
                            }
                            alt={item.title}
                            onError={(e) => {
                              // Chỉ đổi src sang ảnh local, không dùng link placeholder ngoài
                              e.target.onerror = null;
                              e.target.src = "/no-image.png";
                            }}
                          />
                          <span className="product-badge">
                            {item.categoryName}
                          </span>
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{item.title}</h3>
                          <p className="product-price">
                            {formatPrice(item.price)}
                          </p>
                          <div className="product-details">
                            {item.product?.model && (
                              <span>🚗 {item.product.model}</span>
                            )}
                            {item.product?.year && (
                              <span>📅 {item.product.year}</span>
                            )}
                            {item.product?.condition && (
                              <span>🔋 {item.product.condition}</span>
                            )}
                          </div>
                          <p className="product-description">
                            {item.description}
                          </p>
                          <div className="product-footer">
                            <button
                              className="contact-btn"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Đặt mua
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-products">
                      <p>Không tìm thấy sản phẩm phù hợp</p>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default BuyCars;
