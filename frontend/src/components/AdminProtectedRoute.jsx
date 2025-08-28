import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken")
  let payload = null

  if (token) {
    try {
      payload = jwtDecode(token)
    } catch {
      payload = null
    }
  }

  const now = Math.floor(Date.now() / 1000)
  if (!token || !payload || payload.exp <= now || payload.role !== "admin") {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminProtectedRoute