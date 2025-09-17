"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { User, LogOut } from "lucide-react"
import styles from "../style/navbar.module.css"
import { jwtDecode } from "jwt-decode"

const AdminNavbar = () => {
  const [admin, setAdmin] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    try {
      const payload = token ? jwtDecode(token) : null
      if (payload && payload.role === "admin") {
        setAdmin({ name: payload.name || "Admin" })
      } else {
        setAdmin(null)
      }
    } catch {
      setAdmin(null)
    }
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    setAdmin(null)
    navigate("/admin/login")
  }

  const isActive = (path) => (location.pathname === path ? styles.active : "")

  return (
    <nav className={`navbar navbar-expand-lg py-3 position-sticky top-0 z-3 navbar-light bg-white shadow-sm ${styles.navbarCustom}`}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center fw-semibold f_14 text-uppercase text-muted" to="/admin/dashboard">
         Admin Panel
        </Link>

        <button
          className="navbar-toggler d-flex d-lg-none order-3 p-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#bdNavbar"
          aria-controls="bdNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="offcanvas offcanvas-end" tabIndex="-1" id="bdNavbar">
          <div className="offcanvas-header px-4 pb-0">
            <Link className="navbar-brand" to="/">
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
                <Link className={`nav-link f_13 fw-semibold me-4 ${isActive("/admin/col-3-banners")}`} to="/admin/col-3-banners">
                 Col 3 Banners
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link f_13 fw-semibold me-4 ${isActive("/admin/carousel")}`} to="/admin/carousel">
                  Banners
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
              <li className="nav-item">
                <Link className={`nav-link f_13 fw-semibold me-4 ${isActive("/admin/coupons")}`} to="/admin/coupons">
                  Coupons
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link f_13 fw-semibold me-4 ${isActive("/admin/brands")}`} 
                  to="/admin/brands"
                >
                  <i className="bi bi-award me-2"></i>
                  Brands
                </Link>
              </li>
            

              <li className="nav-item dropdown">
                {admin ? (
                  <>
                    <a
                      className="nav-link dropdown-toggle f_13 fw-semibold text-muted d-flex align-items-center"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                    >
                      <User size={16} className="me-1" />
                      {admin.name}
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
                ) : null}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar