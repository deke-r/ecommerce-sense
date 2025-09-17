"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cartAPI, wishlistAPI, productsAPI } from "../services/api"
import { ShoppingCart, User, LogOut, Package, MapPinPlus, Heart, Search, X } from "lucide-react"
import styles from "../style/navbar.module.css"

const UserMenu = ({ isLoggedIn, user, cartCount, wishlistCount, handleLogout }) => {
  if (isLoggedIn) {
    return (
      <>
       

        <li className="nav-item">
          <Link className="nav-link text-white position-relative" to="/wishlist">
            <Heart size={16} className="me-1" /> <span className="d-lg-inline d-none f_14 fw-semibold">Wishlist</span>
            {wishlistCount > 0 && <span className={`${styles.badge}`}>{wishlistCount}</span>}
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link text-white position-relative" to="/cart">
            <ShoppingCart size={16} className="me-1" /> <span className="d-lg-inline d-none f_14 fw-semibold ">Cart</span>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>
        </li>

        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle text-white d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
            <User size={16} className="me-1" />
            <span className="d-lg-inline d-none f_14 fw-semibold">{user?.name || "Profile"}</span>
          </a>
          <ul className="dropdown-menu dropdown-menu-end rounded-0">
            <li><Link className="dropdown-item f_14 fw-semibold" to="/profile"><User size={16} className="me-2" /> Profile</Link></li>
            <li><Link className="dropdown-item f_14 fw-semibold" to="/orders"><Package size={16} className="me-2" /> My Orders</Link></li>
            <li><Link className="dropdown-item f_14 fw-semibold" to="/user/addresses"><MapPinPlus size={16} className="me-2" /> My Address</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item text-danger f_14 fw-semibold" onClick={handleLogout}><LogOut size={16} className="me-2" /> Logout</button></li>
          </ul>
        </li>
      </>
    )
  }

  return (
    <li className="nav-item dropdown">
      <a className="nav-link dropdown-toggle text-white d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
        <User size={16} className="me-1" />
        <span className="d-lg-inline d-none f_14 fw-semibold">Login</span>
      </a>
      <ul className="dropdown-menu dropdown-menu-end rounded-0">
        <li><Link className="dropdown-item f_14 fw-semibold" to="/login">Login</Link></li>
        <li><Link className="dropdown-item f_14 fw-semibold" to="/signup">Sign Up</Link></li>
      </ul>
    </li>
  )
}

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    setIsLoggedIn(!!token)
    if (userData) {
      setUser(JSON.parse(userData))
      fetchCartCount()
      fetchWishlistCount()
    }
    const handleCartUpdate = () => localStorage.getItem("token") && fetchCartCount()
    const handleWishlistUpdate = () => localStorage.getItem("token") && fetchWishlistCount()
    window.addEventListener("cartUpdated", handleCartUpdate)
    window.addEventListener("wishlistUpdated", handleWishlistUpdate)
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim().length >= 2) search(searchQuery.trim())
      else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const fetchCartCount = async () => {
    try { const r = await cartAPI.getItems(); setCartCount(r.data.cartItems.length) } catch {}
  }
  const fetchWishlistCount = async () => {
    try { const r = await wishlistAPI.getAll(); setWishlistCount(r.data.wishlist.length) } catch {}
  }

  const search = async (q) => {
    setIsSearching(true)
    try {
      const r = await productsAPI.search(q)
      setSuggestions(r.data.products || [])
      setShowSuggestions(true)
    } finally { setIsSearching(false) }
  }

  const submitSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    setShowSuggestions(false)
    setSearchQuery("")
  }

  const goToProduct = (id) => {
    navigate(`/product/${id}`)
    setShowSuggestions(false)
    setSearchQuery("")
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUser(null)
    setCartCount(0)
    setWishlistCount(0)
    navigate("/")
  }

  return (
    <nav className={`${styles.navbar} navbar navbar-expand-lg`}>
      <div className="container-fluid">
        {/* Left: Logo */}
        <Link className={styles.logo} to="/">
          <img src="/images/main-logo.png" alt="Logo" className={styles.logoImage} />
        </Link>

        {/* Toggler - Bootstrap collapse (no offcanvas) */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Center + Right inside collapse */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          {/* Center: Search */}
          <div className={`mx-lg-4 my-2 my-lg-0 ${styles.searchContainer}`}>
            <form onSubmit={submitSearch} className={styles.searchForm}>
              <div className={styles.searchInputWrapper}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <button type="submit" className={styles.searchButton}><Search size={18} /></button>
                {searchQuery && (
                  <button type="button" className={styles.clearButton} onClick={() => setSearchQuery("")}><X size={14} /></button>
                )}
              </div>

              {showSuggestions && (
                <div className={styles.suggestionsDropdown}>
                  {isSearching ? (
                    <div className={styles.searchLoading}>
                      <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Searching...</span></div>
                      <span className="ms-2">Searching...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      <div className={styles.suggestionsHeader}>Suggestions ({suggestions.length})</div>
                      {suggestions.map(p => (
                        <div key={p.id} className={styles.suggestionItem} onMouseDown={() => goToProduct(p.id)}>
                          <img src={`${process.env.REACT_APP_IMAGE_URL}/${p.image}`} alt={p.title} className={styles.suggestionImage} />
                          <div className={styles.suggestionInfo}>
                            <div className={styles.suggestionTitle}>{p.title}</div>
                            <div className={styles.suggestionPrice}>₹{p.price}</div>
                            {p.category_name && <div className={styles.suggestionCategory}>{p.category_name}</div>}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className={styles.noSuggestions}>No products found for "{searchQuery}"</div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right: Actions (works for desktop and mobile) */}
          <ul className="navbar-nav ms-auto align-items-lg-center">
            

            <UserMenu
              isLoggedIn={isLoggedIn}
              user={user}
              cartCount={cartCount}
              wishlistCount={wishlistCount}
              handleLogout={logout}
            />
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
