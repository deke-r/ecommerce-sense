"use client"

import React, { useState, useEffect } from "react"
import { adminBannersAPI } from "../../services/adminAPI"
import AdminNavbar from "../../components/AdminNavbar"

const AdminBanners = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    image: null,
    link_url: "",
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await adminBannersAPI.getAll()
      console.log(response.data)
      // Use response.data directly, not response.data.banners
      setBanners(response.data || [])
    } catch (error) {
      console.error("Error fetching banners:", error)
    } finally {
      setLoading(false)
    }
  }
  

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    })
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.image) {
      alert("Please select an image")
      return
    }

    if (banners.length >= 3) {
      alert("Only 3 banners are allowed")
      return
    }

    try {
      const submitData = new FormData()
      submitData.append("image", formData.image)
      if (formData.link_url) {
        submitData.append("link_url", formData.link_url)
      }

      await adminBannersAPI.create(submitData)

      setShowModal(false)
      setFormData({ image: null, link_url: "" })
      fetchBanners()
    } catch (error) {
      console.error("Error saving banner:", error)
      alert("Error saving banner")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await adminBannersAPI.delete(id)
        fetchBanners()
      } catch (error) {
        console.error("Error deleting banner:", error)
        alert("Error deleting banner")
      }
    }
  }

  const handleAddNew = () => {
    if (banners.length >= 3) {
      alert("Only 3 banners are allowed")
      return
    }
    setFormData({ image: null, link_url: "" })
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
          <h4>Banners (Max 3)</h4>
          <button className="btn btn-primary" onClick={handleAddNew}>
            <i className="bi bi-plus-circle me-2"></i>Add New Banner
          </button>
        </div>

        <div className="row">
          {banners.map((banner) => (
            <div key={banner.id} className="col-md-4 mb-4">
              <div className="card">
                <img
                  src={`${process.env.REACT_APP_IMAGE_URL}${banner.image_url}`}
                  className="card-img-top"
                  alt="Banner"
                  style={{ height: "250px", objectFit: "cover" }}
                />

                <div className="card-body text-center">
                  {banner.link_url && (
                    <p className="text-muted small mb-2">
                      <i className="bi bi-link-45deg"></i>{" "}
                      <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                        {banner.link_url}
                      </a>
                    </p>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <i className="bi bi-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>

          ))}
        </div>

        {banners.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-image display-1 text-muted"></i>
            <h4 className="text-muted mt-3">No banners found</h4>
            <p className="text-muted">Add up to 3 banners</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Banner</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Banner Image *</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Link (Optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      name="link_url"
                      value={formData.link_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
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
                    Save
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

export default AdminBanners
