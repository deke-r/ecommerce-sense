"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import CategoryNavigation from "../components/CategoryNavigation"
import { Banner } from "../components/Banner"
import RecentlyViewed from "../components/RecentlyViewed"
import FeaturedProducts from "../components/FeaturedProducts"
import CategorySection from "../components/CategorySection"
import BestSellers from "../components/BestSellers"
import NewsletterSignup from "../components/NewsletterSignup"
import LoadingSpinner from "../components/LoadingSpinner"
import styles from "../style/Home.module.css"
import Col3Banner from "../components/Col3Banner"

const Home = () => {
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const navigate = useNavigate()

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/categories`)
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/products/${categoryId}/${encodeURIComponent(categoryName)}`)
  }

  return (
    <div className={styles.homeContainer}>
      <CategoryNavigation />
      <Banner />
      
      <div className="container-fluid mt-4">
        {/* Featured Products Section */}
        <FeaturedProducts onProductClick={handleProductClick} />
        <RecentlyViewed />

        <Col3Banner/>
        {/* Category-based Product Sections */}
        {!categoriesLoading && categories.slice(0, 4).map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onProductClick={handleProductClick}
            onViewAllClick={() => handleCategoryClick(category.id, category.name)}
          />
        ))}

        {/* Recently Viewed Section */}
      

        {/* Best Sellers Section */}
        <BestSellers onProductClick={handleProductClick} />

    
      </div>
    </div>
  )
}

export default Home
