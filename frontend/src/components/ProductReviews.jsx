import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from '../style/ProductReviews.module.css'

const ProductReviews = ({ productId, productTitle }) => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [rating, setRating] = useState({ average: 0, total: 0, breakdown: {} })
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/reviews/${productId}/all?limit=3`)
      setReviews(response.data.reviews || [])
      setRating({
        average: response.data.rating?.average || 0,
        total: response.data.rating?.total || 0,
        breakdown: response.data.rating?.distribution || {}
      })
    } catch (error) {
      console.error("Error fetching reviews:", error)
      // Set default values on error
      setReviews([])
      setRating({ average: 0, total: 0, breakdown: {} })
    } finally {
      setReviewsLoading(false)
    }
  }

  const renderStars = (rating, size = 'small') => {
    const starSize = size === 'large' ? '1.2rem' : '0.9rem'
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${styles.star} ${index < rating ? styles.starFilled : styles.starEmpty}`}
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
    navigate(`/product/${productId}/reviews`)
  }

  return (
    <div className={`${styles.reviewsContainer} container-fluid`}>
      {/* Rating Summary */}
      <div className={styles.ratingSummary}>
        <div className={styles.ratingHeader}>
          <h3 className={styles.ratingTitle}>Customer Reviews</h3>
          <button 
            className={styles.writeReviewBtn}
            onClick={handleWriteReview}
          >
            Write a Review
          </button>
        </div>

        {reviewsLoading ? (
          <div className={styles.loadingSpinner}>Loading rating...</div>
        ) : rating.total > 0 ? (
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-3">
              <div className={styles.averageRating}>
                <span className={styles.ratingNumber}>{rating.average}</span>
                <div className={styles.ratingStars}>
                  {renderStars(Math.round(parseFloat(rating.average)), 'large')}
                </div>
                <span className={styles.ratingCount}>{rating.total} reviews</span>
              </div>
            </div>

            <div className="col-lg-8 col-md-6">
              <div className={styles.ratingBreakdown}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const percentage = getRatingPercentage(star)
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
