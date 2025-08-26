"use client"

import { useState, useEffect } from "react"

import { adminProductsAPI, adminCategoriesAPI } from "../../services/adminAPI"
import AdminNavbar from "../../components/AdminNavbar"

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    stocks: "",
    main_image: null,
    additional_images: [],
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await adminProductsAPI.getAll()
      setProducts(response.data.products)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await adminCategoriesAPI.getAll()
      setCategories(response.data.categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === "main_image") {
      setFormData({
        ...formData,
        main_image: files ? files[0] : null,
      })
    } else if (name === "additional_images") {
      setFormData({
        ...formData,
        additional_images: Array.from(files),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleMainImageRemove = () => {
    setFormData({
      ...formData,
      main_image: null,
    })
  }

  const handleAdditionalImageRemove = (index) => {
    setFormData({
      ...formData,
      additional_images: formData.additional_images.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("price", formData.price)
    data.append("category_id", formData.category_id)
    data.append("stocks", formData.stocks)
    
    // Append main image
    if (formData.main_image) {
      data.append("main_image", formData.main_image)
    }
    
    // Append additional images
    formData.additional_images.forEach((image) => {
      data.append("additional_images", image)
    })

    try {
      if (editingProduct) {
        await adminProductsAPI.update(editingProduct.id, data)
      } else {
        await adminProductsAPI.create(data)
      }

      setShowModal(false)
      setEditingProduct(null)
      setFormData({ 
        title: "", 
        description: "", 
        price: "", 
        category_id: "", 
        stocks: "",
        main_image: null, 
        additional_images: [] 
      })
      fetchProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error saving product")
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category_id: product.category_id || "",
      stocks: product.stocks || "",
      main_image: null,
      additional_images: [],
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await adminProductsAPI.delete(id)
        fetchProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Error deleting product")
      }
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({ 
      title: "", 
      description: "", 
      price: "", 
      category_id: "", 
      stocks: "",
      main_image: null, 
      additional_images: [] 
    })
    setShowModal(true)
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : "No Category"
  }

  return (
   <>

   <AdminNavbar/>
   
        <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
        
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Product
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Main Image</th>
                        <th>Additional Images</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stocks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <img
                              src={product.image || "/placeholder.svg?height=50&width=50&query=product"}
                              alt={product.title}
                              style={{ width: "50px", height: "50px", objectFit: "cover" }}
                              className="rounded"
                            />
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {product.additional_images && product.additional_images.length > 0 ? (
                                product.additional_images.slice(0, 3).map((image, index) => (
                                  <img
                                    key={index}
                                    src={image.image_url}
                                    alt={`${product.title} ${index + 1}`}
                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                    className="rounded"
                                  />
                                ))
                              ) : (
                                <span className="text-muted">No additional images</span>
                              )}
                              {product.additional_images && product.additional_images.length > 3 && (
                                <span className="badge bg-secondary">+{product.additional_images.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td>{product.title}</td>
                          <td>{product.description?.substring(0, 100)}...</td>
                          <td>{getCategoryName(product.category_id)}</td>
                          <td>Rs.{product.price}</td>
                          <td>
                            <span className={`badge ${product.stocks > 0 ? 'bg-success' : 'bg-danger'}`}>
                              {product.stocks || 0}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(product)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
     

      {/* Product Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingProduct ? "Edit Product" : "Add Product"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">
                          Title
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                          Description
                        </label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          rows="3"
                          value={formData.description}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="category_id" className="form-label">
                          Category
                        </label>
                        <select
                          className="form-control"
                          id="category_id"
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="price" className="form-label">
                          Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="stocks" className="form-label">
                          Stocks
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          id="stocks"
                          name="stocks"
                          value={formData.stocks}
                          onChange={handleInputChange}
                          required
                        />
                        <small className="form-text text-muted">
                          Available quantity in stock
                        </small>
                      </div>
                    </div>

                    <div className="col-md-6">
                      {/* Main Product Image */}
                      <div className="mb-3">
                        <label htmlFor="main_image" className="form-label">
                          Main Product Image <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="main_image"
                          name="main_image"
                          accept="image/*"
                          onChange={handleInputChange}
                          required
                        />
                        <small className="form-text text-muted">
                          This will be the primary image displayed for the product.
                        </small>
                      </div>

                      {/* Main Image Preview */}
                      {formData.main_image && (
                        <div className="mb-3">
                          <label className="form-label">Main Image Preview:</label>
                          <div className="position-relative d-inline-block">
                            <img
                              src={URL.createObjectURL(formData.main_image)}
                              alt="Main image preview"
                              style={{ width: "120px", height: "120px", objectFit: "cover" }}
                              className="rounded border"
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{ transform: "translate(50%, -50%)" }}
                              onClick={handleMainImageRemove}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Additional Product Images */}
                      <div className="mb-3">
                        <label htmlFor="additional_images" className="form-label">
                          Additional Product Images
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="additional_images"
                          name="additional_images"
                          accept="image/*"
                          multiple
                          onChange={handleInputChange}
                        />
                        <small className="form-text text-muted">
                          You can select multiple additional images (up to 10). These will be shown in the product gallery.
                        </small>
                      </div>

                      {/* Additional Images Preview */}
                      {formData.additional_images.length > 0 && (
                        <div className="mb-3">
                          <label className="form-label">Additional Images Preview:</label>
                          <div className="d-flex flex-wrap gap-2">
                            {formData.additional_images.map((image, index) => (
                              <div key={index} className="position-relative">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Additional image ${index + 1}`}
                                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                                  className="rounded border"
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                  style={{ transform: "translate(50%, -50%)" }}
                                  onClick={() => handleAdditionalImageRemove(index)}
                                />
                                <div className="text-center mt-1">
                                  <small className="text-muted">{index + 1}</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? "Update" : "Add"} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
 </>
  )
}


export default AdminProducts