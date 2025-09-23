"use client"

import { useState, useEffect } from "react"
import { ordersAPI } from "../services/api"
import styles from "../style/ProductDetails.module.css"
import { useNavigate } from "react-router-dom"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll()
      setOrders(response.data.orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return "bi-check-circle-fill"
      case "shipped":
        return "bi-truck"
      case "confirmed":
        return "bi-check-circle"
      case "cancelled":
        return "bi-x-circle-fill"
      default:
        return "bi-clock"
    }
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
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
             Orders
            </li>

         

          </ol>
        </nav>
      </div>

      {orders.length === 0 ? (
        <div className="row mx-md-2">
          <div className="col-12">
            <div className="card rounded-0">
              <div className="card-body text-center py-5">
                <i className="bi bi-cart-x display-1 text-muted"></i>
                <h3 className="mt-3 f_16 fw-semibold">No orders yet</h3>
                <p className="text-muted f_13 fw-semibold">You haven't placed any orders yet.</p>
                <a href="/" className="btn btn-primary rounded-1 f_14 fw-semibold">
                  <i className="bi bi-arrow-left me-2"></i>
                  Start Shopping
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-12 mb-4">
              <div className="card rounded-0">
                <div className="card-header">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <strong>Order #{order.id}</strong>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">
                        {new Date(order.order_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </small>
                    </div>
                    <div className="col-md-3">
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        <i className={`${getStatusIcon(order.status)} me-1`}></i>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="col-md-3 text-end">
                      <strong>${order.total}</strong>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <h6 className="mb-2">Items:</h6>
                      <p className="text-muted mb-0">{order.products}</p>
                    </div>
                    <div className="col-md-4 text-end">
                      {order.status === "pending" && (
                        <small className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Order is being processed
                        </small>
                      )}
                      {order.status === "confirmed" && (
                        <small className="text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Order confirmed
                        </small>
                      )}
                      {order.status === "shipped" && (
                        <small className="text-info">
                          <i className="bi bi-truck me-1"></i>
                          Order shipped
                        </small>
                      )}
                      {order.status === "delivered" && (
                        <small className="text-success">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Order delivered
                        </small>
                      )}
                      {order.status === "cancelled" && (
                        <small className="text-danger">
                          <i className="bi bi-x-circle-fill me-1"></i>
                          Order cancelled
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
