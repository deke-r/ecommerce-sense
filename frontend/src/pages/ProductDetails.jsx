"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { productsAPI, cartAPI } from "../services/api"
import axios from "axios"
import styles from "../style/ProductDetails.module.css"

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [userReview, setUserReview] = useState({ star: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      await cartAPI.addItem(id, quantity)
      alert("Product added to cart successfully!")
    } catch (error) {
      console.error("Error adding product to cart:", error)
      alert("Error adding product to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    setAddingToCart(true)
    try {
      await cartAPI.addItem(id, quantity)
      navigate("/checkout")
    } catch (error) {
      console.error("Error buying product:", error)
      alert("Error buying product")
    } finally {
      setAddingToCart(false)
    }
  }

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id)
      setProduct(response.data.product)
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/reviews/${id}`)
      setReviews(response.data.reviews || [])
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const submitReview = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }
  
    if (!userReview.comment.trim()) {
      alert("Please write a comment for your review")
      return
    }
  
    setSubmittingReview(true)
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/reviews`,
        {
          product_id: id,
          star: userReview.star,
          comment: userReview.comment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
  
      // reset form
      setUserReview({ star: 5, comment: "" })
  
      // ✅ refresh both product + reviews
      await fetchReviews()
      await fetchProduct()
  
      alert("Review submitted successfully!")
    } catch (error) {
      
      console.log(error)
      if (error.response?.status === 400 && error.response?.data?.message === "Review already submitted") {
        alert("You have already submitted a review for this product.")
      } else {
        alert("Error submitting review")
      }
    } finally {
      setSubmittingReview(false)
    }
  }
  

  const handleBreadcrumbClick = (path) => {
    navigate(path)
  }

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${styles.star} ${index < rating ? styles.starFilled : styles.starEmpty} ${
          interactive ? styles.starInteractive : ""
        }`}
        onClick={interactive ? () => onStarClick(index + 1) : undefined}
      >
        ★
      </span>
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.errorAlert}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Product not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
   <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
        <ol className={styles.breadcrumb}>
          <li className={styles.breadcrumbItem}>
            <button className={styles.breadcrumbLink} onClick={() => handleBreadcrumbClick("/")}>
              Home
            </button>
          </li>
          <li className={`${styles.breadcrumbItem} ${styles.active}`}>{product.title}</li>
        </ol>
      </nav>

      <div className={styles.container}>
        <div className={styles.productSection}>
          <div className={styles.imageContainer}>
            <img
                       src={`${process.env.REACT_APP_IMAGE_URL}/${product.image}`}
              className={styles.productImage}
              alt={product.title}
            />
          </div>

          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>{product.title}</h1>
            <p className={styles.productDescription}>{product.description}</p>

            <div className={styles.priceSection}>
              <span className={styles.price}>${product.price}</span>
            </div>

            <div className={styles.quantitySection}>
              <label className={styles.quantityLabel}>Quantity:</label>
              <div className={styles.quantityControls}>
                <button className={styles.quantityBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>
                <input
                  type="number"
                  className={styles.quantityInput}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button className={styles.quantityBtn} onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleBuyNow} disabled={addingToCart}>
                {addingToCart ? "Processing..." : "Buy Now"}
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate("/")}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        <div className={styles.reviewsSection}>
          <h2 className={styles.reviewsTitle}>Customer Reviews</h2>

          <div className={styles.reviewForm}>
            <h3 className={styles.reviewFormTitle}>Write a Review</h3>
            <div className={styles.ratingSection}>
              <label className={styles.ratingLabel}>Your Rating:</label>
              <div className={styles.starRating}>
                {renderStars(userReview.star, true, (rating) => setUserReview((prev) => ({ ...prev, star: rating })))}
              </div>
            </div>
            <div className={styles.commentSection}>
              <label className={styles.commentLabel}>Your Comment:</label>
              <textarea
                className={styles.commentTextarea}
                value={userReview.comment}
                onChange={(e) => setUserReview((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about this product..."
                rows="4"
              />
            </div>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={submitReview} disabled={submittingReview}>
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>

          <div className={styles.reviewsList}>
            {reviewsLoading ? (
              <div className={styles.loadingSpinner}>Loading reviews...</div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewRating}>{renderStars(review.star)}</div>
                    <div className={styles.reviewDate}>{formatDate(review.created_at)}</div>
                  </div>
                  <div className={`text-capitalize ${styles.reviewComment}`}>{review.comment}</div>
                  <div className={styles.reviewAuthor}>By User #{review.user_name}</div>
                </div>
              ))
            ) : (
              <div className={styles.noReviews}>No reviews yet. Be the first to review this product!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
