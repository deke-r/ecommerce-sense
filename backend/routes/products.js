const express = require("express")
const multer = require("multer")
const path = require("path")
const { getConnection } = require("../config/database")
const { verifyToken, verifyAdmin } = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// Get all products
router.get("/", async (req, res) => {
  try {
    const con = getConnection()
    const [products] = await con.execute("SELECT * FROM products ORDER BY created_at DESC")

    res.json({ products })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    const [products] = await con.execute("SELECT * FROM products WHERE id = ?", [id])

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ product: products[0] })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add product (Admin only)
router.post("/", verifyToken, verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, price } = req.body

    if (!title || !price) {
      return res.status(400).json({ message: "Title and price are required" })
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null

    const con = getConnection()
    const [result] = await con.execute("INSERT INTO products (title, description, price, image) VALUES (?, ?, ?, ?)", [
      title,
      description,
      price,
      image,
    ])

    res.status(201).json({
      message: "Product added successfully",
      product: {
        id: result.insertId,
        title,
        description,
        price,
        image,
      },
    })
  } catch (error) {
    console.error("Add product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update product (Admin only)
router.put("/:id", verifyToken, verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, price } = req.body

    const con = getConnection()

    // Check if product exists
    const [existingProducts] = await con.execute("SELECT * FROM products WHERE id = ?", [id])

    if (existingProducts.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    const image = req.file ? `/uploads/${req.file.filename}` : existingProducts[0].image

    await con.execute("UPDATE products SET title = ?, description = ?, price = ?, image = ? WHERE id = ?", [
      title,
      description,
      price,
      image,
      id,
    ])

    res.json({ message: "Product updated successfully" })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete product (Admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    // Check if product exists
    const [existingProducts] = await con.execute("SELECT id FROM products WHERE id = ?", [id])

    if (existingProducts.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    await con.execute("DELETE FROM products WHERE id = ?", [id])

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
