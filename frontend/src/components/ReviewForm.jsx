import React, { useState } from 'react'
import { reviewsAPI } from '../services/api'
import styles from '../style/ReviewForm.module.css'

const ReviewForm = ({ productId, productTitle, onReviewSubmitted, onCancel }) => {
  const [formData, setFormData] = useState({
    star: 0,
    comment: ''
  })
  const [images, setImages] = useState([])
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleStarClick = (star) => {
    setFormData(prev => ({ ...prev, star }))
  }

  const handleStarHover = (star) => {
    setHoveredStar(star)
  }

  const handleStarLeave = () => {
    setHoveredStar(0)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      setError('You can upload maximum 5 images')
      return
    }
    setImages(prev => [...prev, ...files])
    setError('')
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.star === 0) {
      setError('Please select a rating')
      return
    }
    
    if (formData.comment.trim().length < 10) {
      setError('Please write at least 10 characters for your review')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await reviewsAPI.submit(productId, formData, images)
      alert('Review submitted successfully!')
      onReviewSubmitted && onReviewSubmitted()
      // Reset form
      setFormData({ star: 0, comment: '' })
      setImages([])
    } catch (error) {
      console.error('Error submitting review:', error)
      setError(error.response?.data?.message || 'Error submitting review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isFilled = starValue <= (hoveredStar || formData.star)
      
      return (
        <span
          key={index}
          className={`${styles.star} ${isFilled ? styles.starFilled : styles.starEmpty}`}
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          onMouseLeave={handleStarLeave}
        >
          ★
        </span>
      )
    })
  }

  return (
    <div className={styles.reviewFormContainer}>
      <div className={styles.reviewFormHeader}>
        <h3>Write a Review</h3>
        <p className={styles.productTitle}>{productTitle}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.reviewForm}>
        {/* Rating Section */}
        <div className={styles.ratingSection}>
          <label className={styles.ratingLabel}>Your Rating *</label>
          <div className={styles.starsContainer}>
            {renderStars()}
            <span className={styles.ratingText}>
              {formData.star > 0 && `${formData.star} star${formData.star > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Comment Section */}
        <div className={styles.commentSection}>
          <label htmlFor="comment" className={styles.commentLabel}>
            Your Review *
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Share your experience with this product..."
            className={styles.commentTextarea}
            rows="4"
            required
          />
          <div className={styles.characterCount}>
            {formData.comment.length}/500 characters
          </div>
        </div>

        {/* Image Upload Section */}
        <div className={styles.imageSection}>
          <label htmlFor="images" className={styles.imageLabel}>
            Upload Photos (Optional)
          </label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className={styles.imageInput}
          />
          <div className={styles.imageHelpText}>
            You can upload up to 5 images (JPG, PNG, GIF, WebP)
          </div>
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className={styles.imagePreview}>
              {images.map((image, index) => (
                <div key={index} className={styles.imagePreviewItem}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className={styles.removeImageBtn}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelBtn}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || formData.star === 0 || formData.comment.trim().length < 10}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
