const jwt = require("jsonwebtoken")
const { getConnection } = require("../config/database")

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database
    const con = getConnection()
    const [users] = await con.execute("SELECT id, name, email, role, status FROM users WHERE id = ?", [decoded.userId])

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid token." })
    }

    if (users[0].status === "inactive") {
      return res.status(401).json({ message: "Account is inactive." })
    }

    req.user = users[0]
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token." })
  }
}

// Check if user is admin
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." })
  }
  next()
}

module.exports = { verifyToken, verifyAdmin }
