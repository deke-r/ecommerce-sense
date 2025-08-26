"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"

import { adminUsersAPI } from "../../services/adminAPI"
import AdminNavbar from "../../components/AdminNavbar"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "user",
      status: "active"
    }
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await adminUsersAPI.getAll()
      setUsers(response.data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await adminUsersAPI.updateStatus(editingUser.id, data)
      } else {
        // Note: Creating users might not be implemented in the backend yet
        // You may need to add this functionality
        alert("User creation not implemented yet")
        return
      }

      setShowModal(false)
      setEditingUser(null)
      reset()
      fetchUsers()
    } catch (error) {
      console.error("Error saving user:", error)
      alert("Error saving user")
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setValue("name", user.name)
    setValue("email", user.email)
    setValue("phone", user.phone || "")
    setValue("role", user.role)
    setValue("status", user.status)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Note: User deletion might not be implemented in the backend yet
        alert("User deletion not implemented yet")
        return
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("Error deleting user")
      }
    }
  }

  const openAddModal = () => {
    setEditingUser(null)
    reset()
    setShowModal(true)
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      await adminUsersAPI.updateStatus(id, currentStatus === 'active' ? 'inactive' : 'active')
      fetchUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Error updating user status")
    }
  }

  return (
   <>
   <AdminNavbar/>
        <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">Users Management</h1>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-2"></i>
            Add User
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
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || "No phone"}</td>
                          <td>
                            <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-secondary me-2" 
                              onClick={() => toggleStatus(user.id, user.status)}
                              title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              <i className={`bi ${user.status === 'active' ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(user)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user.id)}>
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
      

      {/* User Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingUser ? "Edit User" : "Add User"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      {...register("name", { 
                        required: "Full name is required",
                        minLength: { value: 2, message: "Name must be at least 2 characters" },
                        maxLength: { value: 100, message: "Name must be less than 100 characters" }
                      })}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name.message}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email address"
                        }
                      })}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email.message}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      {...register("phone", {
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: "Please enter a valid phone number"
                        }
                      })}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone.message}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">
                      Role <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-control ${errors.role ? 'is-invalid' : ''}`}
                      id="role"
                      {...register("role", { 
                        required: "Role is required" 
                      })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    {errors.role && (
                      <div className="invalid-feedback">{errors.role.message}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="status" className="form-label">
                      Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                      id="status"
                      {...register("status", { 
                        required: "Status is required" 
                      })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {errors.status && (
                      <div className="invalid-feedback">{errors.status.message}</div>
                    )}
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
                        {editingUser ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      `${editingUser ? "Update" : "Add"} User`
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

export default AdminUsers
