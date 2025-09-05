import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from './ProductCard';
import styles from '../style/SimilarItems.module.css';

const SimilarItems = ({ categoryId, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const itemsPerView = 4; // Number of items visible at once
  const maxIndex = Math.max(0, products.length - itemsPerView);

  useEffect(() => {
    if (!categoryId) return;

    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getByCategory(categoryId);
        // Filter out the current product and limit to 8-10 items
        const filteredProducts = response.data.products
          .filter(product => product.id !== parseInt(currentProductId))
          .slice(0, 10);
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [categoryId, currentProductId]);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className={styles.similarItemsContainer}>
        <div className={styles.similarItemsHeader}>
          <h3 className={styles.similarItemsTitle}>Similar Items</h3>
        </div>
        <div className={styles.loadingContainer}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={styles.similarItemsContainer}>
      <div className={styles.similarItemsHeader}>
        <h3 className={styles.similarItemsTitle}>Similar Items</h3>
        <div className={styles.carouselControls}>
          <button 
            className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
            onClick={prevSlide}
            disabled={currentIndex === 0}
            aria-label="Previous items"
          >
            ‹
          </button>
          <button 
            className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            aria-label="Next items"
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.carouselContainer}>
        <div 
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className={styles.carouselItem}
              onClick={() => handleProductClick(product.id)}
            >
              <ProductCard
                image={`${process.env.REACT_APP_IMAGE_URL}/${product.image}`}
                title={product.title}
                price={product.price}
                oldPrice={product.old_price}
                discount={product.discount}
                rating={product.rating || 0}
                reviews={product.reviews_count || 0}
                productId={product.id}
                stocks={product.stocks}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {products.length > itemsPerView && (
        <div className={styles.dotsContainer}>
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarItems;
