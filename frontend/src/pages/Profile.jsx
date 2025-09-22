"use client"

import { useState, useEffect } from "react"
import { userAPI } from "../services/api"
import styles from "../style/ProductDetails.module.css"
import { useNavigate } from "react-router-dom"

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState({})
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      const userData = response.data.user
      setUser(userData)
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)

    // Validate password if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert("New passwords do not match")
        setUpdating(false)
        return
      }
      if (!formData.currentPassword) {
        alert("Current password is required to change password")
        setUpdating(false)
        return
      }
    }

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
      }

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      await userAPI.updateProfile(updateData)
      alert("Profile updated successfully!")

      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordForm(false)

      // Update localStorage user data
      const updatedUser = { ...user, name: formData.name, phone: formData.phone }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert(error.response?.data?.message || "Error updating profile")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-blue" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid mt-4">


<div className="row mx-md-2">
        <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
          <ol className={styles.breadcrumb + " d-flex align-items-center"} style={{ marginBottom: 0 }}>
            <li className={styles.breadcrumbItem}>
              <button className={styles.breadcrumbLink} onClick={() => navigate("/")}>
                Home
              </button>
            </li>
            <li className={`${styles.breadcrumbItem} ${styles.active}`}>
              Profile
            </li>

          </ol>
        </nav>
      </div>


      <div className="row mx-md-2 justify-content-center">
        <div className="col-lg-12">
          <div className="card rounded-0">
           
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label  ms-2 f_14 fw-semibold ">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-1 shadow-none py-2 f_14 fw-semibold text-muted"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label  ms-2 f_14 fw-semibold ">
                      Email
                    </label>
                    <input type="email" className="form-control rounded-1 shadow-none py-2 f_14 fw-semibold text-muted" id="email" value={user.email} disabled />
                    <small className="text-muted f_13 fw-semibold ms-2">Email cannot be changed</small>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label  ms-2 f_14 fw-semibold ">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control rounded-1 shadow-none py-2 f_14 fw-semibold text-muted"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input f_14 ms-2"
                      type="checkbox"
                      id="changePassword"
                      checked={showPasswordForm}
                      onChange={(e) => setShowPasswordForm(e.target.checked)}
                    />
                    <label className="form-check-label f_14 ms-1 fw-semibold" htmlFor="changePassword">
                      Change Password
                    </label>
                  </div>
                </div>

                {showPasswordForm && (
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="currentPassword" className="form-label  ms-2 f_14 fw-semibold ">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="form-control rounded-1 shadow-none py-2 f_14 fw-semibold text-muted"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="newPassword" className="form-label  ms-2 f_14 fw-semibold ">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="form-control rounded-1 shadow-none py-2 f_14 fw-semibold text-muted"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="confirmPassword" className="form-label  ms-2 f_14 fw-semibold ">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="form-control rounded-1 shadow-none py-2 f_14 fw-semibold text-muted"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <div className="d-grid">
                  <button type="submit" className="btn bg-blue text-light f_14 rounded-1 fw-semibold" disabled={updating}>
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Info
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">Account Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Account Status:</strong>{" "}
                    <span className={`badge ${user.status === "active" ? "bg-success" : "bg-secondary"}`}>
                      {user.status}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Account Type:</strong>{" "}
                    <span className={`badge ${user.role === "admin" ? "bg-danger" : "bg-primary"}`}>{user.role}</span>
                  </p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default Profile
