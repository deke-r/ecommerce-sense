import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from '../style/ReviewsSection.module.css'

const ReviewsSection = ({ productId, productTitle }) => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [userReview, setUserReview] = useState({ star: 5, comment: "", images: [] })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [rating, setRating] = useState({ average: 0, total: 0 })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/reviews/${productId}`)
      setReviews(response.data.reviews || [])
      setRating(response.data.rating || { average: 0, total: 0 })
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + userReview.images.length > 5) {
      alert("You can upload maximum 5 images")
      return
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }))
    
    setUserReview(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))
  }

  const removeImage = (imageId) => {
    setUserReview(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }))
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
      const formData = new FormData()
      formData.append('product_id', productId)
      formData.append('star', userReview.star)
      formData.append('comment', userReview.comment.trim())
      
      // Append image files
      userReview.images.forEach(img => {
        formData.append('images', img.file)
      })

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/reviews`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      )
  
      // Reset form
      setUserReview({ star: 5, comment: "", images: [] })
  
      // Refresh reviews
      await fetchReviews()
  
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

  const handleViewAllReviews = () => {
    navigate(`/product/${productId}/reviews`)
  }

  return (
    <div className={styles.reviewsSection}>
      <div className={styles.reviewsHeader}>
        <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
        {rating.total > 0 && (
          <div className={styles.ratingSummary}>
            <div className={styles.averageRating}>
              <span className={styles.ratingNumber}>{rating.average}</span>
              <div className={styles.ratingStars}>
                {renderStars(Math.round(parseFloat(rating.average)))}
              </div>
              <span className={styles.ratingCount}>({rating.total} reviews)</span>
            </div>
          </div>
        )}
      </div>

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
        <div className={styles.imageUploadSection}>
          <label className={styles.imageUploadLabel}>Add Images (Optional):</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className={styles.imageInput}
            disabled={userReview.images.length >= 5}
          />
          <small className={styles.imageUploadHelp}>
            You can upload up to 5 images (max 5MB each)
          </small>
          {userReview.images.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              {userReview.images.map((img) => (
                <div key={img.id} className={styles.imagePreview}>
                  <img src={img.preview} alt="Preview" className={styles.previewImage} />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => removeImage(img.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={submitReview} 
          disabled={submittingReview}
        >
          {submittingReview ? "Submitting..." : "Submit Review"}
        </button>
      </div>

      <div className={styles.reviewsList}>
        {reviewsLoading ? (
          <div className={styles.loadingSpinner}>Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewRating}>{renderStars(review.star)}</div>
                  <div className={styles.reviewDate}>{formatDate(review.created_at)}</div>
                </div>
                <div className={`text-capitalize ${styles.reviewComment}`}>{review.comment}</div>
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
                <div className={styles.reviewAuthor}>By {review.user_name}</div>
              </div>
            ))}
            {pagination.totalReviews > 5 && (
              <div className={styles.viewAllContainer}>
                <button 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={handleViewAllReviews}
                >
                  View All Reviews ({pagination.totalReviews})
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noReviews}>No reviews yet. Be the first to review this product!</div>
        )}
      </div>
    </div>
  )
}

export default ReviewsSection
