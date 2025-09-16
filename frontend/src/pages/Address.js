"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { cartAPI, addressAPI } from "../services/api"
import Addresses from './Addresses'
import CouponCode from '../components/CouponCode'

const Address = () => {
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartLoading, setCartLoading] = useState(true)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAddresses()
    fetchCartItems()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const response = await addressAPI.getAll()
      if (response.data.success) {
        setAddresses(response.data.addresses)
        // Set default address if available
        const defaultAddress = response.data.addresses.find(addr => addr.is_default)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress)
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCartItems = async () => {
    try {
      setCartLoading(true)
      const response = await cartAPI.getItems()
      setCartItems(response.data.cartItems)
    } catch (error) {
      console.error("Error fetching cart items:", error)
    } finally {
      setCartLoading(false)
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * 0.1).toFixed(2) // 10% tax
  }

  const calculateTotal = () => {
    const subtotal = Number.parseFloat(calculateSubtotal())
    const tax = Number.parseFloat(calculateTax())
    const total = subtotal + tax - discountAmount
    return Math.max(0, total).toFixed(2)
  }

  const handleCouponApplied = (coupon, discount) => {
    setAppliedCoupon(coupon)
    setDiscountAmount(discount)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
  }

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      alert("Please select an address")
      return
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty")
      return
    }

    // Store order data in localStorage for payment page
    const orderData = {
      address: selectedAddress,
      cartItems: cartItems,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      discount: discountAmount,
      appliedCoupon: appliedCoupon,
      total: calculateTotal()
    }
    
    localStorage.setItem('orderData', JSON.stringify(orderData))
    navigate("/payment")
  }

  if (loading || cartLoading) {
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
          <Addresses 
            onAddressSelect={handleAddressSelect}
            selectedAddress={selectedAddress}
          />
          
          {/* Coupon Code Section */}
          <CouponCode 
            orderAmount={calculateSubtotal()}
            onCouponApplied={handleCouponApplied}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={handleRemoveCoupon}
          />
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              {cartItems.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted">Your cart is empty</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate("/cart")}
                  >
                    Go to Cart
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="mb-3">
                    <h6>Items ({cartItems.length})</h6>
                    <div className="max-height-300 overflow-auto">
                      {cartItems.map((item) => (
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
                      <span>₹{calculateSubtotal()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Tax (10%):</span>
                      <span>₹{calculateTax()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="d-flex justify-content-between mb-1 text-success">
                        <span>Discount ({appliedCoupon?.code}):</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <hr />
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total:</strong>
                      <strong>₹{calculateTotal()}</strong>
                    </div>
                  </div>

                  {/* Selected Address */}
                  {selectedAddress && (
                    <div className="mb-3">
                      <h6>Delivery Address</h6>
                      <div className="bg-light p-2 rounded">
                        <div className="fw-semibold text-capitalize">{selectedAddress.full_name}</div>
                        <div className="text-muted text-capitalize" style={{ fontSize: '0.9rem' }}>
                          {selectedAddress.street}<br />
                          {selectedAddress.landmark && `${selectedAddress.landmark}, `}
                          {selectedAddress.city} - {selectedAddress.pincode}<br />
                          {selectedAddress.state}<br />
                          Mobile: {selectedAddress.phone}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-success btn-lg"
                      onClick={handleProceedToPayment}
                      disabled={!selectedAddress || cartItems.length === 0}
                    >
                      <i className="bi bi-credit-card me-2"></i>
                      Proceed to Payment
                    </button>
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => navigate("/cart")}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Address