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

export default api
