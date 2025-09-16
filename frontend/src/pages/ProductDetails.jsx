"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { productsAPI, cartAPI } from "../services/api"
import axios from "axios"
import ReviewsSection from "../components/ReviewsSection"
import ProductReviews from "../components/ProductReviews"
import styles from "../style/ProductDetails.module.css"
import SimilarItems from "../components/SimilarItems"
import { FaHeart, FaRegHeart } from "react-icons/fa"
import { wishlistAPI } from "../services/api"
import { recentlyViewedAPI } from "../services/api"
import PincodeDetails from "../components/PincodeChecker"

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const isOutOfStock = product ? product.stocks <= 0 : false
  const isLowStock = product ? product.stocks > 0 && product.stocks < 5 : false

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      alert("This product is out of stock!");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
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

    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
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

  useEffect(() => {
    // Track product view when product is loaded
    if (product && localStorage.getItem('token')) {
      const trackView = async () => {
        try {
          await recentlyViewedAPI.add(id)
        } catch (error) {
          console.error('Error tracking view:', error)
        }
      }
      trackView()
    }
  }, [product, id])

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await wishlistAPI.check(id)
          setIsInWishlist(response.data.isWishlisted ?? response.data.inWishlist ?? false)
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error)
      }
    }

    checkWishlistStatus()
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

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(id)
        setIsInWishlist(false)
        alert('Product removed from wishlist')
      } else {
        await wishlistAPI.add(id)
        setIsInWishlist(true)
        alert('Product added to wishlist')
      }
      window.dispatchEvent(new Event("wishlistUpdated"))
    } catch (error) {
      console.error('Error updating wishlist:', error)
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else {
        alert('Error updating wishlist')
      }
    } finally {
      setWishlistLoading(false)
    }
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
    <div className={`container-fluid my-2`}>
      {/* Breadcrumb Navigation */}
      <div className="row mx-1">

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

      {/* Main Product Section */}
      <div className={styles.container}>
        <div className={styles.productSection}>
          {/* Product Images */}
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

          {/* Product Information */}
          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>{product.title}</h1>
            <p className={styles.productDescription}>{product.description}</p>

            {/* Rating and Reviews */}
            <div className={styles.ratingSection}>
              <div className={styles.rating}>
                <span className={styles.ratingStars}>★★★★☆</span>
                <span className={styles.ratingText}>(4.2) 1,234 ratings</span>
              </div>
            </div>

            {/* Price Section */}
            <div className={styles.priceSection}>
              <div className={styles.priceContainer}>
                <span className={styles.currentPrice}>₹{product.price}</span>
                <span className={styles.originalPrice}>₹{Math.round(product.price * 1.2)}</span>
                <span className={styles.discount}>20% off</span>
              </div>
              <div className={styles.priceDetails}>
                <p className={styles.taxInfo}>Inclusive of all taxes</p>
              </div>
            </div>

            {/* Offers Section */}
            <div className={styles.offersSection}>
              <h3 className={styles.offersTitle}>Available offers</h3>
              <div className={styles.offerItem}>
                <span className={styles.offerIcon}>🎁</span>
                <span className={styles.offerText}>Bank Offer 5% Cashback on Flipkart Axis Bank Card</span>
              </div>
              <div className={styles.offerItem}>
                <span className={styles.offerIcon}>💳</span>
                <span className={styles.offerText}>Special Price Get extra ₹3000 off (price inclusive of discount)</span>
              </div>
              <div className={styles.offerItem}>
                <span className={styles.offerIcon}>🚚</span>
                <span className={styles.offerText}>Partner Offer Sign up for Flipkart Pay Later and get Flipkart Gift Card worth ₹100*</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className={styles.stockSection}>
              <strong>Stock Status: </strong>
              {getStockMessage()}
            </div>

            {/* Quantity Section */}
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

            {/* Action Buttons */}
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
              <button
                className={`${styles.btn} ${styles.btnOutline} ${isInWishlist ? styles.btnWishlistActive : ''}`}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? (
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : isInWishlist ? (
                  <FaHeart className="me-2" />
                ) : (
                  <FaRegHeart className="me-2" />
                )}
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Delivery Information */}
            <div className={styles.deliverySection}>
              <h3 className={styles.deliveryTitle}>Delivery Options</h3>
              <div className={styles.deliveryOption}>
                <span className={styles.deliveryIcon}>📍</span>
                <div className={styles.deliveryInfo}>
                  <span className={styles.deliveryText}>Enter pincode for exact delivery dates/charges</span>
                  <button className={styles.deliveryButton}>Check</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Full Width */}
        <div className="row my-4">
          <div className="col-12">
            <ProductReviews 
              productId={id} 
              productTitle={product.title} 
            />
          </div>
        </div>

        {/* Similar Items */}
        <SimilarItems 
          categoryId={product.category_id} 
          currentProductId={id} 
        />

</div>
     
      </div>
    </div>
  )
}

export default ProductDetails
