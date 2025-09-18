import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import styles from '../style/CategorySection.module.css';

const BrandSection = ({ brand, onProductClick, onViewAllClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrandProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getByBrand(brand.id);
      // Take only first 5 products for preview
      setProducts(response.data.products.slice(0, 5));
    } catch (err) {
      console.error(`Error fetching products for brand ${brand.brand_name}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [brand.id, brand.brand_name]);

  useEffect(() => {
    fetchBrandProducts();
  }, [fetchBrandProducts]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{brand.brand_name}</h2>
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't show empty sections
  }

  return (
    <section className='container-fluid my-3'>
      <div className="row mx-md-1 shadow-sm" style={{backgroundColor:'white'}}>
        <h3 className={styles.sectionTitle}>{brand.brand_name}</h3>
        <p className='pb-0 mb-0'>Discover amazing products from {brand.brand_name}</p>

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

        <div className='row pb-3'>
          <div className='col-12 d-flex justify-content-center'>
            <button 
              className='btn btn-outline-primary rounded-4 f_14 fw-semibold border-0'
              onClick={onViewAllClick}
            >
              View All
              <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
