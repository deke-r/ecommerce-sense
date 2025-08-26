"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { adminDashboardAPI } from "../../services/adminAPI"
import AdminNavbar from "../../components/AdminNavbar"

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await adminDashboardAPI.getStats()
      setStats(response.data.stats)
      setRecentOrders(response.data.recentOrders)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    navigate("/admin/login")
  }

  if (loading) {
    return (
     

      <>
      <AdminNavbar/>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
      </>
     
    )
  }

  return (
   
      <>

      <AdminNavbar/>
      

        <div className="p-4">
          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.totalUsers || 0}</h4>
                      <p className="mb-0">Total Users</p>
                    </div>
                    <i className="bi bi-people display-6"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.totalProducts || 0}</h4>
                      <p className="mb-0">Total Products</p>
                    </div>
                    <i className="bi bi-box-seam display-6"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{stats.totalOrders || 0}</h4>
                      <p className="mb-0">Total Orders</p>
                    </div>
                    <i className="bi bi-cart-check display-6"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>${stats.totalRevenue || 0}</h4>
                      <p className="mb-0">Total Revenue</p>
                    </div>
                    <i className="bi bi-currency-dollar display-6"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Orders</h5>
            </div>
            <div className="card-body">
              {recentOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.customer_name}</td>
                          <td>{new Date(order.order_date).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                order.status === "delivered"
                                  ? "success"
                                  : order.status === "shipped"
                                    ? "info"
                                    : order.status === "confirmed"
                                      ? "primary"
                                      : order.status === "cancelled"
                                        ? "danger"
                                        : "warning"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>${order.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No recent orders</p>
              )}
            </div>
          </div>
        </div>

      </>

     
  )
}

export default AdminDashboard
