import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import styles from '../style/Wishlist.module.css';



const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getAll();
      setWishlistItems(response.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Error removing product from wishlist');
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

  return (
    <div className="container-fluid my-3">


      <div className="row mx-md-2">
        <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
          <ol className={styles.breadcrumb + " d-flex align-items-center"} style={{ marginBottom: 0 }}>
            <li className={styles.breadcrumbItem}>
              <button className={styles.breadcrumbLink} onClick={() => navigate("/")}>
                Home
              </button>
            </li>
            <li className={`${styles.breadcrumbItem} ${styles.active}`}>
              Wishlist
              <span className="ms-2">({wishlistItems.length} items)</span>
            </li>

          </ol>
        </nav>
      </div>


      <div className="row mx-md-1">
       

        <div className="container">
        

          {wishlistItems.length > 0 ? (
            <div className="row">
              {wishlistItems.map((item) => (
                <div key={item.id} className="col-lg-3 col-md-6 mb-4">
                  <div className={styles.wishlistItem}>
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
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                      title="Remove from wishlist"
                    >
                      <i className="fas fa-heart-broken"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyWishlist}>
              <div className={styles.emptyContent}>
                <i className="fas fa-heart"></i>
                <h4>Your wishlist is empty</h4>
                <p>Save items you love for later by clicking the heart icon</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
