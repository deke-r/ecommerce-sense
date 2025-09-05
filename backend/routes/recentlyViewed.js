const express = require("express")
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

// Add product to recently viewed
router.post("/", verifyToken, async (req, res) => {
  try {
    const { product_id } = req.body
    const con = getConnection()

    // Check if product exists
    const [products] = await con.execute("SELECT id FROM products WHERE id = ?", [product_id])
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Check if already exists
    const [existing] = await con.execute(
      "SELECT id FROM recently_viewed WHERE user_id = ? AND product_id = ?",
      [req.user.id, product_id]
    )

    if (existing.length > 0) {
      // Update timestamp
      await con.execute(
        "UPDATE recently_viewed SET viewed_at = NOW() WHERE user_id = ? AND product_id = ?",
        [req.user.id, product_id]
      )
    } else {
      // Add new entry
      await con.execute(
        "INSERT INTO recently_viewed (user_id, product_id) VALUES (?, ?)",
        [req.user.id, product_id]
      )
    }

    res.json({ message: "Product added to recently viewed" })
  } catch (error) {
    console.error("Add to recently viewed error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get recently viewed products
router.get("/", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const [recentlyViewed] = await con.execute(`
      SELECT 
        rv.id,
        rv.viewed_at,
        p.id as product_id,
        p.title,
        p.description,
        p.price,
        p.image,
        p.stocks,
        c.name as category_name,
        AVG(r.star) as average_rating,
        COUNT(r.id) as reviews_count
      FROM recently_viewed rv
      JOIN products p ON rv.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE rv.user_id = ?
      GROUP BY rv.id, p.id, p.title, p.description, p.price, p.image, p.stocks, c.name, rv.viewed_at
      ORDER BY rv.viewed_at DESC
      LIMIT 10
    `, [req.user.id])

    res.json({ recentlyViewed })
  } catch (error) {
    console.error("Get recently viewed error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router