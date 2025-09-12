import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../style/productscard.module.css";
import { FaShoppingCart, FaRegHeart, FaHeart, FaStar, FaRegCommentDots } from "react-icons/fa";
import { cartAPI, wishlistAPI } from "../services/api";

const ProductCard = ({image, title, price, oldPrice, discount, rating, reviews, productId, stocks, variant }) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isOutOfStock = stocks <= 0;
  const isLowStock = stocks > 0 && stocks < 5;

  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  const checkWishlistStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await wishlistAPI.check(productId);
      setIsWishlisted(response.data.isWishlisted);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (isOutOfStock) {
      alert("This product is out of stock!");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await cartAPI.addItem(productId, 1);
      window.dispatchEvent(new Event("cartUpdated"));
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error adding product to cart");
      }
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistAPI.remove(productId);
        setIsWishlisted(false);
      } else {
        await wishlistAPI.add(productId);
        setIsWishlisted(true);
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert("Error updating wishlist");
    }
  };

  const getStockMessage = () => {
    if (isOutOfStock) {
      return <span className={styles.outOfStock}>Out of Stock</span>;
    }
    if (isLowStock) {
      return <span className={styles.lowStock}>Only {stocks} left!</span>;
    }
    return null;
  };

  const isList = variant === 'list';

  return (
    <div className={`${styles.card} ${isOutOfStock ? styles.disabled : ''} ${isList ? styles.list : ''}`}>
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
        {discount && <div className={styles.discountBadge}>{discount}% off</div>}
        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>
            <span>Out of Stock</span>
          </div>
        )}
        <button 
          className={styles.wishlistBtn}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? <FaHeart className={styles.heartFilled} /> : <FaRegHeart className={styles.heartEmpty} />}
        </button>
      </div>

      <div className={styles.productInfo}>
        <h6 className={styles.title}>{title}</h6>
        <div className={styles.rating}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < rating ? styles.starFilled : styles.starEmpty} />
            ))}
          </div>
          <span className={styles.reviews}>({reviews})</span>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.currentPrice}>₹{price}</div>
          {oldPrice && <div className={styles.oldPrice}>₹{oldPrice}</div>}
        </div>

        {getStockMessage() && (
          <div className={styles.stockMessage}>
            {getStockMessage()}
          </div>
        )}

        <div className={styles.buttonRow}>
          <button 
            className={`${styles.addToCartBtn} ${isOutOfStock ? styles.disabled : ''}`} 
            onClick={handleAddToCart} 
            disabled={isOutOfStock}
          >
            <FaShoppingCart className="me-1" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;