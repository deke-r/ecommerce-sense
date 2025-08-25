// Application constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
}

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
}

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
}

export const MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logged out successfully",
  SIGNUP_SUCCESS: "Account created successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  PRODUCT_ADDED_TO_CART: "Product added to cart successfully",
  ORDER_PLACED: "Order placed successfully",
  ADDRESS_SAVED: "Address saved successfully",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Please login to continue",
}
