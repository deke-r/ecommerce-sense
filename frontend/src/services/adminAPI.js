import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

// Create axios instance for admin
const adminAPI = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      window.location.href = "/admin/login"
    }
    return Promise.reject(error)
  },
)

// Admin Auth API
export const adminAuthAPI = {
  login: (credentials) => adminAPI.post("/auth/login", credentials),
}

// Admin Products API
export const adminProductsAPI = {
  getAll: () => adminAPI.get("/products"),
  getById: (id) => adminAPI.get(`/products/${id}`),
  create: (formData) =>
    adminAPI.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    adminAPI.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => adminAPI.delete(`/products/${id}`),
}

// Admin Orders API
export const adminOrdersAPI = {
  getAll: () => adminAPI.get("/admin/orders"),
  updateStatus: (id, status) => adminAPI.put(`/admin/orders/${id}`, { status }),
}

// Admin Users API
export const adminUsersAPI = {
  getAll: () => adminAPI.get("/admin/users"),
  updateStatus: (id, status) => adminAPI.put(`/admin/users/${id}`, { status }),
}

// Admin Categories API
export const adminCategoriesAPI = {
  getAll: () => adminAPI.get("/admin/categories"),
  create: (data) => adminAPI.post("/admin/categories", data),
  update: (id, data) => adminAPI.put(`/admin/categories/${id}`, data),
  delete: (id) => adminAPI.delete(`/admin/categories/${id}`),
}

// Admin Dashboard API
export const adminDashboardAPI = {
  getStats: () => adminAPI.get("/admin/dashboard"),
}

// Carousel Images API
export const carouselAPI = {
  // Get all carousel images
  getAll: () => adminAPI.get("/admin/carousel"),

  // Get active carousel images
  getActive: () => adminAPI.get("/admin/carousel/active"),

  // Create carousel image
  create: (formData) => adminAPI.post("/admin/carousel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),

  // Update carousel image
  update: (id, formData) => adminAPI.put(`/admin/carousel/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),

  // Delete carousel image
  delete: (id) => adminAPI.delete(`/admin/carousel/${id}`),
}

export default adminAPI
