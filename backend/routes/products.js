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

// Get all products with images
router.get("/", async (req, res) => {
  try {
    const con = getConnection()
    const [products] = await con.execute(`
      SELECT p.*, 
             GROUP_CONCAT(pi.image_url ORDER BY pi.id ASC) as additional_image_urls,
             GROUP_CONCAT(pi.id ORDER BY pi.id ASC) as additional_image_ids
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `)

    // Process products to include additional images array
    const processedProducts = products.map(product => {
      const productData = { ...product }
      if (product.additional_image_urls) {
        const imageUrls = product.additional_image_urls.split(',')
        const imageIds = product.additional_image_ids.split(',').map(id => parseInt(id))
        productData.additional_images = imageUrls.map((url, index) => ({
          id: imageIds[index],
          image_url: url
        }))
      } else {
        productData.additional_images = []
      }
      delete productData.additional_image_urls
      delete productData.additional_image_ids
      return productData
    })

    res.json({ products: processedProducts })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get product by ID with images
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    const [products] = await con.execute("SELECT * FROM products WHERE id = ?", [id])
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    const [additionalImages] = await con.execute(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY id ASC",
      [id]
    )

    const product = products[0]
    product.additional_images = additionalImages

    res.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add product with main image and additional images
router.post("/", verifyToken, verifyAdmin, upload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'additional_images', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, description, price, category_id } = req.body
    const mainImage = req.files?.main_image?.[0]
    const additionalImages = req.files?.additional_images || []

    if (!title || !price) {
      return res.status(400).json({ message: "Title and price are required" })
    }

    const mainImageUrl = mainImage ? `/uploads/${mainImage.filename}` : null

    const con = getConnection()

    // Insert product
    const [result] = await con.execute(
      "INSERT INTO products (title, description, price, category_id, image) VALUES (?, ?, ?, ?, ?)",
      [title, description, price, category_id || null, mainImageUrl]
    )

    const productId = result.insertId

    // Insert additional images if provided
    if (additionalImages.length > 0) {
      const imageValues = additionalImages.map(file => [productId, `/uploads/${file.filename}`])
      await con.execute(
        "INSERT INTO product_images (product_id, image_url) VALUES ?",
        [imageValues]
      )
    }

    // Get the created product with images
    const [products] = await con.execute("SELECT * FROM products WHERE id = ?", [productId])
    const [additionalImagesResult] = await con.execute(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY id ASC",
      [productId]
    )

    const product = products[0]
    product.additional_images = additionalImagesResult

    res.status(201).json({
      message: "Product added successfully",
      product
    })
  } catch (error) {
    console.error("Add product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update product with main image and additional images
router.put("/:id", verifyToken, verifyAdmin, upload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'additional_images', maxCount: 10 }
]), async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, price, category_id } = req.body
    const mainImage = req.files?.main_image?.[0]
    const additionalImages = req.files?.additional_images || []

    const con = getConnection()

    // Check if product exists
    const [existingProducts] = await con.execute("SELECT * FROM products WHERE id = ?", [id])
    if (existingProducts.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    const mainImageUrl = mainImage ? `/uploads/${mainImage.filename}` : existingProducts[0].image

    // Update product
    await con.execute(
      "UPDATE products SET title = ?, description = ?, price = ?, category_id = ?, image = ? WHERE id = ?",
      [title, description, price, category_id || null, mainImageUrl, id]
    )

    // Handle additional images
    if (additionalImages.length > 0) {
      // Delete existing additional images
      await con.execute("DELETE FROM product_images WHERE product_id = ?", [id])
      
      // Insert new additional images
      const imageValues = additionalImages.map(file => [id, `/uploads/${file.filename}`])
      await con.execute(
        "INSERT INTO product_images (product_id, image_url) VALUES ?",
        [imageValues]
      )
    }

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

    // Delete product (product_images will be deleted automatically due to CASCADE)
    await con.execute("DELETE FROM products WHERE id = ?", [id])

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router


    