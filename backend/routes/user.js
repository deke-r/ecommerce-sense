const express = require("express")
const bcrypt = require("bcryptjs")
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const [users] = await con.execute("SELECT id, name, email, phone, role, status FROM users WHERE id = ?", [
      req.user.id,
    ])

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user: users[0] })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body

    const con = getConnection()

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set new password" })
      }

      const [users] = await con.execute("SELECT password FROM users WHERE id = ?", [req.user.id])
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password)

      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await con.execute("UPDATE users SET name = ?, phone = ?, password = ? WHERE id = ?", [
        name,
        phone,
        hashedPassword,
        req.user.id,
      ])
    } else {
      await con.execute("UPDATE users SET name = ?, phone = ? WHERE id = ?", [name, phone, req.user.id])
    }

    res.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})
router.get("/categories", async (req, res) => {
  try {
    const con = getConnection()
    const isActive = 1
    const [categories] = await con.execute(
      "SELECT id, name, description, image_url FROM categories WHERE is_active=? ORDER BY created_at DESC ",
      [isActive]
    )

    res.json({ categories: categories })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Server error" })
  }
})


router.get("/productsbycategory/:categoryId", async (req, res) => {
  try {
  
    const con = getConnection()
    const categoryId = req.params.categoryId
console.log(categoryId)
    const [products] = await con.execute(
      `SELECT p.id, p.category_id, p.title, p.description, p.stocks, p.price, p.image, 
              p.created_at, p.updated_at,
              pi.image_url AS extra_image
       FROM products p
       LEFT JOIN product_images pi ON p.id = pi.product_id
       WHERE p.category_id = ?
       ORDER BY p.created_at DESC`,
      [categoryId]
    )

console.log(products)

    res.json({ products: products })
  } catch (error) {
    console.error("Get products by category error:", error)
    res.status(500).json({ message: "Server error" })
  }
})


router.get("/products", async (req, res) => {
  try {
    const con = getConnection()

    const query = `
      SELECT p.id, p.category_id, p.title, p.description, p.stocks, p.price, p.image,
             p.created_at, p.updated_at, p.rating,
             pi.image_url AS extra_image,
             c.name as category_name
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `

    const [products] = await con.execute(query)

    console.log(`Fetched ${products.length} products`)

    res.json({
      products: products,
      totalProducts: products.length,
    })
  } catch (error) {
    console.error("Get all products error:", error)
    res.status(500).json({ message: "Server error" })
  }
})



module.exports = router
