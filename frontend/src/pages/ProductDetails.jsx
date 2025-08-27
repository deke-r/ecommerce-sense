"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { productsAPI, cartAPI } from "../services/api"

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id)
      setProduct(response.data.product)
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    setAddingToCart(true)
    try {
      await cartAPI.addItem(product.id, quantity)
      window.dispatchEvent(new Event("cartUpdated"))
      alert("Product added to cart successfully!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Error adding product to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    setAddingToCart(true)
    try {
      await cartAPI.addItem(product.id, quantity)
      window.dispatchEvent(new Event("cartUpdated"))
      navigate("/cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Error adding product to cart")
    } finally {
      setAddingToCart(false)
    }
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

  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Product not found
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button className="btn btn-link p-0" onClick={() => navigate("/")}>
              Home
            </button>
          </li>
          <li className="breadcrumb-item active">{product.title}</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-md-6">
          <img
            src={product.image || "/placeholder.svg?height=500&width=500&query=product"}
            className="img-fluid rounded shadow"
            alt={product.title}
            style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }}
          />
        </div>

        <div className="col-md-6">
          <div className="ps-md-4">
            <h1 className="display-5 fw-bold mb-3">{product.title}</h1>
            <p className="text-muted mb-4">{product.description}</p>

            <div className="mb-4">
              <span className="display-6 text-primary fw-bold">${product.price}</span>
            </div>

            <div className="mb-4">
              <label htmlFor="quantity" className="form-label fw-semibold">
                Quantity:
              </label>
              <div className="input-group" style={{ maxWidth: "150px" }}>
                <button className="btn btn-outline-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <i className="bi bi-dash"></i>
                </button>
                <input
                  type="number"
                  className="form-control text-center"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button className="btn btn-outline-secondary" onClick={() => setQuantity(quantity + 1)}>
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex">
              <button className="btn btn-primary btn-lg me-md-2" onClick={handleAddToCart} disabled={addingToCart}>
                {addingToCart ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cart-plus me-2"></i>
                    Add to Cart
                  </>
                )}
              </button>
              <button className="btn btn-success btn-lg me-md-2" onClick={handleBuyNow} disabled={addingToCart}>
                {addingToCart ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lightning me-2"></i>
                    Buy Now
                  </>
                )}
              </button>
              <button className="btn btn-outline-secondary btn-lg" onClick={() => navigate("/")}>
                <i className="bi bi-arrow-left me-2"></i>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
