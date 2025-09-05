import React from "react";
import styles from "../style/productscard.module.css";
import { FaShoppingCart, FaRegHeart, FaBalanceScale, FaStar, FaRegCommentDots } from "react-icons/fa";
import { cartAPI } from "../services/api";

const ProductCard = ({image, title, price, oldPrice, discount, rating, reviews, productId, stocks }) => {
  const isOutOfStock = stocks <= 0;
  const isLowStock = stocks > 0 && stocks < 5;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (isOutOfStock) {
      alert("This product is out of stock!");
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

  const getStockMessage = () => {
    if (isOutOfStock) {
      return <span className={styles.outOfStock}>Out of Stock</span>;
    }
    if (isLowStock) {
      return <span className={styles.lowStock}>Only {stocks} left!</span>;
    }
    return null;
  };

  return (
    <div className={`${styles.card} rounded-4 ${isOutOfStock ? styles.disabled : ''}`}>
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <h5 className={styles.title}>{title}</h5>

      <div className={styles.rating}>
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < rating ? styles.starFilled : styles.starEmpty} />
        ))}
        <span className={styles.reviews}>
          <FaRegCommentDots /> {reviews}
        </span>
      </div>

      <div className={styles.priceSection}>
        {oldPrice && <span className={`${styles.oldPrice} text-muted`}>₹{oldPrice}</span>}
        {discount && <span className={styles.discount}>-{discount}%</span>}
      </div>

      <div className={styles.stockSection}>
        {getStockMessage()}
      </div>

      <div className={styles.footer}>
        <span className={`${styles.price} text-muted`}>Rs.{price}</span>
        <button 
          className={`${styles.cartBtn} ${isOutOfStock ? styles.disabled : ''}`} 
          onClick={handleAddToCart} 
          disabled={isOutOfStock}
          aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
        >
          <FaShoppingCart />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;