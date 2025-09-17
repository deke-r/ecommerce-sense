"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { cartAPI } from "../services/api"

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await cartAPI.getItems()
      setCartItems(response.data.cartItems)
    } catch (error) {
      console.error("Error fetching cart items:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    setUpdating({ ...updating, [itemId]: true })
    try {
      await cartAPI.updateItem(itemId, newQuantity)
      fetchCartItems()
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (error) {
      console.error("Error updating quantity:", error)
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error updating quantity")
      }
    } finally {
      setUpdating({ ...updating, [itemId]: false })
    }
  }

  const removeItem = async (itemId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      try {
        await cartAPI.removeItem(itemId)
        fetchCartItems()
        window.dispatchEvent(new Event("cartUpdated"))
      } catch (error) {
        console.error("Error removing item:", error)
        alert("Error removing item")
      }
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * 0.1).toFixed(2) // 10% tax
  }

  const calculateTotal = () => {
    return (Number.parseFloat(calculateSubtotal()) + Number.parseFloat(calculateTax())).toFixed(2)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty")
      return
    }
    navigate("/address")
  }

  const clearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        for (const item of cartItems) {
          await cartAPI.removeItem(item.id)
        }
        fetchCartItems()
        window.dispatchEvent(new Event("cartUpdated"))
      } catch (error) {
        console.error("Error clearing cart:", error)
        alert("Error clearing cart")
      }
    }
  }

  const getStockStatus = (item) => {
    if (item.stocks <= 0) {
      return <span className="text-danger fw-bold">Out of Stock</span>
    }
    if (item.stocks < 5) {
      return <span className="text-warning fw-bold">Only {item.stocks} left!</span>
    }
    return <span className="text-success">In Stock</span>
  }

  const isItemOutOfStock = (item) => {
    return item.stocks <= 0
  }

  if (loading) {
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
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-cart3 me-2"></i>
              Shopping Cart ({cartItems.length} items)
            </h2>
            {cartItems.length > 0 && (
              <button className="btn btn-outline-danger" onClick={clearCart}>
                <i className="bi bi-trash me-1"></i>
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="row">
          <div className="col-12 text-center">
            <div className="card">
              <div className="card-body py-5">
                <i className="bi bi-cart-x display-1 text-muted"></i>
                <h3 className="mt-3">Your cart is empty</h3>
                <p className="text-muted">Add some products to get started!</p>
                <button className="btn btn-primary" onClick={() => navigate("/")}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                {cartItems.map((item) => (
                  <div key={item.id} className={`row align-items-center border-bottom py-3 ${isItemOutOfStock(item) ? 'opacity-50' : ''}`}>
                    <div className="col-md-2">
                      <img
                        src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
                        alt={item.title}
                        className="cart-item-image rounded"
                      />
                    </div>
                    <div className="col-md-4">
                      <h6 className="mb-1 text-capitalize">{item.title}</h6>
                      <p className="text-muted mb-0">₹{item.price}</p>
                      <div className="mt-1">
                        {getStockStatus(item)}
                      </div>
                      {(item.selected_size || item.selected_color) && (
                        <div className="text-muted small mt-1">
                          {item.selected_size && <span>Size: {item.selected_size}</span>}
                          {item.selected_size && item.selected_color && <span> · </span>}
                          {item.selected_color && <span>Color: {item.selected_color}</span>}
                        </div>
                      )}
                    </div>
                    <div className="col-md-3">
                      <div className="input-group">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating[item.id] || item.quantity <= 1 || isItemOutOfStock(item)}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = Number.parseInt(e.target.value) || 1
                            if (newQuantity !== item.quantity) {
                              updateQuantity(item.id, newQuantity)
                            }
                          }}
                          min="1"
                          max={item.stocks}
                          disabled={updating[item.id] || isItemOutOfStock(item)}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating[item.id] || item.quantity >= item.stocks || isItemOutOfStock(item)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                    <div className="col-md-1">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (10%):</span>
                  <span>₹{calculateTax()}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong>₹{calculateTotal()}</strong>
                </div>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary btn-lg" 
                    onClick={handleCheckout}
                    disabled={cartItems.some(item => isItemOutOfStock(item))}
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    {cartItems.some(item => isItemOutOfStock(item)) ? "Remove Out of Stock Items" : "Proceed to Checkout"}
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => navigate("/")}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart