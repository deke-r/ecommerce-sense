import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reviewsAPI } from '../services/api'
import ReviewForm from './ReviewForm'
import styles from '../style/ProductReviews.module.css'

const ProductReviews = ({ productId, productTitle }) => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [rating, setRating] = useState({ average: 0, total: 0, breakdown: {} })
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userHasReviewed, setUserHasReviewed] = useState(false)

  useEffect(() => {
    fetchReviews()
    checkUserReview()
  }, [productId])
  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const [limitedRes, distRes] = await Promise.all([
        reviewsAPI.getByProduct(productId, 1, 3),
        reviewsAPI.getAllByProduct(productId, 1, 1),
      ])
      setReviews(limitedRes.data.reviews || [])
      const dist = distRes.data?.rating || {}
      setRating({
        average: dist.average || 0,
        total: dist.total || 0,
        breakdown: dist.distribution || {}
      })
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setReviews([])
      setRating({ average: 0, total: 0, breakdown: {} })
    } finally {
      setReviewsLoading(false)
    }
  }

  const checkUserReview = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      // Check if user has already reviewed this product
      const response = await reviewsAPI.getByProduct(productId, 1, 100)
      const userReviews = response.data.reviews.filter(review => 
        review.user_id === JSON.parse(localStorage.getItem('user'))?.id
      )
      setUserHasReviewed(userReviews.length > 0)
    } catch (error) {
      console.error("Error checking user review:", error)
    }
  }

  const renderStars = (value, size = 'small') => {
    const starSize = size === 'large' ? '1.2rem' : '0.9rem'
    const filled = Math.max(0, Math.min(5, Math.floor(Number(value) || 0)))
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${styles.star} ${index < filled ? styles.starFilled : styles.starEmpty}`}
        style={{ fontSize: starSize }}
      >
        ★
      </span>
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Build dynamic breakdown list from API keys (supports 'five'..'one' or numeric keys)
  const getBreakdownEntries = () => {
    if (!rating.total || !rating.breakdown) return []
    const keyToStar = (key) => {
      const map = { five: 5, four: 4, three: 3, two: 2, one: 1 }
      if (key in map) return map[key]
      const n = parseInt(key, 10)
      return Number.isFinite(n) ? n : null
    }
    return Object.entries(rating.breakdown)
      .map(([k, count]) => ({ star: keyToStar(k), count: Number(count) || 0 }))
      .filter(e => e.star !== null)
      .sort((a, b) => b.star - a.star)
  }


  const getRatingPercentage = (star) => {
    if (rating.total === 0 || !rating.breakdown) return 0
    
    // Map star numbers to the correct breakdown keys
    const breakdownKey = {
      5: 'five',
      4: 'four', 
      3: 'three',
      2: 'two',
      1: 'one'
    }[star]
    
    const count = rating.breakdown[breakdownKey] || 0
    return Math.round((count / rating.total) * 100)
  }

  const handleViewAllReviews = () => {
    navigate(`/product/${productId}/reviews`)
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

  return (
    <div className={`${styles.reviewsContainer} container-fluid`}>
      {/* Rating Summary */}
      <div className={styles.ratingSummary}>
        <div className={styles.ratingHeader}>
          <h3 className={styles.ratingTitle}>Customer Reviews</h3>
          {!userHasReviewed && (
            <button 
              className={styles.writeReviewBtn}
              onClick={handleWriteReview}
            >
              Write a Review
            </button>
          )}
        </div>

        {reviewsLoading ? (
          <div className={styles.loadingSpinner}>Loading rating...</div>
        ) : rating.total > 0 ? (
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-3">
            <div className={styles.averageRating}>
                  <span className={styles.ratingNumber}>{rating.average}</span>
                  <div className={styles.ratingStars}>
                    {renderStars(rating.average, 'large')}
                  </div>
                  <span className={styles.ratingCount}>{rating.total} reviews</span>
                </div>
            </div>

            <div className="col-lg-8 col-md-6">
              <div className={styles.ratingBreakdown}>
                {getBreakdownEntries().map(({ star, count }) => {
                  const percentage = Math.round((count / rating.total) * 100)
                  return (
                    <div key={star} className={styles.ratingBar}>
                      <span className={styles.starLabel}>{star}★</span>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className={styles.percentage}>{percentage}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noRating}>
            <p>No reviews yet</p>
            <button 
              className={styles.beFirstBtn}
              onClick={handleWriteReview}
            >
              Be the first to review
            </button>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          productTitle={productTitle}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={handleCancelReview}
        />
      )}

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className={styles.recentReviews}>
          <div className={styles.reviewsHeader}>
            <h4>Recent Reviews</h4>
            <button 
              className={styles.viewAllBtn}
              onClick={handleViewAllReviews}
            >
              View All
            </button>
          </div>

          <div className="row">
            {reviewsLoading ? (
              <div className="col-12">
                <div className={styles.loadingSpinner}>Loading reviews...</div>
              </div>
            ) : (
              reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="col-lg-4 col-md-6 mb-3">
                  <div className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerInfo}>
                        <div className={styles.reviewerName}>{review.user_name}</div>
                        <div className={styles.reviewRating}>
                          {renderStars(review.star)}
                        </div>
                      </div>
                      <div className={styles.reviewDate}>{formatDate(review.created_at)}</div>
                    </div>
                    
                    <div className={styles.reviewContent}>
                      <p className={styles.reviewComment}>{review.comment}</p>
                      
                      {review.images && review.images.length > 0 && (
                        <div className={styles.reviewImages}>
                          {review.images.slice(0, 2).map((img) => (
                            <img
                              key={img.id}
                              src={`${process.env.REACT_APP_IMAGE_URL}/${img.image_url}`}
                              alt="Review"
                              className={styles.reviewImage}
                              onClick={() => window.open(`${process.env.REACT_APP_IMAGE_URL}/${img.image_url}`, '_blank')}
                            />
                          ))}
                          {review.images.length > 2 && (
                            <div className={styles.moreImages}>
                              +{review.images.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.reviewActions}>
                      <button className={styles.helpfulBtn}>
                        <span>👍</span> Helpful
                      </button>
                      <button className={styles.reportBtn}>
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Review Guidelines */}
      <div className={styles.reviewGuidelines}>
        <h5>Review Guidelines</h5>
        <ul>
          <li>Share your honest experience with the product</li>
          <li>Include details about quality, value, and performance</li>
          <li>Upload photos to help other customers</li>
          <li>Keep reviews respectful and constructive</li>
        </ul>
      </div>
    </div>
  )
}

export default ProductReviews
