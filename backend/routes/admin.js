const express = require("express")
const { getConnection } = require("../config/database")
const { verifyToken, verifyAdmin } = require("../middleware/auth")

const router = express.Router()

// Get all orders (Admin only)
router.get("/orders", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const con = getConnection()

    const [orders] = await con.execute(`
      SELECT o.id, o.order_date, o.status, o.total, u.name as customer_name, u.email as customer_email,
             GROUP_CONCAT(CONCAT(p.title, ' (', oi.quantity, ')') SEPARATOR ', ') as products
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.order_date DESC
    `)

    res.json({ orders })
  } catch (error) {
    console.error("Get admin orders error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update order status (Admin only)
router.put("/orders/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const con = getConnection()

    // Check if order exists
    const [orders] = await con.execute("SELECT id FROM orders WHERE id = ?", [id])

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" })
    }

    await con.execute("UPDATE orders SET status = ? WHERE id = ?", [status, id])

    res.json({ message: "Order status updated successfully" })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all users (Admin only)
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const con = getConnection()
    const [users] = await con.execute(
      "SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC",
    )

    res.json({ users })
  } catch (error) {
    console.error("Get admin users error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user status (Admin only)
router.put("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const con = getConnection()

    // Check if user exists and is not admin
    const [users] = await con.execute("SELECT id, role FROM users WHERE id = ?", [id])

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    if (users[0].role === "admin") {
      return res.status(400).json({ message: "Cannot modify admin user status" })
    }

    await con.execute("UPDATE users SET status = ? WHERE id = ?", [status, id])

    res.json({ message: "User status updated successfully" })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Dashboard stats (Admin only)
router.get("/dashboard", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const con = getConnection()

    // Get total counts
    const [userCount] = await con.execute("SELECT COUNT(*) as count FROM users WHERE role = 'user'")
    const [productCount] = await con.execute("SELECT COUNT(*) as count FROM products")
    const [orderCount] = await con.execute("SELECT COUNT(*) as count FROM orders")
    const [revenueResult] = await con.execute("SELECT SUM(total) as revenue FROM orders WHERE status != 'cancelled'")

    // Get recent orders
    const [recentOrders] = await con.execute(`
      SELECT o.id, o.order_date, o.status, o.total, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
      LIMIT 5
    `)

    res.json({
      stats: {
        totalUsers: userCount[0].count,
        totalProducts: productCount[0].count,
        totalOrders: orderCount[0].count,
        totalRevenue: revenueResult[0].revenue || 0,
      },
      recentOrders,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
