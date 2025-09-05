"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { productsAPI, cartAPI } from "../services/api"
import axios from "axios"
import ReviewsSection from "../components/ReviewsSection"
import styles from "../style/ProductDetails.module.css"

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const isOutOfStock = product ? product.stocks <= 0 : false
  const isLowStock = product ? product.stocks > 0 && product.stocks < 5 : false

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      alert("This product is out of stock!");
      return;
    }

    setAddingToCart(true)
    try {
      await cartAPI.addItem(id, quantity)
      window.dispatchEvent(new Event("cartUpdated")) // notify navbar
      alert("Product added to cart successfully!")
    } catch (error) {
      console.error("Error adding product to cart:", error)
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error adding product to cart")
      }
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      alert("This product is out of stock!");
      return;
    }

    setAddingToCart(true)
    try {
      await cartAPI.addItem(id, quantity)
      window.dispatchEvent(new Event("cartUpdated")) // notify navbar
      navigate("/checkout")
    } catch (error) {
      console.error("Error buying product:", error)
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error buying product")
      }
    } finally {
      setAddingToCart(false)
    }
  }

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

  const handleBreadcrumbClick = (path) => {
    navigate(path)
  }

  // Get all images for the carousel (main image + additional images)
  const getAllImages = () => {
    if (!product) return []
    
    const images = []
    
    // Add main image first
    if (product.image) {
      images.push({
        id: 'main',
        url: `${process.env.REACT_APP_IMAGE_URL}/${product.image}`,
        alt: product.title
      })
    }
    
    // Add additional images
    if (product.additional_images && product.additional_images.length > 0) {
      product.additional_images.forEach((img, index) => {
        images.push({
          id: img.id,
          url: `${process.env.REACT_APP_IMAGE_URL}/${img.image_url}`,
          alt: `${product.title} - Image ${index + 2}`
        })
      })
    }
    
    return images
  }

  const nextImage = () => {
    const images = getAllImages()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = getAllImages()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index) => {
    setCurrentImageIndex(index)
  }

  const getStockMessage = () => {
    if (isOutOfStock) {
      return <span className="text-danger fw-bold">Out of Stock</span>;
    }
    if (isLowStock) {
      return <span className="text-warning fw-bold">Only {product.stocks} left!</span>;
    }
    return <span className="text-success">In Stock</span>;
  };

  const getMaxQuantity = () => {
    return product ? Math.min(product.stocks, 10) : 1; // Limit to 10 or available stock
  };

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
    <div className={`container-fluid my-3`}>
      <div className="row mx-md-1">

   <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
        <ol className={styles.breadcrumb}>
          <li className={styles.breadcrumbItem}>
            <button className={styles.breadcrumbLink} onClick={() => handleBreadcrumbClick("/")}>
              Home
            </button>
          </li>
          <li className={`${styles.breadcrumbItem} ${styles.active}`}>{product.category_name}</li>
        </ol>
      </nav>

      <div className={styles.container}>
        <div className={styles.productSection}>
          <div className={styles.imageContainer}>
            <div className={styles.carouselContainer}>
              <div className={styles.mainImageWrapper}>
                {getAllImages().length > 0 && (
                  <img
                    src={getAllImages()[currentImageIndex].url}
                    className={styles.productImage}
                    alt={getAllImages()[currentImageIndex].alt}
                  />
                )}
                
                {/* Navigation arrows */}
                {getAllImages().length > 1 && (
                  <>
                    <button 
                      className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                      onClick={prevImage}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button 
                      className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                      onClick={nextImage}
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail navigation */}
              {getAllImages().length > 1 && (
                <div className={styles.thumbnailContainer}>
                  {getAllImages().map((image, index) => (
                    <button
                      key={image.id}
                      className={`${styles.thumbnail} ${index === currentImageIndex ? styles.thumbnailActive : ''}`}
                      onClick={() => goToImage(index)}
                      aria-label={`Go to image ${index + 1}`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className={styles.thumbnailImage}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.productInfo}>
            <h4 className={styles.productTitle}>{product.title}</h4>
            <p className={styles.productDescription}>{product.description}</p>

            <div className={styles.priceSection}>
              <span className={styles.price}>₹{product.price}</span>
            </div>

            <div className={styles.stockSection}>
              <strong>Stock Status: </strong>
              {getStockMessage()}
            </div>

            <div className={styles.quantitySection}>
              <label className={styles.quantityLabel}>Quantity:</label>
              <div className={styles.quantityControls}>
                <button 
                  className={styles.quantityBtn} 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                >
                  -
                </button>
                <input
                  type="number"
                  className={styles.quantityInput}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(getMaxQuantity(), Number.parseInt(e.target.value) || 1)))}
                  min="1"
                  max={getMaxQuantity()}
                  disabled={isOutOfStock}
                />
                <button 
                  className={styles.quantityBtn} 
                  onClick={() => setQuantity(Math.min(getMaxQuantity(), quantity + 1))}
                  disabled={isOutOfStock}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                className={`${styles.btn} ${styles.btnPrimary} ${isOutOfStock ? styles.disabled : ''}`}
                onClick={handleAddToCart}
                disabled={addingToCart || isOutOfStock}
              >
                {addingToCart ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              <button 
                className={`${styles.btn} ${styles.btnSuccess} ${isOutOfStock ? styles.disabled : ''}`} 
                onClick={handleBuyNow} 
                disabled={addingToCart || isOutOfStock}
              >
                {addingToCart ? "Processing..." : isOutOfStock ? "Out of Stock" : "Buy Now"}
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate("/")}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        <ReviewsSection productId={id} productTitle={product.title} />
      </div>
    </div>
    </div>

  )
}

export default ProductDetails
