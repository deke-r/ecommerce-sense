import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

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
  signup: (userData) => api.post("/auth/signup", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  resetPassword: (email, otp, newPassword) => api.post("/auth/reset-password", { email, otp, newPassword }),
}

// Products API
export const productsAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
}

// Cart API
export const cartAPI = {
  getItems: () => api.get("/cart"),
  addItem: (productId, quantity) => api.post("/cart", { product_id: productId, quantity }),
  updateItem: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  removeItem: (id) => api.delete(`/cart/${id}`),
}

// Orders API
export const ordersAPI = {
  create: (addressId) => api.post("/orders", { address_id: addressId }),
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
  updateProfile: (profileData) => api.put("/user/profile", profileData),
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
  add: (productId) => api.post("/recently-viewed", { product_id: productId }),
  getAll: () => api.get("/recently-viewed"),
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

export default api
