import { useState } from 'react'
import { couponsAPI } from '../services/api'
import styles from '../style/CouponCode.module.css'

const CouponCode = ({ orderAmount, onCouponApplied, appliedCoupon, onRemoveCoupon }) => {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [showCoupons, setShowCoupons] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await couponsAPI.validate(couponCode, orderAmount)
      onCouponApplied(response.data.coupon, response.data.coupon.discount_amount)
      setCouponCode('')
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid coupon code')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    onRemoveCoupon()
    setError('')
  }

  const loadAvailableCoupons = async () => {
    try {
      const response = await couponsAPI.getAll()
      setAvailableCoupons(response.data.coupons)
      setShowCoupons(true)
    } catch (error) {
      console.error('Error loading coupons:', error)
    }
  }

  const applyCouponFromList = (coupon) => {
    setCouponCode(coupon.code)
    setShowCoupons(false)
  }

  return (
    <div className={styles.couponContainer}>
      <div className={styles.couponHeader}>
        <h3 className={styles.couponTitle}>Coupon Code</h3>
        {!appliedCoupon && (
          <button 
            className={styles.viewCouponsBtn}
            onClick={loadAvailableCoupons}
          >
            View All Coupons
          </button>
        )}
      </div>

      {appliedCoupon ? (
        <div className={styles.appliedCoupon}>
          <div className={styles.couponInfo}>
            <span className={styles.couponCode}>{appliedCoupon.code}</span>
            <span className={styles.couponDescription}>{appliedCoupon.description}</span>
          </div>
          <div className={styles.couponDiscount}>
            -₹{appliedCoupon.discount_amount}
          </div>
          <button 
            className={styles.removeCouponBtn}
            onClick={handleRemoveCoupon}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className={styles.couponInput}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className={styles.couponInputField}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
            <button
              className={styles.applyBtn}
              onClick={handleApplyCoupon}
              disabled={loading || !couponCode.trim()}
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      )}

      {showCoupons && (
        <div className={styles.availableCoupons}>
          <div className={styles.couponsHeader}>
            <h4>Available Coupons</h4>
            <button 
              className={styles.closeBtn}
              onClick={() => setShowCoupons(false)}
            >
              ×
            </button>
          </div>
          <div className={styles.couponsList}>
            {availableCoupons.map((coupon) => (
              <div key={coupon.id} className={styles.couponItem}>
                <div className={styles.couponDetails}>
                  <div className={styles.couponCode}>{coupon.code}</div>
                  <div className={styles.couponDescription}>{coupon.description}</div>
                  <div className={styles.couponTerms}>
                    Min. order: ₹{coupon.min_order_amount}
                    {coupon.discount_type === 'percentage' 
                      ? ` | ${coupon.discount_value}% off`
                      : ` | ₹${coupon.discount_value} off`
                    }
                  </div>
                </div>
                <button 
                  className={styles.selectCouponBtn}
                  onClick={() => applyCouponFromList(coupon)}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CouponCode
