"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cartAPI } from "../services/api"
import { ShoppingCart, User, LogOut, Package, Home } from "lucide-react"
import styles from "../style/navbar.module.css"

const AdminNavbar = () => {
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
      fetchCartCount()
    }

    const handleCartUpdate = () => {
      if (localStorage.getItem("user")) {
        fetchCartCount()
      }
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  const fetchCartCount = async () => {
    try {
      const response = await cartAPI.getItems()
      setCartCount(response.data.cartItems.length)
    } catch (error) {
      console.error("Error fetching cart count:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setCartCount(0)
    navigate("/")
  }

  const isActive = (path) => (location.pathname === path ? styles.active : "")

  return (
    <nav className={`navbar navbar-expand-lg py-3 position-sticky top-0 z-3 navbar-light bg-white shadow-sm ${styles.navbarCustom}`}>
      <div className="container-fluid">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center fw-semibold f_14 text-uppercase text-muted" to="/admin/dashboard">
         Admin Panel
        </Link>

        {/* Toggler for Offcanvas */}
        <button
          className="navbar-toggler d-flex d-lg-none order-3 p-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#bdNavbar"
          aria-controls="bdNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Offcanvas Menu */}
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="bdNavbar">
          <div className="offcanvas-header px-4 pb-0">
            <Link className="navbar-brand" to="/">
              {/* <img src="/images/main-logo.png" alt="Logo" className={styles.logo} /> */}
              Logo
            </Link>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>

          <div className="offcanvas-body">
          <ul className="navbar-nav ms-auto text-uppercase align-items-center pe-3">

              <li className="nav-item">
                <Link className={`nav-link f_13 fw-semibold me-4 ${isActive("/admin/dashboard")}`} to="/admin/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link f_13 fw-semibold me-4 ${isActive("/admin/products")}`} to="/admin/products">
                  Products
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link f_13 fw-semibold me-4 ${isActive("/admin/categories")}`} to="/admin/categories">
                  Category
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link f_13 fw-semibold me-4 ${isActive("/admin/orders")}`} to="/admin/orders">
                  Orders
                </Link>
              </li>


              {/* User / Profile */}
              <li className="nav-item dropdown">
                {user ? (
                  <>
                    <a
                      className="nav-link dropdown-toggle f_13 fw-semibold text-muted d-flex align-items-center"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                    >
                      <User size={16} className="me-1" />
                      {user.name}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                      <li>
                        <Link className="dropdown-item f_13 fw-semibold text-muted" to="/admin/profile">
                          <User size={16} className="me-2" /> Profile
                        </Link>
                      </li>
                     
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button className="dropdown-item text-danger f_13 fw-semibold " onClick={handleLogout}>
                          <LogOut size={16} className="me-2" /> Logout
                        </button>
                      </li>
                    </ul>
                  </>
                ) : (
                  <>
                    <a
                      className="nav-link me-4 d-flex align-items-center"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                    >
                      <User size={20} className="me-1" />
                      
                    </a>
                    <ul className="dropdown-menu  rounded-0 dropdown-menu-end shadow-sm">
                      <li>
                        <Link className="dropdown-item f_13 fw-semibold text-muted" to="/login">
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item f_13 fw-semibold text-muted" to="/signup">
                          Sign Up
                        </Link>
                      </li>
                    </ul>
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar
