"use client"

import { useState, useEffect } from "react"

import { adminProductsAPI, adminCategoriesAPI, adminBrandsAPI } from "../../services/adminAPI"
import AdminNavbar from "../../components/AdminNavbar"

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    brand_id: "",
    stocks: "",
    has_sizes: 0,
    size_category: "none",
    sizes: "",
    sizes_with_stock: "",
    colors: "",
    main_image: null,
    additional_images: [],
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
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

  const fetchBrands = async () => {
    try {
      const response = await adminBrandsAPI.getActive()
      setBrands(response.data.brands || [])
    } catch (error) {
      console.error("Error fetching active brands:", error)
      try {
        const resAll = await adminBrandsAPI.getAll()
        setBrands(resAll.data.brands || [])
      } catch (err) {
        console.error("Error fetching all brands:", err)
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target
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
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked ? 1 : 0,
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
    data.append("brand_id", formData.brand_id || "")
    data.append("stocks", formData.stocks)
    data.append("has_sizes", formData.has_sizes)
    data.append("size_category", formData.size_category)
    data.append("sizes", formData.sizes) // comma-separated
    data.append("sizes_with_stock", formData.sizes_with_stock || "") // size:stock pairs
    data.append("colors", formData.colors) // comma-separated
    
    if (formData.main_image) {
      data.append("main_image", formData.main_image)
    }
    
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
        brand_id: "",
        stocks: "",
        has_sizes: 0,
        size_category: "none",
        sizes: "",
        sizes_with_stock: "",
        colors: "",
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
      brand_id: product.brand_id || "",
      stocks: product.stocks || "",
      has_sizes: product.has_sizes ? 1 : 0,
      size_category: product.size_category || "none",
      sizes: (product.sizes && Array.isArray(product.sizes)) ? product.sizes.map(s => s.size || s.size_value || s.size_name || s).join(",") : "",
      sizes_with_stock: (product.sizes && Array.isArray(product.sizes))
        ? product.sizes.map(s => `${(s.size || s.size_value || s.size_name)}:${(s.stock || s.stock_quantity || 0)}`).join(",")
        : "",
      colors: (product.colors && Array.isArray(product.colors)) ? product.colors.join(",") : (product.colors || ""),
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
      brand_id: "",
      stocks: "",
      has_sizes: 0,
      size_category: "none",
      sizes: "",
      sizes_with_stock: "",
      colors: "",
      main_image: null, 
      additional_images: [] 
    })
    setShowModal(true)
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : "No Category"
  }

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId)
    return brand ? brand.brand_name : "No Brand"
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
                        <th>Category</th>
                        <th>Brand</th>
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
                              src={`${process.env.REACT_APP_IMAGE_URL}/${product.image}`}
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
                                    src={`${process.env.REACT_APP_IMAGE_URL}${image.image_url}`}
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
                          <td>{getCategoryName(product.category_id)}</td>
                          <td>{getBrandName(product.brand_id)}</td>
                          <td>₹{product.price}</td>
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
                        <label htmlFor="brand_id" className="form-label">
                          Brand
                        </label>
                        <select
                          className="form-control"
                          id="brand_id"
                          name="brand_id"
                          value={formData.brand_id}
                          onChange={handleInputChange}
                        >
                          <option value="">Select a brand</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.brand_name}
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
                        />
                        <small className="form-text text-muted">
                          Available quantity in stock
                        </small>
                      </div>

                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="has_sizes"
                          name="has_sizes"
                          checked={!!formData.has_sizes}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="has_sizes">
                          Has size options
                        </label>
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

                      {formData.has_sizes ? (
                        <>
                          <div className="mb-3">
                            <label htmlFor="size_category" className="form-label">Size Category</label>
                            <select
                              className="form-control"
                              id="size_category"
                              name="size_category"
                              value={formData.size_category}
                              onChange={handleInputChange}
                            >
                              <option value="none">None</option>
                              <option value="clothing">Clothing</option>
                              <option value="footwear">Footwear</option>
                              <option value="accessories">Accessories</option>
                            </select>
                            <small className="form-text text-muted">
                              Choose what type of sizes apply to this product.
                            </small>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="sizes" className="form-label">Sizes</label>
                            <input
                              type="text"
                              className="form-control"
                              id="sizes"
                              name="sizes"
                              placeholder="e.g. S,M,L,XL or 6,7,8,9"
                              value={formData.sizes}
                              onChange={handleInputChange}
                            />
                            <small className="form-text text-muted">
                              Comma-separated sizes. For clothing use S,M,L...; for footwear use 6,7,8...
                            </small>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="sizes_with_stock" className="form-label">Sizes with Stock (optional)</label>
                            <input
                              type="text"
                              className="form-control"
                              id="sizes_with_stock"
                              name="sizes_with_stock"
                              placeholder="e.g. S:10,M:5,L:0 or 6:12,7:8"
                              value={formData.sizes_with_stock || ""}
                              onChange={handleInputChange}
                            />
                            <small className="form-text text-muted">
                              Provide size:stock pairs. If set, this overrides the sizes list and sets stock per size.
                            </small>
                          </div>
                        </>
                      ) : null}

                      <div className="mb-3">
                        <label htmlFor="colors" className="form-label">Colors</label>
                        <input
                          type="text"
                          className="form-control"
                          id="colors"
                          name="colors"
                          placeholder="e.g. Red,Blue,Black"
                          value={formData.colors}
                          onChange={handleInputChange}
                        />
                        <small className="form-text text-muted">
                          Comma-separated color options.
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
                                >
                                  ×
                                </button>
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