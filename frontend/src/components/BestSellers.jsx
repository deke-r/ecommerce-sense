import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import styles from '../style/BestSellers.module.css';

const BestSellers = ({ onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBestSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getAll();
      // Sort by reviews count and take top 6
      const sorted = response.data.products
        .sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0))
        .slice(0, 6);
      setProducts(sorted);
    } catch (err) {
      console.error("Error fetching best sellers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBestSellers();
  }, [fetchBestSellers]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Best Sellers</h2>
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error loading best sellers. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Best Sellers</h2>
          <p className={styles.sectionSubtitle}>Most popular items this week</p>
        </div>
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

      {products.length === 0 && (
        <div className="row">
          <div className="col-12 text-center">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No best sellers available at the moment.
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BestSellers;


