import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../style/productcardrow.module.css";
import { FaShoppingCart, FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { cartAPI, wishlistAPI } from "../services/api";

const ProductCardRow = ({ image, title, price, oldPrice, discount, rating = 0, reviews = 0, productId, stocks = 0 }) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isOutOfStock = stocks <= 0;
  const isLowStock = stocks > 0 && stocks < 5;

  useEffect(() => {
    const checkWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await wishlistAPI.check(productId);
        setIsWishlisted(res.data.isWishlisted);
      } catch {}
    };
    checkWishlist();
  }, [productId]);

  const goToDetails = () => navigate(`/product/${productId}`);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      await cartAPI.addItem(productId, 1);
      window.dispatchEvent(new Event("cartUpdated"));
      alert("Product added to cart");
    } catch {
      alert("Error adding to cart");
    }
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(productId);
        setIsWishlisted(false);
      } else {
        await wishlistAPI.add(productId);
        setIsWishlisted(true);
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {
      alert("Error updating wishlist");
    }
  };

  return (
    <div className={`${styles.rowCard} ${isOutOfStock ? styles.disabled : ""}`} onClick={goToDetails}>
      <div className={styles.left}>
      <div className={styles.imageWrap}>
        {discount ? <div className={styles.badge}>{discount}% off</div> : null}
        <img src={image} alt={title} className={styles.image} />
        <button
          className={`${styles.wishlist} ${isWishlisted ? styles.wishlistActive : ""}`}
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? <FaHeart className={styles.heartFilled} /> : <FaRegHeart className={styles.heartEmpty} />}
        </button>
      </div>
      </div>

      <div className={styles.middle}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < rating ? styles.starFilled : styles.starEmpty} />
            ))}
          </div>
          <span className={styles.reviews}>({reviews})</span>
        </div>
        {isOutOfStock ? <div className={styles.outOfStock}>Out of Stock</div> : isLowStock ? <div className={styles.lowStock}>Only {stocks} left</div> : null}
      </div>

      <div className={styles.right} onClick={(e) => e.stopPropagation()}>
        <div className={styles.priceBlock}>
          <div className={styles.price}>₹{price}</div>
          {oldPrice ? <div className={styles.oldPrice}>₹{oldPrice}</div> : null}
        </div>
        <button className={`${styles.addToCart} ${isOutOfStock ? styles.disabled : ""}`} disabled={isOutOfStock} onClick={handleAddToCart}>
          <FaShoppingCart /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCardRow;
