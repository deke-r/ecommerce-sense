"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"

import { adminCategoriesAPI } from "../../services/adminAPI"
import AdminNavbar from "../../components/AdminNavbar"

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await adminCategoriesAPI.getAll()
      setCategories(response.data.categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description)
      formData.append("is_active", data.is_active ? 1 : 0)


      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      if (editingCategory) {
        await adminCategoriesAPI.update(editingCategory.id, formData)
      } else {
        await adminCategoriesAPI.create(formData)
      }

      setShowModal(false)
      setEditingCategory(null)
      reset()
      setImagePreview(null)
      setSelectedImage(null)
      fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Error saving category")
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setValue("name", category.name)
    setValue("description", category.description)
    setValue("is_active", !!category.is_active)
    setImagePreview(category.image)
    setSelectedImage(null)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await adminCategoriesAPI.delete(id)
        fetchCategories()
      } catch (error) {
        console.error("Error deleting category:", error)
        alert("Error deleting category")
      }
    }
  }

  const openAddModal = () => {
    setEditingCategory(null)
    reset()
    setImagePreview(null)
    setSelectedImage(null)
    setShowModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result) // ✅ this is already usable in <img src>
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    document.getElementById("image").value = ""
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      await adminCategoriesAPI.update(id, { is_active: !currentStatus })
      fetchCategories()
    } catch (error) {
      console.error("Error updating category status:", error)
      alert("Error updating category status")
    }
  }

  return (
    <>
      <AdminNavbar />

      <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
        <button className="btn bg-blue fw-semibold f_13 text-light rounded-2" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Category
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
                      <th>Image</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          {category.image_url ? (
                            <img
                              src={`${process.env.REACT_APP_IMAGE_URL}${category.image_url}`}
                              alt={category.name}
                              style={{ width: "50px", height: "50px", objectFit: "cover" }}
                              className="rounded"
                            />
                          ) : (
                            <div
                              className="bg-light d-flex align-items-center justify-content-center rounded"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                        </td>
                        <td>{category.name}</td>
                        <td>{category.description || "No description"}</td>
                        <td>
                          <span className={`badge ${category.is_active ? "bg-success" : "bg-danger"}`}>
                            {category.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{new Date(category.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(category)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(category.id)}>
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

      {/* Category Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingCategory ? "Edit Category" : "Add Category"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="image" className="form-label">
                      Category Image
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      name="image"
                    />
                    <small className="form-text text-muted">Upload an image for the category (optional)</small>
                    {imagePreview && (
                      <div className="mt-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={imagePreview}  // ✅ works for both full URL & base64
                            alt="Preview"
                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                            className="rounded border"
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={removeImage}
                          >
                            <i className="bi bi-trash"></i> Remove
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Category Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      id="name"
                      {...register("name", {
                        required: "Category name is required",
                        minLength: { value: 2, message: "Name must be at least 2 characters" },
                        maxLength: { value: 255, message: "Name must be less than 255 characters" },
                      })}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className={`form-control ${errors.description ? "is-invalid" : ""}`}
                      id="description"
                      rows="3"
                      {...register("description", {
                        maxLength: { value: 1000, message: "Description must be less than 1000 characters" },
                      })}
                    ></textarea>
                    {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="is_active" {...register("is_active")} />
                      <label className="form-check-label" htmlFor="is_active">
                        Active Category
                      </label>
                      <small className="form-text text-muted d-block">
                        Inactive categories won't be visible to customers
                      </small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {editingCategory ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      `${editingCategory ? "Update" : "Add"} Category`
                    )}
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

export default AdminCategories
