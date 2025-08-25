"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/AdminSidebar"
import { adminUsersAPI } from "../../services/adminAPI"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

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

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      await adminUsersAPI.updateStatus(userId, newStatus)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Error updating user status")
    }
  }

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="flex-grow-1">
        <div className="bg-white shadow-sm p-3">
          <h1 className="h3 mb-0">Users Management</h1>
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
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || "N/A"}</td>
                          <td>
                            <span className={`badge ${user.role === "admin" ? "bg-danger" : "bg-primary"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.status === "active" ? "bg-success" : "bg-secondary"}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            {user.role !== "admin" && (
                              <select
                                className="form-select form-select-sm"
                                value={user.status}
                                onChange={(e) => handleStatusUpdate(user.id, e.target.value)}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-4">
                    <i className="bi bi-people display-4 text-muted"></i>
                    <p className="text-muted mt-2">No users found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
