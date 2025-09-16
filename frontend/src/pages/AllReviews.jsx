import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from '../style/AllReviews.module.css'

const AllReviews = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState({ average: 0, total: 0, distribution: {} })
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchReviews()
  }, [productId, currentPage])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/reviews/${productId}/all?page=${currentPage}`)
      setReviews(response.data.reviews || [])
      setProduct(response.data.product)
      setRating(response.data.rating || { average: 0, total: 0, distribution: {} })
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
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
    if (!rating.distribution) return null

    const total = rating.total
    if (total === 0) return null

    return (
      <div className={styles.ratingDistribution}>
        <h4>Rating Distribution</h4>
        {[5, 4, 3, 2, 1].map(star => {
          const count = rating.distribution[`${star}_star`] || 0
          const percentage = total > 0 ? (count / total) * 100 : 0
          
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
            
            <div className={styles.filtersCard}>
              <h3>Filter Reviews</h3>
              <div className={styles.filterOptions}>
                <button className={styles.filterBtn}>All Reviews</button>
                <button className={styles.filterBtn}>5 Star</button>
                <button className={styles.filterBtn}>4 Star</button>
                <button className={styles.filterBtn}>3 Star</button>
                <button className={styles.filterBtn}>2 Star</button>
                <button className={styles.filterBtn}>1 Star</button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className={styles.reviewsContainer}>
            <div className={styles.reviewsHeader}>
              <h2>Customer Reviews</h2>
              <div className={styles.sortOptions}>
                <select className={styles.sortSelect}>
                  <option>Most Recent</option>
                  <option>Most Helpful</option>
                  <option>Highest Rating</option>
                  <option>Lowest Rating</option>
                </select>
              </div>
            </div>
            
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
                  onClick={() => navigate(`/product/${productId}`)}
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
