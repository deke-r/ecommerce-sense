"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { productsAPI } from "../services/api"
import ProductCard from "../components/ProductCard"
import CategoryNavigation from "../components/CategoryNavigation"

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
      console.log('response',response)
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

    <CategoryNavigation/>
    <div className="container mt-4">





<div id="carouselExampleFade" class="carousel slide carousel-fade">
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="..." class="d-block w-100" alt="img-1"/>
    </div>
    <div class="carousel-item">
      <img src="..." class="d-block w-100" alt="image-2"/>
    </div>
    <div class="carousel-item">
      <img src="..." class="d-block w-100" alt="img-3"/>
    </div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>

{/* Products Section */}
<div className="row mb-4">
  <div className="col-12">
    <h2 className="text-center mb-4">Featured Products</h2>
  </div>
</div>

<div className="row">
  {products.map((product) => (
    <div key={product.id} className="col-lg-3 col-md-6 mb-4">
      <div onClick={() => handleProductClick(product.id)} style={{ cursor: "pointer" }}>
        <ProductCard
          image={product.image || "/placeholder.svg?height=250&width=400&query=product"}
          title={product.title}
          price={product.price}
          oldPrice={product.oldPrice}
          discount={product.discount}
          rating={product.rating || 0}
          reviews={product.reviews || 0}
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
