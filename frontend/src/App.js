import { Routes, Route, useLocation } from "react-router-dom"
import ErrorBoundary from "./components/ErrorBoundary"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import ProductDetails from "./pages/ProductDetails"
import Cart from "./pages/Cart"
import Address from "./pages/Address"
import Payment from "./pages/Payment"
import Orders from "./pages/Orders"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import NotFound from "./components/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminCoupons from "./pages/admin/AdminCoupons"
import AdminProtectedRoute from "./components/AdminProtectedRoute"
import ProductsByCategory from "./pages/ProductsByCategory"
import AllProducts from "./pages/AllProducts"
import Addresses from "./pages/Addresses"
import AllReviews from "./pages/AllReviews"
import AdminCarousel from "./pages/admin/AdminCarousel"
import Footer from "./components/Footer"
import ScrollToTop from "./components/ScrollToTop"
import Wishlist from "./pages/Wishlist"
import Contact from "./pages/Contact"
import FAQ from "./pages/FAQ"
import AdminBanners from "./pages/admin/AdminBanners"
import AdminBrands from "./pages/admin/AdminBrands"

function App() {
  const location = useLocation()
  
  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin')
  
  return (
    <ErrorBoundary>
      <div className="App">
        {/* Only show navbar for non-admin routes */}
        <ScrollToTop/>
        {!isAdminRoute && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id/" element={<ProductDetails />} />
          <Route path="/product/:productId/reviews" element={<AllReviews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />


          <Route path="/products/:id/:name" element={<ProductsByCategory />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/user/addresses" element={<Addresses />} />


          {/* Protected Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/address"
            element={
              <ProtectedRoute>
                <Address />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminProtectedRoute>
                <AdminProducts />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <AdminOrders />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminProtectedRoute>
                <AdminCategories />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminProtectedRoute>
                <AdminCoupons />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/col-3-banners"
            element={
              <AdminProtectedRoute>
                <AdminBanners />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/carousel"
            element={
              <AdminProtectedRoute>
                <AdminCarousel />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/brands"
            element={
              <AdminProtectedRoute>
                <AdminBrands />
              </AdminProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isAdminRoute && <Footer />}

      </div>
    </ErrorBoundary>
  )
}

export default App
