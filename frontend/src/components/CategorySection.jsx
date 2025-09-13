import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import styles from '../style/CategorySection.module.css';

const CategorySection = ({ category, onProductClick, onViewAllClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategoryProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getByCategory(category.id);
      // Take only first 5 products for preview
      setProducts(response.data.products.slice(0, 5));
    } catch (err) {
      console.error(`Error fetching products for category ${category.name}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category.id, category.name]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{category.name}</h2>
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't show empty sections
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{category.name}</h2>
          <p className={styles.sectionSubtitle}>{category.description}</p>
        </div>
        <button 
          className={styles.viewAllBtn}
          onClick={onViewAllClick}
        >
          View All
          <i className="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
      
      <div className="row g-3 mx-2">
        {products.map((product) => (
          <div key={product.id} className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2">
            <div onClick={() => onProductClick(product.id)} className={styles.productClickable}>
              <ProductCard
                image={`${process.env.REACT_APP_IMAGE_URL}/${product.image}`}
                title={product.title}
                price={product.price}
                oldPrice={product.oldPrice}
                discount={product.discount}
                rating={product.average_rating || 0}
                reviews={product.reviews ? product.reviews.length : 0}
                productId={product.id}
                stocks={product.stocks || 0}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
