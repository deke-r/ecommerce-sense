import React from "react";
import styles from "../style/productscard.module.css";
import { FaShoppingCart, FaRegHeart, FaBalanceScale, FaStar, FaRegCommentDots } from "react-icons/fa";
import { cartAPI } from "../services/api";

const ProductCard = ({image, title, price, oldPrice, discount, rating, reviews, productId }) => {
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await cartAPI.addItem(productId, 1);
      window.dispatchEvent(new Event("cartUpdated"));
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding product to cart");
    }
  };

  return (
    <div className={`${styles.card} rounded-4`}>
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
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

      <div className={styles.footer}>
        <span className={`${styles.price} text-muted`}>Rs.{price}</span>
        <button className={styles.cartBtn} onClick={handleAddToCart} aria-label="Add to cart">
          <FaShoppingCart />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;