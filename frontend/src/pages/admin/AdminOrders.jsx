"use client"

import { useState, useEffect } from "react"
import { adminOrdersAPI } from "../../services/adminAPI"
import AdminNavbar from "../../components/AdminNavbar"

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await adminOrdersAPI.getAll()
      setOrders(response.data.orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminOrdersAPI.updateStatus(orderId, newStatus)
      fetchOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Error updating order status")
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-success"
      case "shipped":
        return "bg-info"
      case "confirmed":
        return "bg-primary"
      case "cancelled":
        return "bg-danger"
      default:
        return "bg-warning"
    }
  }

  return (
 <>

 <AdminNavbar/>
 
      

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
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Products</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.customer_name}</td>
                          <td>{order.customer_email}</td>
                          <td>
                            <small>{order.products}</small>
                          </td>
                          <td>{new Date(order.order_date).toLocaleDateString()}</td>
                          <td>${order.total}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {orders.length === 0 && (
                  <div className="text-center py-4">
                    <i className="bi bi-cart-x display-4 text-muted"></i>
                    <p className="text-muted mt-2">No orders found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </>
  )
}

export default AdminOrders
