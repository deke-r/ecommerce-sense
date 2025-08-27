"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import ProductCard from "../components/ProductCard"
import { useNavigate } from "react-router-dom"
import styles from "../style/ProductsByCategory.module.css"

const AllProducts = () => {
  const [allProducts, setAllProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState("default")
  const [minRating, setMinRating] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/products`)
        setAllProducts(response.data.products || [])
        setFilteredProducts(response.data.products || [])
      } catch (error) {
        console.error("❌ Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  useEffect(() => {
    let filtered = [...allProducts]

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) => product.title.toLowerCase().includes(search) || product.description.toLowerCase().includes(search),
      )
    }

    // Filter by price range
    filtered = filtered.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Filter by rating
    filtered = filtered.filter((product) => (product.rating || 0) >= minRating)

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [allProducts, searchTerm, priceRange, sortBy, minRating])

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  const handleBreadcrumbClick = (path) => {
    navigate(path)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>

        <div className='container'>
          <div className='row'>
            <i className="fas fa-search"></i>
           
          </div>
        </div>


      <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
        <ol className={styles.breadcrumb}>
          <li className={styles.breadcrumbItem}>
            <button className={styles.breadcrumbLink} onClick={() => handleBreadcrumbClick("/")}>
              Home
            </button>
          </li>
          <li className={`${styles.breadcrumbItem} ${styles.active}`}>All Products</li>

          <li className="ms-auto me-0"> <input
              type="text"
              placeholder="Search for products, brands, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-3 w-100 f_14 fw-semibold py-3 px-5 border-0 outline-0 shadow-none form-control`}
            />
            {searchTerm && (
              <button className={styles.clearSearch} onClick={() => setSearchTerm("")}>
                <i className="fas fa-times"></i>
              </button>
            )}</li>
        </ol>
      </nav>

      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <div className={styles.filterCard}>
            <div className={styles.filterHeader}>
              <h5>Filters</h5>
            </div>
            <div className={styles.filterBody}>
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>Price Range</label>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    className={styles.priceInput}
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
                  />
                  <input
                    type="number"
                    className={styles.priceInput}
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 10000])}
                  />
                </div>
                <input
                  type="range"
                  className={styles.priceRange}
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                />
                <div className={styles.priceDisplay}>
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </div>
              </div>

              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>Minimum Rating</label>
                <select
                  className={styles.filterSelect}
                  value={minRating}
                  onChange={(e) => setMinRating(Number.parseFloat(e.target.value))}
                >
                  <option value={0}>All Ratings</option>
                  <option value={1}>1★ & above</option>
                  <option value={2}>2★ & above</option>
                  <option value={3}>3★ & above</option>
                  <option value={4}>4★ & above</option>
                </select>
              </div>

              <button
                className={styles.clearButton}
                onClick={() => {
                  setPriceRange([0, 10000])
                  setSortBy("default")
                  setMinRating(0)
                  setSearchTerm("")
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsInfo}>
              <h4 className={styles.categoryTitle}>All Products</h4>
              <span className={styles.productCount}>({filteredProducts.length} products)</span>
            </div>
            <div className={styles.sortSection}>
              <label className={styles.sortLabel}>Sort by:</label>
              <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          <div className={styles.productsGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className={styles.productItem}>
                  <div onClick={() => handleProductClick(product.id)} className={styles.productClickable}>
                    <ProductCard
                      image={product.image || "/diverse-products-still-life.png"}
                      title={product.title}
                      price={product.price}
                      oldPrice={product.old_price}
                      discount={product.discount}
                      rating={product.average_rating || 0}   // ✅ average from backend
                      reviews={product.reviews ? product.reviews.length : 0} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noProducts}>
                <div className={styles.noProductsContent}>
                  <h5>No products found</h5>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllProducts
