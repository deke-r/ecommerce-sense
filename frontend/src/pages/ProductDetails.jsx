"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { productsAPI, cartAPI, reviewsAPI } from "../services/api"
import axios from "axios"
import ReviewsSection from "../components/ReviewsSection"
import ProductReviews from "../components/ProductReviews"
import styles from "../style/ProductDetails.module.css"
import SimilarItems from "../components/SimilarItems"
import { FaHeart, FaRegHeart } from "react-icons/fa"
import { wishlistAPI } from "../services/api"
import { recentlyViewedAPI } from "../services/api"
import PincodeDetails from "../components/PincodeChecker"
import SameBrandProducts from "../components/SameBrandProducts"

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("") // Add selected size state
  const [selectedColor, setSelectedColor] = useState("") // NEW
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [rating, setRating] = useState({ average: 0, total: 0 })

  const isOutOfStock = product ? product.stocks <= 0 : false
  const isLowStock = product ? product.stocks > 0 && product.stocks < 5 : false

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      alert("This product is out of stock!");
      return;
    }

    // Check if size is required but not selected
    if (product.has_sizes && !selectedSize) {
      alert("Please select a size before adding to cart!");
      return;
    }

    // If colors available, require selection
    const colorsArr = Array.isArray(product.colors) ? product.colors : (product.colors ? String(product.colors).split(",").map(c => c.trim()).filter(Boolean) : [])
    if (colorsArr.length > 0 && !selectedColor) {
      alert("Please select a color before adding to cart!");
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
      await cartAPI.addItem(id, quantity, selectedSize, selectedColor)
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

    // Check if size is required but not selected
    if (product.has_sizes && !selectedSize) {
      alert("Please select a size before purchasing!");
      return;
    }

    const colorsArr = Array.isArray(product.colors) ? product.colors : (product.colors ? String(product.colors).split(",").map(c => c.trim()).filter(Boolean) : [])
    if (colorsArr.length > 0 && !selectedColor) {
      alert("Please select a color before purchasing!");
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
      await cartAPI.addItem(id, quantity, selectedSize, selectedColor)
      window.dispatchEvent(new Event("cartUpdated")) // notify navbar
      navigate("/address")
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
    // fetch rating summary for header
    const loadRating = async () => {
      try {
        const res = await reviewsAPI.getByProduct(id, 1, 1)
        setRating({
          average: Number(res.data?.rating?.average) || 0,
          total: Number(res.data?.rating?.total) || 0,
        })
      } catch (e) {
        setRating({ average: 0, total: 0 })
      }
    }
    loadRating()
  }, [id])

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
      const p = response.data.product || {}

      const normalizedSizes = Array.isArray(p.sizes)
        ? p.sizes.map(s => ({
            id: s.id,
            size: s.size_value || s.size_name || s.size || "",
            stock: Number(s.stock_quantity ?? s.stock ?? 0),
            is_available: s.is_available === undefined ? true : Boolean(s.is_available),
            additional_price: Number(s.additional_price ?? 0),
          }))
        : []

      setProduct({
        ...p,
        has_sizes: Boolean(p.has_sizes) || normalizedSizes.length > 0,
        sizes: normalizedSizes,
      })
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

  const renderStars = (value) => {
    const avg = Math.max(0, Math.min(5, Number(value) || 0))
    const filled = Math.round(avg)
    const empty = 5 - filled
    return "★".repeat(filled) + "☆".repeat(empty)
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

  // Normalize colors to array for UI
  const colorsList = Array.isArray(product.colors)
    ? product.colors
    : (product.colors ? String(product.colors).split(",").map(c => c.trim()).filter(Boolean) : [])

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
        <div className={styles.productContainer}>
          {/* Left: Images (sticky) */}
          <div className={styles.leftSection}>
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
          </div>

          {/* Right: Product Information (scrolls) */}
          <div className={styles.rightSection}>
            <div className={styles.productInfo}>
              <h1 className={styles.productTitle}>{product.title}</h1>
              
              {/* Brand Information */}
              {product.brand && product.brand.name && product.brand.name !== 'Generic' && (
                <div className={styles.brandSection}>
                  <span className={styles.brandLabel}>Brand: </span>
                  <span className={styles.brandName}>{product.brand.name}</span>
                </div>
              )}
              
              <p className={styles.productDescription}>{product.description}</p>

              {/* Rating and Reviews */}
              <div className={styles.ratingSection}>
                <div className={styles.rating}>
                  <span className={styles.ratingStars}>{renderStars(rating.average)}</span>
                  <span className={styles.ratingText}>
                    ({Number(rating.average || 0).toFixed(1)}) {rating.total} ratings
                  </span>
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

              {/* Size Selection */}
              {product.has_sizes && product.sizes && product.sizes.length > 0 && (
                <div className={styles.sizeSection}>
                  <label className={styles.sizeLabel}>Select Size:</label>
                  <div className={styles.sizeOptions}>
                    {product.sizes.map((size) => (
                      <button
                        key={size.size}
                        className={`${styles.sizeButton} ${
                          selectedSize === size.size ? styles.sizeSelected : ''
                        } ${size.stock <= 0 ? styles.sizeOutOfStock : ''}`}
                        onClick={() => setSelectedSize(size.size)}
                        disabled={size.stock <= 0}
                      >
                        {size.size}
                        {size.stock <= 0 && <span className={styles.outOfStockText}>Out of Stock</span>}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <div className={styles.sizeInfo}>
                      <small className="text-muted">
                        Selected: {selectedSize}
                        {product.sizes.find(s => s.size === selectedSize)?.stock && 
                         ` (${product.sizes.find(s => s.size === selectedSize).stock} available)`}
                      </small>
                    </div>
                  )}
                </div>
              )}

              {/* Color Selection */}
              {colorsList.length > 0 && (
                <div className={styles.sizeSection}>
                  <label className={styles.sizeLabel}>Select Color:</label>
                  <div className={styles.sizeOptions}>
                    {colorsList.map((c) => {
                      const label = (typeof c === 'string') ? c : (c?.name || '')
                      const value = label
                      return (
                        <button
                          key={value}
                          className={`${styles.sizeButton} ${selectedColor === value ? styles.sizeSelected : ''}`}
                          onClick={() => setSelectedColor(value)}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                  {selectedColor && (
                    <div className={styles.sizeInfo}>
                      <small className="text-muted">Selected color: {selectedColor}</small>
                    </div>
                  )}
                </div>
              )}

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
                    className={styles.quantityBtn2} 
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

        {/* Same Brand Products */}
        {product.brand && product.brand.id && (
          <SameBrandProducts 
            brandId={product.brand.id} 
            currentProductId={id}
            brandName={product.brand.name}
          />
        )}

</div>
     
      </div>
    </div>
  )
}

export default ProductDetails