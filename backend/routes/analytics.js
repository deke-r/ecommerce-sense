const express = require("express")
const { getConnection } = require("../config/database")
const { verifyToken, verifyAdmin } = require("../middleware/auth")

const router = express.Router()

// Track product view
router.post("/track-view", async (req, res) => {
  try {
    const { product_id, user_id } = req.body
    const con = getConnection()

    await con.execute(
      "INSERT INTO product_views (product_id, user_id, viewed_at) VALUES (?, ?, NOW())",
      [product_id, user_id || null]
    )

    res.json({ message: "View tracked" })
  } catch (error) {
    console.error("Track view error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get product analytics (Admin only)
router.get("/products", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const con = getConnection()
    const [analytics] = await con.execute(`
      SELECT 
        p.id,
        p.title,
        p.price,
        COUNT(DISTINCT pv.id) as view_count,
        COUNT(DISTINCT c.id) as cart_count,
        COUNT(DISTINCT w.id) as wishlist_count,
        COUNT(DISTINCT oi.id) as order_count,
        AVG(r.star) as average_rating,
        COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN product_views pv ON p.id = pv.product_id
      LEFT JOIN cart c ON p.id = c.product_id
      LEFT JOIN wishlist w ON p.id = w.product_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN reviews r ON p.id = r.product_id
      GROUP BY p.id, p.title, p.price
      ORDER BY view_count DESC
    `)

    res.json({ analytics })
  } catch (error) {
    console.error("Get analytics error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
