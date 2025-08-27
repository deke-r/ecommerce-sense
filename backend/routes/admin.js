const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { getConnection } = require("../config/database")
const { verifyToken, verifyAdmin } = require("../middleware/auth")

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null,uniqueSuffix + '-'+ file.originalname)
  },
})

const upload = multer({ storage: storage })

// Get all orders (Admin only)
router.get("/orders", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const con = getConnection()

    const [orders] = await con.execute(`
      SELECT o.id, o.order_date, o.status, o.total, u.name AS customer_name, u.email AS customer_email,
             GROUP_CONCAT(CONCAT(p.title, ' (', oi.quantity, ')') SEPARATOR ', ') AS products
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
      SELECT o.id, o.order_date, o.status, o.total, u.name AS customer_name
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

// Categories CRUD operations (Admin only)

// Get all categories
router.get("/categories", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const con = getConnection()
    const [categories] = await con.execute(
      "SELECT id, name, description, image_url, is_active, created_at, updated_at FROM categories ORDER BY created_at DESC",
    )

    // Add full image URLs
    const categoriesWithImages = categories.map((category) => ({
      ...category,
      image: category.image ? `${req.protocol}://${req.get("host")}/uploads/categories/${category.image}` : null,
    }))

    res.json({ categories: categoriesWithImages })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new category
router.post("/categories", verifyToken, verifyAdmin, upload.single("image"), async (req, res) => {
  try {
 
    const { name, description, is_active } = req.body

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" })
    }

    const con = getConnection()

    // Check if category with same name already exists
    const [existingCategories] = await con.execute("SELECT id FROM categories WHERE name = ?", [name.trim()])

    if (existingCategories.length > 0) {
      return res.status(400).json({ message: "Category with this name already exists" })
    }

    const imageName = req.file ? req.file.filename : null

    const [result] = await con.execute(
      "INSERT INTO categories (name, description,  image_url, is_active) VALUES (?, ?, ?, ?)",
      [name.trim(), description || null, imageName, is_active !== undefined ? is_active : 1],
    )

    const imageUrl = imageName ? `${req.protocol}://${req.get("host")}/uploads/categories/${imageName}` : null

    res.status(201).json({
      message: "Category created successfully",
      category: {
        id: result.insertId,
        name: name.trim(),
        description: description || null,
        image: imageUrl,
        is_active: is_active !== undefined ? is_active : 1,
      },
    })
  } catch (error) {
    console.error("Create category error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update category
router.put("/categories/:id", verifyToken, verifyAdmin, upload.single("image"), async (req, res) => {
  try {

   
    const { id } = req.params
    const { name, description, is_active } = req.body

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" })
    }

    const con = getConnection()

    // Check if category exists and get current image
    const [categories] = await con.execute("SELECT id,  image_url FROM categories WHERE id = ?", [id])

    if (categories.length === 0) {
      return res.status(404).json({ message: "Category not found" })
    }

    // Check if another category with same name already exists
    const [existingCategories] = await con.execute("SELECT id FROM categories WHERE name = ? AND id != ?", [
      name.trim(),
      id,
    ])

    if (existingCategories.length > 0) {
      return res.status(400).json({ message: "Category with this name already exists" })
    }

    let imageName = categories[0].image_url 

    // If new image is uploaded
    if (req.file) {
      // Delete old image if exists
      if (imageName) {
        const oldImagePath = path.join("uploads", imageName)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      imageName = req.file.filename
    }

    await con.execute("UPDATE categories SET name = ?, description = ?,  image_url = ?, is_active = ? WHERE id = ?", [
      name.trim(),
      description || null,
      imageName,
      is_active !== undefined ? is_active : 1,
      id,
    ])

    res.json({ message: "Category updated successfully" })
  } catch (error) {
    console.error("Update category error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete category
router.delete("/categories/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    // Check if category exists and get image
    const [categories] = await con.execute("SELECT id,  image_url FROM categories WHERE id = ?", [id])

    if (categories.length === 0) {
      return res.status(404).json({ message: "Category not found" })
    }

    // Check if category is being used by any products
    const [products] = await con.execute("SELECT id FROM products WHERE category_id = ?", [id])

    if (products.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category. It is being used by products.",
      })
    }

    // Delete image file if exists
    if (categories[0].image) {
      const imagePath = path.join("uploads/categories", categories[0].image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await con.execute("DELETE FROM categories WHERE id = ?", [id])

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
