import { useState, useEffect } from 'react'
import { couponsAPI } from '../../services/api'

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    valid_until: ''
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await couponsAPI.getAllAdmin()
      setCoupons(response.data.coupons)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      alert('Error fetching coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const couponData = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_until: formData.valid_until || null
      }

      if (editingCoupon) {
        await couponsAPI.update(editingCoupon.id, couponData)
        alert('Coupon updated successfully')
      } else {
        await couponsAPI.create(couponData)
        alert('Coupon created successfully')
      }

      setShowForm(false)
      setEditingCoupon(null)
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        valid_until: ''
      })
      fetchCoupons()
    } catch (error) {
      console.error('Error saving coupon:', error)
      alert(error.response?.data?.message || 'Error saving coupon')
    }
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount.toString(),
      max_discount_amount: coupon.max_discount_amount ? coupon.max_discount_amount.toString() : '',
      usage_limit: coupon.usage_limit ? coupon.usage_limit.toString() : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponsAPI.delete(id)
        alert('Coupon deleted successfully')
        fetchCoupons()
      } catch (error) {
        console.error('Error deleting coupon:', error)
        alert('Error deleting coupon')
      }
    }
  }

  const toggleCouponStatus = async (coupon) => {
    try {
      await couponsAPI.update(coupon.id, {
        ...coupon,
        is_active: !coupon.is_active
      })
      alert(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'} successfully`)
      fetchCoupons()
    } catch (error) {
      console.error('Error updating coupon status:', error)
      alert('Error updating coupon status')
    }
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Coupon Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true)
            setEditingCoupon(null)
            setFormData({
              code: '',
              description: '',
              discount_type: 'percentage',
              discount_value: '',
              min_order_amount: '',
              max_discount_amount: '',
              usage_limit: '',
              valid_until: ''
            })
          }}
        >
          Add New Coupon
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="code" className="form-label">Coupon Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., WELCOME10"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="discount_type" className="form-label">Discount Type *</label>
                  <select
                    className="form-select"
                    id="discount_type"
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="discount_value" className="form-label">Discount Value *</label>
                  <input
                    type="number"
                    className="form-control"
                    id="discount_value"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder={formData.discount_type === 'percentage' ? '10' : '50'}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="min_order_amount" className="form-label">Minimum Order Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    id="min_order_amount"
                    name="min_order_amount"
                    value={formData.min_order_amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="max_discount_amount" className="form-label">Max Discount Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    id="max_discount_amount"
                    name="max_discount_amount"
                    value={formData.max_discount_amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Leave empty for no limit"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="usage_limit" className="form-label">Usage Limit</label>
                  <input
                    type="number"
                    className="form-control"
                    id="usage_limit"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="valid_until" className="form-label">Valid Until</label>
                  <input
                    type="date"
                    className="form-control"
                    id="valid_until"
                    name="valid_until"
                    value={formData.valid_until}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Coupon description"
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCoupon(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <code>{coupon.code}</code>
                    </td>
                    <td>{coupon.description || '-'}</td>
                    <td>
                      <span className={`badge ${coupon.discount_type === 'percentage' ? 'bg-primary' : 'bg-info'}`}>
                        {coupon.discount_type}
                      </span>
                    </td>
                    <td>
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%`
                        : `₹${coupon.discount_value}`
                      }
                    </td>
                    <td>₹{coupon.min_order_amount}</td>
                    <td>
                      {coupon.used_count || 0}
                      {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                    </td>
                    <td>
                      <span className={`badge ${coupon.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {coupon.valid_until 
                        ? new Date(coupon.valid_until).toLocaleDateString()
                        : 'No expiry'
                      }
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(coupon)}
                        >
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${coupon.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => toggleCouponStatus(coupon)}
                        >
                          {coupon.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCoupons
