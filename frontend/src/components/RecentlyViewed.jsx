import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recentlyViewedAPI } from '../services/api';
import ProductCard from './ProductCard';
import styles from '../style/RecentlyViewed.module.css';

const RecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await recentlyViewedAPI.getAll();
      setRecentlyViewed(response.data.recentlyViewed);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className={styles.recentlyViewedContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recently Viewed</h3>
      </div>
      
      <div className="row g-3 mx-2">
        {recentlyViewed.slice(0, 4).map((item) => (
          <div key={item.id} className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2">
            <div onClick={() => handleProductClick(item.product_id)} className={styles.productClickable}>
              <ProductCard
                image={`${process.env.REACT_APP_IMAGE_URL}/${item.image}`}
                title={item.title}
                price={item.price}
                rating={item.average_rating || 0}
                reviews={item.reviews_count || 0}
                productId={item.product_id}
                stocks={item.stocks}
              />
            </div>
          </div>
        ))}
      </div>
      </div>
  
  );
};

export default RecentlyViewed;
