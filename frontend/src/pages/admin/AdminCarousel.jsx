import React, { useState, useEffect } from "react"
import { carouselAPI } from "../../services/adminAPI"
import AdminNavbar from "../../components/AdminNavbar"

const AdminCarousel = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link_url: "",
    is_active: true,
    sort_order: 0,
    image: null,
  })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await carouselAPI.getAll()
      setImages(response.data.images)
    } catch (error) {
      console.error("Error fetching carousel images:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!editingImage && !formData.image) {
      alert("Please select an image")
      return
    }

    try {
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("link_url", formData.link_url)
      submitData.append("is_active", formData.is_active)
      submitData.append("sort_order", formData.sort_order)
      
      if (formData.image) {
        submitData.append("image", formData.image)
      }

      if (editingImage) {
        await carouselAPI.update(editingImage.id, submitData)
      } else {
        await carouselAPI.create(submitData)
      }

      setShowModal(false)
      setEditingImage(null)
      setFormData({
        title: "",
        description: "",
        link_url: "",
        is_active: true,
        sort_order: 0,
        image: null,
      })
      fetchImages()
    } catch (error) {
      console.error("Error saving carousel image:", error)
      alert("Error saving carousel image")
    }
  }

  const handleEdit = (image) => {
    setEditingImage(image)
    setFormData({
      title: image.title || "",
      description: image.description || "",
      link_url: image.link_url || "",
      is_active: image.is_active,
      sort_order: image.sort_order || 0,
      image: null,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this carousel image?")) {
      try {
        await carouselAPI.delete(id)
        fetchImages()
      } catch (error) {
        console.error("Error deleting carousel image:", error)
        alert("Error deleting carousel image")
      }
    }
  }

  const handleAddNew = () => {
    setEditingImage(null)
    setFormData({
      title: "",
      description: "",
      link_url: "",
      is_active: true,
      sort_order: 0,
      image: null,
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNavbar />
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
      
          <button className="btn btn-primary" onClick={handleAddNew}>
            <i className="bi bi-plus-circle me-2"></i>Add New Image
          </button>
        </div>

        <div className="row">
          {images.map((image) => (
            <div key={image.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card">
                <img
                  src={image.image_url}
                  className="card-img-top"
                  alt={image.title || "Carousel image"}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{image.title || "Untitled"}</h5>
                  <p className="card-text text-muted small">
                    {image.description || "No description"}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className={`badge ${image.is_active ? "bg-success" : "bg-secondary"}`}>
                      {image.is_active ? "Active" : "Inactive"}
                    </span>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(image)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(image.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-image display-1 text-muted"></i>
            <h4 className="text-muted mt-3">No carousel images found</h4>
            <p className="text-muted">Add your first carousel image to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingImage ? "Edit Carousel Image" : "Add New Carousel Image"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Image *</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleFileChange}
                          required={!editingImage}
                        />
                        {editingImage && (
                          <small className="text-muted">
                            Leave empty to keep current image
                          </small>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Sort Order</label>
                        <input
                          type="number"
                          className="form-control"
                          name="sort_order"
                          value={formData.sort_order}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter image title"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter image description"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Link URL</label>
                    <input
                      type="url"
                      className="form-control"
                      name="link_url"
                      value={formData.link_url}
                      onChange={handleInputChange}
                      placeholder="Enter link URL (optional)"
                    />
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingImage ? "Update" : "Create"}
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

export default AdminCarousel
