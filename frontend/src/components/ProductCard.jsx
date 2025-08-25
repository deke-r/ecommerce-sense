import React from "react";
import styles from "../style/productscard.module.css";
import { FaShoppingCart, FaRegHeart, FaBalanceScale, FaStar, FaRegCommentDots } from "react-icons/fa";

const ProductCard = ({image, title, price, oldPrice, discount, rating, reviews }) => {
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
        {oldPrice && <span className={`${styles.oldPrice} text-muted`}>Rs.{oldPrice}</span>}
        {discount && <span className={styles.discount}>-{discount}%</span>}
      </div>

      <div className={styles.footer}>
        <span className={`${styles.price} text-muted`}>Rs.{price}</span>
        <button className={styles.cartBtn}>
          <FaShoppingCart />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
