import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersAPI } from '../services/api'

const Payment = () => {
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const navigate = useNavigate()

  useEffect(() => {
    const storedOrderData = localStorage.getItem('orderData')
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData))
    } else {
      navigate('/cart')
    }
  }, [navigate])

  const handlePlaceOrder = async () => {
    if (!orderData) return

    setLoading(true)
    try {
      const orderPayload = {
        address_id: orderData.address.id,
        coupon_id: orderData.appliedCoupon?.id || null,
        discount_amount: orderData.discount || 0
      }

      const response = await ordersAPI.create(orderPayload)
      
      // Clear order data from localStorage
      localStorage.removeItem('orderData')
      
      // Navigate to success page or orders page
      navigate('/orders', { state: { orderId: response.data.order.id } })
    } catch (error) {
      console.error('Error placing order:', error)
      alert(error.response?.data?.message || 'Error placing order')
    } finally {
      setLoading(false)
    }
  }

  if (!orderData) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h4>Payment Details</h4>
            </div>
            <div className="card-body">
              {/* Payment Method Selection */}
              <div className="mb-4">
                <h5>Select Payment Method</h5>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="card"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="card">
                    <i className="bi bi-credit-card me-2"></i>
                    Credit/Debit Card
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="upi"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="upi">
                    <i className="bi bi-phone me-2"></i>
                    UPI
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="cod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="cod">
                    <i className="bi bi-cash me-2"></i>
                    Cash on Delivery
                  </label>
                </div>
              </div>

              {/* Payment Form */}
              {paymentMethod === 'card' && (
                <div className="mb-4">
                  <h5>Card Details</h5>
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label htmlFor="cardNumber" className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control"
                        id="expiryDate"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="cvv" className="form-label">CVV</label>
                      <input
                        type="text"
                        className="form-control"
                        id="cvv"
                        placeholder="123"
                        maxLength="3"
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label htmlFor="cardName" className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="cardName"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="mb-4">
                  <h5>UPI Details</h5>
                  <div className="mb-3">
                    <label htmlFor="upiId" className="form-label">UPI ID</label>
                    <input
                      type="text"
                      className="form-control"
                      id="upiId"
                      placeholder="yourname@paytm"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  You will pay cash when your order is delivered.
                </div>
              )}

              {/* Delivery Address */}
              <div className="mb-4">
                <h5>Delivery Address</h5>
                <div className="bg-light p-3 rounded">
                  <div className="fw-semibold">{orderData.address.full_name}</div>
                  <div className="text-muted">
                    {orderData.address.street}<br />
                    {orderData.address.landmark && `${orderData.address.landmark}, `}
                    {orderData.address.city} - {orderData.address.pincode}<br />
                    {orderData.address.state}<br />
                    Mobile: {orderData.address.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5>Order Summary</h5>
            </div>
            <div className="card-body">
              {/* Order Items */}
              <div className="mb-3">
                <h6>Items ({orderData.cartItems.length})</h6>
                <div className="max-height-300 overflow-auto">
                  {orderData.cartItems.map((item) => (
                    <div key={item.id} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                      <img
                        src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
                        alt={item.title}
                        className="rounded me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-semibold text-capitalize" style={{ fontSize: '0.9rem' }}>
                          {item.title}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          Qty: {item.quantity} × ₹{item.price}
                        </div>
                      </div>
                      <div className="fw-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Subtotal:</span>
                  <span>₹{orderData.subtotal}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Tax (10%):</span>
                  <span>₹{orderData.tax}</span>
                </div>
                {orderData.discount > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-success">
                    <span>Discount ({orderData.appliedCoupon?.code}):</span>
                    <span>-₹{orderData.discount.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong>₹{orderData.total}</strong>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="d-grid">
                <button
                  className="btn btn-success btn-lg"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
