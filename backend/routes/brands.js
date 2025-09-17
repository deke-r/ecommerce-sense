const express = require("express")
const multer = require("multer")
const path = require("path")
const { getConnection } = require("../config/database")
const { verifyToken, verifyAdmin } = require("../middleware/auth")

const router = express.Router()

// Configure multer for brand image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// Get all brands (public route for frontend display)
router.get("/", async (req, res) => {
  try {
    const con = getConnection()
    const [brands] = await con.execute(
      "SELECT * FROM brands ORDER BY brand_name ASC"
    )
    res.json({ brands })
  } catch (error) {
    console.error("Get brands error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get active brands only (for frontend dropdowns)
router.get("/active", async (req, res) => {
  try {
    const con = getConnection()
    const [brands] = await con.execute(
      "SELECT * FROM brands WHERE is_active = 1 ORDER BY brand_name ASC"
    )
    res.json({ brands })
  } catch (error) {
    console.error("Get active brands error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get brand by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()
    
    const [brands] = await con.execute(
      "SELECT * FROM brands WHERE id = ?", [id]
    )
    
    if (brands.length === 0) {
      return res.status(404).json({ message: "Brand not found" })
    }
    
    res.json({ brand: brands[0] })
  } catch (error) {
    console.error("Get brand error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new brand (Admin only)
router.post("/", verifyToken, verifyAdmin, upload.single('brand_image'), async (req, res) => {
  try {
    const { brand_name } = req.body
    const brandImage = req.file ? req.file.filename : null
    
    if (!brand_name) {
      return res.status(400).json({ message: "Brand name is required" })
    }
    
    const con = getConnection()
    
    // Check if brand already exists
    const [existing] = await con.execute(
      "SELECT id FROM brands WHERE brand_name = ?", [brand_name]
    )
    
    if (existing.length > 0) {
      return res.status(400).json({ message: "Brand already exists" })
    }
    
    const [result] = await con.execute(
      "INSERT INTO brands (brand_name, brand_image, is_active) VALUES (?, ?, 1)",
      [brand_name, brandImage]
    )
    
    res.status(201).json({ 
      message: "Brand created successfully",
      brand: {
        id: result.insertId,
        brand_name,
        brand_image: brandImage,
        is_active: 1
      }
    })
  } catch (error) {
    console.error("Create brand error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update brand (Admin only)
router.put("/:id", verifyToken, verifyAdmin, upload.single('brand_image'), async (req, res) => {
  try {
    const { id } = req.params
    const { brand_name, is_active } = req.body
    const brandImage = req.file ? req.file.filename : null
    
    const con = getConnection()
    
    // Check if brand exists
    const [existing] = await con.execute(
      "SELECT * FROM brands WHERE id = ?", [id]
    )
    
    if (existing.length === 0) {
      return res.status(404).json({ message: "Brand not found" })
    }
    
    // Update brand
    let query = "UPDATE brands SET brand_name = ?, is_active = ?"
    let params = [brand_name, is_active]
    
    if (brandImage) {
      query += ", brand_image = ?"
      params.push(brandImage)
    }
    
    query += " WHERE id = ?"
    params.push(id)
    
    await con.execute(query, params)
    
    // Update products table with new brand name
    await con.execute(
      "UPDATE products SET brand_name = ? WHERE id = ?",
      [brand_name, id]
    )
    
    res.json({ message: "Brand updated successfully" })
  } catch (error) {
    console.error("Update brand error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete brand (Admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()
    
    // Check if brand exists
    const [existing] = await con.execute(
      "SELECT id FROM brands WHERE id = ?", [id]
    )
    
    if (existing.length === 0) {
      return res.status(404).json({ message: "Brand not found" })
    }
    
    // Check if brand is used by products
    const [products] = await con.execute(
      "SELECT COUNT(*) as count FROM products WHERE id = ?", [id]
    )
    
    if (products[0].count > 0) {
      return res.status(400).json({ 
        message: "Cannot delete brand. It is associated with products." 
      })
    }
    
    await con.execute("DELETE FROM brands WHERE id = ?", [id])
    
    res.json({ message: "Brand deleted successfully" })
  } catch (error) {
    console.error("Delete brand error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Toggle brand status (Admin only)
router.patch("/:id/toggle", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()
    
    await con.execute(
      "UPDATE brands SET is_active = NOT is_active WHERE id = ?", [id]
    )
    
    res.json({ message: "Brand status updated successfully" })
  } catch (error) {
    console.error("Toggle brand status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
