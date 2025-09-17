import React, { useState, useEffect } from 'react'
import { adminBrandsAPI } from '../../services/adminAPI'
import AdminNavbar from '../../components/AdminNavbar'

const AdminBrands = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [formData, setFormData] = useState({
    brand_name: '',
    brand_image: null,
    is_active: 1
  })

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await adminBrandsAPI.getAll()
      setBrands(response.data.brands)
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target
    if (name === 'brand_image') {
      setFormData({ ...formData, brand_image: files ? files[0] : null })
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked ? 1 : 0 })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const data = new FormData()
    data.append('brand_name', formData.brand_name)
    data.append('is_active', formData.is_active)
    
    if (formData.brand_image) {
      data.append('brand_image', formData.brand_image)
    }

    try {
      if (editingBrand) {
        await adminBrandsAPI.update(editingBrand.id, data)
      } else {
        await adminBrandsAPI.create(data)
      }

      setShowModal(false)
      setEditingBrand(null)
      setFormData({ brand_name: '', brand_image: null, is_active: 1 })
      fetchBrands()
      alert(editingBrand ? 'Brand updated successfully!' : 'Brand created successfully!')
    } catch (error) {
      console.error('Error saving brand:', error)
      alert(error.response?.data?.message || 'Error saving brand')
    }
  }

  const handleEdit = (brand) => {
    setEditingBrand(brand)
    setFormData({
      brand_name: brand.brand_name,
      brand_image: null,
      is_active: brand.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await adminBrandsAPI.delete(id)
        fetchBrands()
        alert('Brand deleted successfully!')
      } catch (error) {
        console.error('Error deleting brand:', error)
        alert(error.response?.data?.message || 'Error deleting brand')
      }
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await adminBrandsAPI.toggleStatus(id)
      fetchBrands()
      alert('Brand status updated successfully!')
    } catch (error) {
      console.error('Error updating brand status:', error)
      alert('Error updating brand status')
    }
  }

  const openAddModal = () => {
    setEditingBrand(null)
    setFormData({ brand_name: '', brand_image: null, is_active: 1 })
    setShowModal(true)
  }

  return (
    <>
      <AdminNavbar />
      
      <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Brand Management</h4>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Brand
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
                      <th>Brand Image</th>
                      <th>Brand Name</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((brand) => (
                      <tr key={brand.id}>
                        <td>
                          {brand.brand_image ? (
                            <img
                              src={`${process.env.REACT_APP_IMAGE_URL}/${brand.brand_image}`}
                              alt={brand.brand_name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              className="rounded"
                            />
                          ) : (
                            <div 
                              className="bg-light rounded d-flex align-items-center justify-content-center"
                              style={{ width: '50px', height: '50px' }}
                            >
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{brand.brand_name}</strong>
                        </td>
                        <td>
                          <span className={`badge ${brand.is_active ? 'bg-success' : 'bg-danger'}`}>
                            {brand.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          {new Date(brand.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary me-2" 
                            onClick={() => handleEdit(brand)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-warning me-2" 
                            onClick={() => handleToggleStatus(brand.id)}
                          >
                            <i className={`bi ${brand.is_active ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => handleDelete(brand.id)}
                          >
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

      {/* Brand Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBrand ? 'Edit Brand' : 'Add Brand'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="brand_name" className="form-label">
                      Brand Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="brand_name"
                      name="brand_name"
                      value={formData.brand_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="brand_image" className="form-label">
                      Brand Image
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="brand_image"
                      name="brand_image"
                      accept="image/*"
                      onChange={handleInputChange}
                    />
                    <small className="form-text text-muted">
                      Upload a logo or image for this brand (optional)
                    </small>
                  </div>

                  {formData.brand_image && (
                    <div className="mb-3">
                      <label className="form-label">Image Preview:</label>
                      <div>
                        <img
                          src={URL.createObjectURL(formData.brand_image)}
                          alt="Brand image preview"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          className="rounded border"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active === 1}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      Active Brand
                    </label>
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
                    {editingBrand ? 'Update' : 'Create'} Brand
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

export default AdminBrands



