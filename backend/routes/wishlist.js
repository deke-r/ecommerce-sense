const express = require("express")
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

// Get user's wishlist
router.get("/", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const [wishlistItems] = await con.execute(`
      SELECT 
        w.id,
        w.created_at as added_at,
        p.id as product_id,
        p.title,
        p.description,
        p.price,
        p.image,
        p.stocks,
        c.name as category_name,
        AVG(r.star) as average_rating,
        COUNT(r.id) as reviews_count
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE w.user_id = ?
      GROUP BY w.id, p.id, p.title, p.description, p.price, p.image, p.stocks, c.name, w.created_at
      ORDER BY w.created_at DESC
    `, [req.user.id])

    res.json({ wishlist: wishlistItems })
  } catch (error) {
    console.error("Get wishlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add product to wishlist
router.post("/", verifyToken, async (req, res) => {
  try {
    const { product_id } = req.body
    const con = getConnection()

    // Check if product exists
    const [products] = await con.execute("SELECT id FROM products WHERE id = ?", [product_id])
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Check if already in wishlist
    const [existing] = await con.execute(
      "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [req.user.id, product_id]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: "Product already in wishlist" })
    }

    // Add to wishlist
    await con.execute(
      "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [req.user.id, product_id]
    )

    res.json({ message: "Product added to wishlist" })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Remove product from wishlist
router.delete("/:productId", verifyToken, async (req, res) => {
  try {
    const { productId } = req.params
    const con = getConnection()

    const [result] = await con.execute(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [req.user.id, productId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found in wishlist" })
    }

    res.json({ message: "Product removed from wishlist" })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Check if product is in wishlist
router.get("/check/:productId", verifyToken, async (req, res) => {
  try {
    const { productId } = req.params
    const con = getConnection()

    const [result] = await con.execute(
      "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [req.user.id, productId]
    )

    res.json({ inWishlist: result.length > 0 })
  } catch (error) {
    console.error("Check wishlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router