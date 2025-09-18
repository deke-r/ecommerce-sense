import axios from "axios"

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/api`

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/auth/reset-password", { token, password }),
}

// Products API
export const productsAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getByBrand: (brandId) => api.get(`/products/brand/${brandId}`),
  search: (query) => api.get(`/products/search?q=${query}`),
}

// Cart API
export const cartAPI = {
  getAll: () => api.get("/cart"),
  // aliases used by pages
  getItems: () => api.get("/cart"),
  addItem: (productId, quantity, selectedSize = null, selectedColor = null) => {
    const data = { quantity }
    if (selectedSize) data.selected_size = selectedSize
    if (selectedColor) data.selected_color = selectedColor
    return api.post(`/cart/add/${productId}`, data)
  },
  updateQuantity: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  // alias
  updateItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete("/cart"),
}

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post("/orders", orderData),
  getAll: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
}

// Address API
export const addressAPI = {
  getAll: () => api.get("/address"),
  create: (addressData) => api.post("/address", addressData),
  update: (id, addressData) => api.put(`/address/${id}`, addressData),
  delete: (id) => api.delete(`/address/${id}`),
}

// User API
export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (userData) => api.put("/user/profile", userData),
  changePassword: (passwordData) => api.put("/user/change-password", passwordData),
}

// Wishlist API
export const wishlistAPI = {
  getAll: () => api.get("/wishlist"),
  add: (productId) => api.post("/wishlist", { product_id: productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  check: (productId) => api.get(`/wishlist/check/${productId}`),
}

// Recently Viewed API
export const recentlyViewedAPI = {
  getAll: () => api.get("/recently-viewed"),
  add: (productId) => api.post("/recently-viewed", { product_id: productId }),
}

// Newsletter API
export const newsletterAPI = {
  subscribe: (email) => api.post("/newsletter/subscribe", { email }),
  unsubscribe: (email) => api.post("/newsletter/unsubscribe", { email }),
}

// Contact API
export const contactAPI = {
  submit: (formData) => api.post("/contact", formData),
}

// FAQ API
export const faqAPI = {
  getAll: () => api.get("/faq"),
}

// Analytics API
export const analyticsAPI = {
  trackView: (productId, userId) => api.post("/analytics/track-view", { product_id: productId, user_id: userId }),
  getProductAnalytics: () => api.get("/analytics/products"),
}

// Coupons API
export const couponsAPI = {
  getAll: () => api.get("/coupons"),
  validate: (code, orderAmount) => api.post("/coupons/validate", { code, orderAmount }),
  apply: (couponId, orderId) => api.post("/coupons/apply", { couponId, orderId }),
  // Admin APIs
  create: (couponData) => api.post("/coupons/admin", couponData),
  getAllAdmin: () => api.get("/coupons/admin"),
  update: (id, couponData) => api.put(`/coupons/admin/${id}`, couponData),
  delete: (id) => api.delete(`/coupons/admin/${id}`),
}

// Reviews API
export const reviewsAPI = {
  // Submit a review with optional images
  submit: (productId, reviewData, images = []) => {
    const formData = new FormData()
    formData.append('product_id', productId)
    formData.append('star', reviewData.star)
    formData.append('comment', reviewData.comment)
    
    // Add images to form data
    images.forEach((image, index) => {
      formData.append('images', image)
    })
    
    return api.post('/user/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Get reviews for a product (limited)
  getByProduct: (productId, page = 1, limit = 5) => 
    api.get(`/user/reviews/${productId}?page=${page}&limit=${limit}`),
  
  // Get all reviews for a product (for dedicated reviews page)
  getAllByProduct: (productId, page = 1, limit = 10) => 
    api.get(`/user/reviews/${productId}/all?page=${page}&limit=${limit}`),
}

// Brands API
export const brandsAPI = {
  getAll: () => api.get("/brands"),
  getActive: () => api.get("/brands/active"),
  getById: (id) => api.get(`/brands/${id}`),
}

export default api