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

// Carousel Images CRUD operations (Admin only)

// Get all carousel images
router.get("/carousel", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const con = getConnection()
    const [images] = await con.execute(
      "SELECT id, image_url, title, description, link_url, is_active, sort_order, created_at, updated_at FROM carousel_images ORDER BY sort_order ASC, created_at DESC"
    )

    // Add full image URLs
    const imagesWithUrls = images.map((image) => ({
      ...image,
      image_url: image.image_url ? `${req.protocol}://${req.get("host")}/uploads/${image.image_url}` : null,
    }))

    res.json({ images: imagesWithUrls })
  } catch (error) {
    console.error("Get carousel images error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get active carousel images (for frontend)
router.get("/carousel/active", async (req, res) => {
  try {
    const con = getConnection()
    const [images] = await con.execute(
      "SELECT id, image_url, title, description, link_url FROM carousel_images WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC"
    )

    // Add full image URLs
    const imagesWithUrls = images.map((image) => ({
      ...image,
      image_url: image.image_url ? `${req.protocol}://${req.get("host")}/uploads/${image.image_url}` : null,
    }))

    res.json({ images: imagesWithUrls })
  } catch (error) {
    console.error("Get active carousel images error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new carousel image
router.post("/carousel", verifyToken, verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, link_url, is_active, sort_order } = req.body

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" })
    }

    const con = getConnection()
    const imageName = req.file.filename

    // Convert boolean to integer for MySQL
    const isActiveInt = is_active === 'true' || is_active === true ? 1 : 0

    const [result] = await con.execute(
      "INSERT INTO carousel_images (image_url, title, description, link_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [imageName, title || null, description || null, link_url || null, isActiveInt, sort_order || 0]
    )

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${imageName}`

    res.status(201).json({
      message: "Carousel image created successfully",
      image: {
        id: result.insertId,
        image_url: imageUrl,
        title: title || null,
        description: description || null,
        link_url: link_url || null,
        is_active: is_active !== undefined ? is_active : 1,
        sort_order: sort_order || 0,
      },
    })
  } catch (error) {
    console.error("Create carousel image error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update carousel image
router.put("/carousel/:id", verifyToken, verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, link_url, is_active, sort_order } = req.body

    const con = getConnection()

    // Check if image exists and get current image
    const [images] = await con.execute("SELECT id, image_url FROM carousel_images WHERE id = ?", [id])

    if (images.length === 0) {
      return res.status(404).json({ message: "Carousel image not found" })
    }

    let imageName = images[0].image_url

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

    await con.execute(
      "UPDATE carousel_images SET image_url = ?, title = ?, description = ?, link_url = ?, is_active = ?, sort_order = ? WHERE id = ?",
      [imageName, title || null, description || null, link_url || null, is_active !== undefined ? is_active : 1, sort_order || 0, id]
    )

    res.json({ message: "Carousel image updated successfully" })
  } catch (error) {
    console.error("Update carousel image error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete carousel image
router.delete("/carousel/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    // Check if image exists and get image
    const [images] = await con.execute("SELECT id, image_url FROM carousel_images WHERE id = ?", [id])

    if (images.length === 0) {
      return res.status(404).json({ message: "Carousel image not found" })
    }

    // Delete image file if exists
    if (images[0].image_url) {
      const imagePath = path.join("uploads", images[0].image_url)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await con.execute("DELETE FROM carousel_images WHERE id = ?", [id])

    res.json({ message: "Carousel image deleted successfully" })
  } catch (error) {
    console.error("Delete carousel image error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
