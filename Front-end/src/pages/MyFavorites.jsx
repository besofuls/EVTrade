import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import apiService from "../services/apiService";
import { useToast } from "../contexts/ToastContext";
import "./MyFavorites.css";

function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await apiService.getFavorites();
      setFavorites(data || []);
    } catch (error) {
      showToast(error.message || "Không thể tải danh sách yêu thích", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId) => {
    try {
      await apiService.removeFavorite(listingId);
      setFavorites(favorites.filter(item => item.id !== listingId));
      showToast("Đã xóa khỏi danh sách yêu thích", "success");
    } catch (error) {
      showToast(error.message || "Không thể xóa bài đăng", "error");
    }
  };

  const handleViewDetail = (listingId) => {
    navigate(`/product/${listingId}`);
  };

  return (
    <div className="my-favorites-page">
      <Header />
      <div className="my-favorites-container">
        <h1 className="page-title">Bài đăng đã thích</h1>
        
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">Bạn chưa thích bài đăng nào.</div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((item) => (
              <div key={item.id} className="favorite-card">
                <div className="favorite-image-container" onClick={() => handleViewDetail(item.id)}>
                  <img 
                    src={item.primaryImageUrl || (item.images && item.images.length > 0 ? item.images[0].url : "https://via.placeholder.com/300")} 
                    alt={item.title} 
                    className="favorite-image"
                  />
                </div>
                <div className="favorite-info">
                  <h3 className="favorite-title" onClick={() => handleViewDetail(item.id)}>{item.title}</h3>
                  <p className="favorite-price">{item.price?.toLocaleString()}₫</p>
                  <div className="favorite-actions">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetail(item.id)}
                    >
                      Xem chi tiết
                    </button>
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveFavorite(item.id)}
                    >
                      Bỏ thích
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default MyFavorites;
