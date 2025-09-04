"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { productsAPI } from "../services/api"
import ProductCard from "../components/ProductCard"
import CategoryNavigation from "../components/CategoryNavigation"
import { Banner } from "../components/Banner"

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll()
      console.log('response', response)
      setProducts(response.data.products)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
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

    <>

      <CategoryNavigation />
      <Banner />
      <div className="container-fluid mt-4">








        {/* Products Section */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="text-center mb-4">Featured Products</h2>
          </div>
        </div>
        <div className="row mx-md-1">
          {products.map((product) => (
            <div key={product.id} className="col-lg-3 col-md-6 mb-4">
              <div onClick={() => handleProductClick(product.id)} style={{ cursor: "pointer" }}>
                <ProductCard
                  image={`${process.env.REACT_APP_IMAGE_URL}/${product.image}`}
                  title={product.title}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  discount={product.discount}
                  rating={product.average_rating || 0}   // ✅ average from backend
                  reviews={product.reviews ? product.reviews.length : 0}
                  productId={product.id}
                />
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="row">
            <div className="col-12 text-center">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                No products available at the moment.
              </div>
            </div>
          </div>
        )}

      </div>
    </>

  )
}

export default Home
