import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reviewsAPI } from '../services/api'
import ReviewForm from '../components/ReviewForm'
import styles from '../style/AllReviews.module.css'

const AllReviews = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState({ average: 0, total: 0, breakdown: {} })
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userHasReviewed, setUserHasReviewed] = useState(false)

  useEffect(() => {
    fetchReviews()
    checkUserReview()
  }, [productId, currentPage])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await reviewsAPI.getAllByProduct(productId, currentPage, 10)
      setReviews(response.data.reviews || [])
      setProduct(response.data.product)
      setRating({
        average: response.data.rating?.average || 0,
        total: response.data.rating?.total || 0,
        breakdown: response.data.rating?.distribution || {}
      })
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserReview = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      // Check if user has already reviewed this product
      const response = await reviewsAPI.getAllByProduct(productId, 1, 100)
      const userReviews = response.data.reviews.filter(review => 
        review.user_id === JSON.parse(localStorage.getItem('user'))?.id
      )
      setUserHasReviewed(userReviews.length > 0)
    } catch (error) {
      console.error("Error checking user review:", error)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${styles.star} ${index < rating ? styles.starFilled : styles.starEmpty}`}
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

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleWriteReview = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    setShowReviewForm(true)
  }

  const handleReviewSubmitted = () => {
    setShowReviewForm(false)
    setUserHasReviewed(true)
    fetchReviews() // Refresh reviews
  }

  const handleCancelReview = () => {
    setShowReviewForm(false)
  }

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.pageBtn} ${i === currentPage ? styles.pageBtnActive : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }

    return (
      <div className={styles.pagination}>
        <button
          className={`${styles.pageBtn} ${styles.pageBtnNav}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrevPage}
        >
          Previous
        </button>
        {pages}
        <button
          className={`${styles.pageBtn} ${styles.pageBtnNav}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
        >
          Next
        </button>
      </div>
    )
  }

  const renderRatingDistribution = () => {
    if (!rating || rating.total === 0) return null

    const keyMap = { 5: 'five', 4: 'four', 3: 'three', 2: 'two', 1: 'one' }
    const getCount = (star) => rating.breakdown?.[keyMap[star]] || 0

    return (
      <div className={styles.ratingDistribution}>
        <h4>Rating Distribution</h4>
        {[5, 4, 3, 2, 1].map(star => {
          const count = getCount(star)
          const percentage = rating.total > 0 ? Math.round((count / rating.total) * 100) : 0
          
          return (
            <div key={star} className={styles.ratingBar}>
              <span className={styles.ratingLabel}>{star}★</span>
              <div className={styles.ratingBarContainer}>
                <div 
                  className={styles.ratingBarFill}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className={styles.ratingCount}>{count}</span>
            </div>
          )
        })}
      </div>
    )
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
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button 
            className={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            ← Back to Product
          </button>
          <div className={styles.productInfo}>
            <img 
              src={`${process.env.REACT_APP_IMAGE_URL}/${product.image}`}
              alt={product.title}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <h1 className={styles.productTitle}>{product.title}</h1>
              <div className={styles.ratingSummary}>
                <div className={styles.ratingLeft}>
                  <span className={styles.ratingNumber}>{rating.average}</span>
                  <div className={styles.ratingStars}>
                    {renderStars(Math.round(parseFloat(rating.average)))}
                  </div>
                  <span className={styles.ratingCount}>{rating.total} reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* Rating Distribution Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.ratingCard}>
              <h3>Rating Breakdown</h3>
              {renderRatingDistribution()}
            </div>
          </div>

          {/* Reviews List */}
          <div className={styles.reviewsContainer}>
            <div className={styles.reviewsHeader}>
              <h2>Customer Reviews</h2>
              <div className={styles.reviewsControls}>
                {!userHasReviewed && (
                  <button 
                    className={styles.writeReviewBtn}
                    onClick={handleWriteReview}
                  >
                    Write a Review
                  </button>
                )}
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <ReviewForm
                productId={productId}
                productTitle={product.title}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={handleCancelReview}
              />
            )}
            
            {reviews.length > 0 ? (
              <>
                <div className={styles.reviewsList}>
                  {reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewerInfo}>
                          <div className={styles.reviewerAvatar}>
                            {review.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className={styles.reviewerDetails}>
                            <div className={styles.reviewerName}>{review.user_name}</div>
                            <div className={styles.reviewRating}>
                              {renderStars(review.star)}
                            </div>
                          </div>
                        </div>
                        <div className={styles.reviewDate}>{formatDate(review.created_at)}</div>
                      </div>
                      
                      <div className={styles.reviewContent}>
                        <p className={styles.reviewComment}>{review.comment}</p>
                        
                        {review.images && review.images.length > 0 && (
                          <div className={styles.reviewImages}>
                            {review.images.map((img) => (
                              <img
                                key={img.id}
                                src={`${process.env.REACT_APP_IMAGE_URL}/${img.image_url}`}
                                alt="Review"
                                className={styles.reviewImage}
                                onClick={() => window.open(`${process.env.REACT_APP_IMAGE_URL}/${img.image_url}`, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.reviewActions}>
                        <button className={styles.helpfulBtn}>
                          <span>👍</span> Helpful ({Math.floor(Math.random() * 50)})
                        </button>
                        <button className={styles.reportBtn}>
                          Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {renderPagination()}
              </>
            ) : (
              <div className={styles.noReviews}>
                <div className={styles.noReviewsIcon}>📝</div>
                <h3>No reviews yet</h3>
                <p>Be the first to review this product!</p>
                <button 
                  className={styles.writeFirstReviewBtn}
                  onClick={handleWriteReview}
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllReviews