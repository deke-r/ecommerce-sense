"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import ProductCard from "../components/ProductCard"
import { useNavigate, useParams } from "react-router-dom"
import styles from "../style/ProductsByCategory.module.css"

const ProductsByCategory = () => {
  const { id, name } = useParams()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [sortBy, setSortBy] = useState("default")
  const [minRating, setMinRating] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/productsbycategory/${id}`)
        console.log(res)
        setProducts(res.data.products || [])
        setFilteredProducts(res.data.products || [])
      } catch (error) {
        console.error("❌ Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [id])

  useEffect(() => {
    let filtered = [...products]

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
  }, [products, priceRange, sortBy, minRating])

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  const handleBreadcrumbClick = (path) => {
    navigate(path)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Sidebar - Filters */}
          <div className={styles.sidebar}>
            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>Filters</h3>

              {/* Price Range Filter */}
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Price</h4>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    className={styles.priceInput}
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number.parseInt(e.target.value) || 0, priceRange[1]])
                    }
                  />
                  <span className={styles.priceSeparator}>-</span>
                  <input
                    type="number"
                    className={styles.priceInput}
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        Number.parseInt(e.target.value) || 1000000, // increase upper bound
                      ])
                    }
                  />

                </div>
                <input
                  type="range"
                  className={styles.priceRange}
                  min="0"
                  max="1000000"   // increase max value here
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number.parseInt(e.target.value)])
                  }
                />

                <div className={styles.priceDisplay}>
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </div>
              </div>

              {/* Rating Filter */}
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Customer Rating</h4>
                <div className={styles.ratingOptions}>
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className={styles.ratingOption}>
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={minRating === rating}
                        onChange={(e) => setMinRating(Number.parseFloat(e.target.value))}
                      />
                      <span className={styles.ratingText}>{rating}★ & above</span>
                    </label>
                  ))}
                  <label className={styles.ratingOption}>
                    <input
                      type="radio"
                      name="rating"
                      value={0}
                      checked={minRating === 0}
                      onChange={(e) => setMinRating(Number.parseFloat(e.target.value))}
                    />
                    <span className={styles.ratingText}>All Ratings</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              <button
                className={styles.clearFiltersBtn}
                onClick={() => {
                  setPriceRange([0, 10000])
                  setSortBy("default")
                  setMinRating(0)
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={styles.mainContent}>
            <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
              <ol className={styles.breadcrumb}>
                <li className={styles.breadcrumbItem}>
                  <button className={styles.breadcrumbLink} onClick={() => handleBreadcrumbClick("/")}>
                    Home
                  </button>
                </li>
                <li className={`${styles.breadcrumbItem} ${styles.active}`}>{name || "Category"}</li>
              </ol>
            </nav>
            {/* Results Header */}
            <div className={styles.resultsHeader}>

              <div className={styles.resultsInfo}>
                <h2 className={styles.categoryTitle}>{name || "Products"}</h2>
                <span className={styles.productCount}>({filteredProducts.length} items)</span>
              </div>
              <div className={styles.sortSection}>
                <span className={styles.sortLabel}>Sort by:</span>
                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className={styles.productsGrid}>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={styles.productItem}>
                    <div
                      className={styles.productCard}
                      onClick={() => handleProductClick(product.id)}
                    >
                      <ProductCard
                        image={`${process.env.REACT_APP_IMAGE_URL}/${product.image}`}
                        title={product.title}
                        price={product.price}
                        oldPrice={product.old_price}
                        discount={product.discount}
                        rating={product.rating || 0}
                        reviews={product.reviews || 0}
                        productId={product.id}
                        stocks={product.stocks || 0}
                        variant="list"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noProducts}>
                <h3>No products found</h3>
                <p>Try adjusting your filters to see more results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsByCategory
