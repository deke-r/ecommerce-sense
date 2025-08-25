"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { adminAuthAPI } from "../../services/adminAPI"

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await adminAuthAPI.login(formData)
      const { token, user } = response.data

      if (user.role !== "admin") {
        setError("Access denied. Admin privileges required.")
        return
      }

      localStorage.setItem("adminToken", token)
      localStorage.setItem("adminUser", JSON.stringify(user))

      navigate("/admin/dashboard")
    } catch (error) {
      setError(error.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid vh-50  d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-md-4">
          <div className="card shadow-lg mt-5 rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock display-4 text-blue"></i>
                <h2 className="mt-3">Admin Login</h2>
                <p className="text-muted">Access the admin dashboard</p>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-muted  ms-2 f_14 fw-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control f_13 fw-semibold rounded-4 shadow-none py-2 text-muted"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@ecommerce.com"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label text-muted  ms-2 f_14 fw-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control f_13 fw-semibold rounded-4 shadow-none py-2 text-muted"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter admin password"
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn bg-blue py-2 text-white rounded-4 f_13 fw-semibold btn-lg" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login to Admin Panel
                      </>
                    )}
                  </button>
                </div>
              </form>

            
            
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
