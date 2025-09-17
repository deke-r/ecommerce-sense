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

// Get all products with images (works with current DB structure)
router.get("/", async (req, res) => {
  try {
    const con = getConnection();
    
    // Simple query that works with existing database structure
    const [products] = await con.execute(`
      SELECT 
        p.*, 
        GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.id ASC) AS additional_image_urls,
        GROUP_CONCAT(DISTINCT pi.id ORDER BY pi.id ASC) AS additional_image_ids,
        GROUP_CONCAT(DISTINCT pr.id) AS review_ids,
        GROUP_CONCAT(DISTINCT pr.user_id) AS review_user_ids,
        GROUP_CONCAT(DISTINCT pr.star) AS review_stars, 
        GROUP_CONCAT(DISTINCT pr.comment) AS review_comments,
        GROUP_CONCAT(DISTINCT pr.created_at) AS review_dates
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN reviews pr ON p.id = pr.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC;
    `);

    const processedProducts = products.map((product) => {
      const productData = { ...product };

      // Add default brand info (will be updated after migration)
      productData.brand = {
        name: 'Generic',
        image: null,
        is_active: 1
      };

      // ✅ Additional images
      if (product.additional_image_urls) {
        const imageUrls = product.additional_image_urls.split(",");
        const imageIds = product.additional_image_ids
          ? product.additional_image_ids.split(",").map((id) => parseInt(id))
          : [];

        productData.additional_images = imageUrls.map((url, index) => ({
          id: imageIds[index] || null,
          image_url: url,
        }));
      } else {
        productData.additional_images = [];
      }

      // ✅ Reviews
      if (product.review_ids) {
        const ids = product.review_ids ? product.review_ids.split(",") : [];
        const userIds = product.review_user_ids
          ? product.review_user_ids.split(",")
          : [];
        const stars = product.review_stars ? product.review_stars.split(",") : [];
        const comments = product.review_comments
          ? product.review_comments.split(",")
          : [];
        const dates = product.review_dates
          ? product.review_dates.split(",")
          : [];

        productData.reviews = ids.map((id, index) => ({
          id: parseInt(id),
          user_id: parseInt(userIds[index]) || null,
          rating: parseInt(stars[index]) || 0,
          comment: comments[index] || "",
          created_at: dates[index] || null,
        }));

        // ✅ Add average rating & total reviews
        if (stars.length > 0) {
          const total = stars.reduce((sum, s) => sum + parseInt(s || 0), 0);
          productData.average_rating = total / stars.length;
          productData.total_reviews = stars.length;
        } else {
          productData.average_rating = 0;
          productData.total_reviews = 0;
        }
      } else {
        productData.reviews = [];
        productData.average_rating = 0;
        productData.total_reviews = 0;
      }

      // Add default sizes (will be updated after migration)
      productData.sizes = [];
      productData.has_sizes = false;
      productData.size_category = 'none';

      // cleanup
      delete productData.additional_image_urls;
      delete productData.additional_image_ids;
      delete productData.review_ids;
      delete productData.review_user_ids;
      delete productData.review_stars;
      delete productData.review_comments;
      delete productData.review_dates;

      return productData;
    });

    res.json({ products: processedProducts });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get product by ID with images
// Get product by ID with images
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    // Fetch product with category id & name
    const [products] = await con.execute(
      `SELECT p.*, c.id AS category_id, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    )

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Fetch additional images
    const [additionalImages] = await con.execute(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY id ASC",
      [id]
    )

    // Fetch sizes
    const [sizes] = await con.execute(
      `SELECT id, size_name, size_value, additional_price, stock_quantity, is_available
       FROM product_sizes
       WHERE product_id = ?
       ORDER BY id ASC`,
      [id]
    )

    const product = products[0]
    product.additional_images = additionalImages
    product.sizes = sizes

    res.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add product with main image and additional images
router.post(
  "/",
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "additional_images", maxCount: 10 },
  ]),
  async (req, res) => {
    const { 
      title, 
      description, 
      category_id, 
      price, 
      stocks,
      brand_id,
      has_sizes,
      size_category,
      sizes // comma-separated string like "S,M,L" or "6,7,8"
    } = req.body
    
    const mainImage = req.files["main_image"] ? req.files["main_image"][0] : null
    const additional_images = req.files["additional_images"] || []
    const pool = getConnection()

    let conn
    try {
      conn = await pool.getConnection()
      await conn.beginTransaction()

      // Resolve brand_name from brand_id (nullable-safe)
      let brandName = null
      if (brand_id) {
        const [brandRows] = await conn.execute(
          "SELECT brand_name FROM brands WHERE id = ?",
          [brand_id]
        )
        if (brandRows.length > 0) brandName = brandRows[0].brand_name
      }

      // Insert product with brand and size flags
      const [result] = await conn.execute(
        `INSERT INTO products 
         (title, description, category_id, brand_id, brand_name, price, stocks, has_sizes, size_category, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title || null,
          description || null,
          category_id || null,
          brand_id || null,
          brandName || null,
          price || null,
          stocks || 0,
          has_sizes ? 1 : 0,
          size_category || 'none',
          mainImage ? `${mainImage.filename}` : null
        ]
      )

      const productId = result.insertId

      // Additional images
      if (additional_images.length > 0) {
        const imageValues = additional_images.map((file) => [
          productId,
          `${file.filename}`,
        ])
        await conn.query(
          "INSERT INTO product_images (product_id, image_url) VALUES ?",
          [imageValues]
        )
      }

      // Sizes
      const sizesWithStockRaw = (req.body.sizes_with_stock || "").trim()
      const simpleSizesRaw = (req.body.sizes || "").trim()

      if ((has_sizes ? 1 : 0) === 1) {
        let toInsert = []

        if (sizesWithStockRaw.length > 0) {
          // Expect format: "S:10,M:5,L:0"
          toInsert = sizesWithStockRaw
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
            .map(pair => {
              const [name, qtyRaw] = pair.split(":").map(x => (x || "").trim())
              const qty = Math.max(0, parseInt(qtyRaw || "0", 10) || 0)
              const val = name
              return [productId, name, val, 0.00, qty, 1]
            })
        } else if (simpleSizesRaw.length > 0) {
          toInsert = simpleSizesRaw
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
            .map(v => [productId, v, v, 0.00, 0, 1])
        }

        if (toInsert.length > 0) {
          await conn.query(
            "INSERT INTO product_sizes (product_id, size_name, size_value, additional_price, stock_quantity, is_available) VALUES ?",
            [toInsert]
          )
        }
      }

      await conn.commit()
      res.status(201).json({ message: "Product added successfully!" })
    } catch (err) {
      if (conn) await conn.rollback()
      console.error("Add product error:", err)
      res.status(500).json({ error: "Failed to add product" })
    } finally {
      if (conn) conn.release()
    }
  }
)

// Update product with main image and additional images
// Update product with main image and additional images
router.put(
  "/:id",
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "additional_images", maxCount: 10 },
  ]),
  async (req, res) => {
    const { id } = req.params
    const { 
      title, 
      description, 
      category_id, 
      price,
      stocks,
      brand_id,
      has_sizes,
      size_category,
      sizes // comma-separated
    } = req.body
    const mainImage = req.files["main_image"] ? req.files["main_image"][0] : null
    const additional_images = req.files["additional_images"] || []

    const pool = getConnection()
    let conn
    try {
      conn = await pool.getConnection()
      await conn.beginTransaction()

      // Check product exists and get current image
      const [existing] = await conn.execute(
        "SELECT image FROM products WHERE id = ?",
        [id]
      )
      if (existing.length === 0) {
        await conn.rollback()
        return res.status(404).json({ error: "Product not found" })
      }

      // Resolve brand_name
      let brandName = null
      if (brand_id) {
        const [brandRows] = await conn.execute(
          "SELECT brand_name FROM brands WHERE id = ?",
          [brand_id]
        )
        if (brandRows.length > 0) brandName = brandRows[0].brand_name
      }

      // Update product (preserve old image if not replaced)
      await conn.execute(
        `UPDATE products 
         SET title=?, description=?, category_id=?, brand_id=?, brand_name=?, price=?, stocks=?, has_sizes=?, size_category=?, image=? 
         WHERE id=?`,
        [
          title,
          description,
          category_id || null,
          brand_id || null,
          brandName || null,
          price,
          stocks || 0,
          has_sizes ? 1 : 0,
          size_category || 'none',
          mainImage ? `${mainImage.filename}` : existing[0].image,
          id,
        ]
      )

      // Additional images (replace if new provided)
      if (additional_images.length > 0) {
        await conn.execute("DELETE FROM product_images WHERE product_id = ?", [id])
        const imageValues = additional_images.map((file) => [
          id,
          `${file.filename}`,
        ])
        await conn.query(
          "INSERT INTO product_images (product_id, image_url) VALUES ?",
          [imageValues]
        )
      }

      // Sizes: replace with new set or clear if has_sizes false
      await conn.execute("DELETE FROM product_sizes WHERE product_id = ?", [id])

      const sizesWithStockRaw = (req.body.sizes_with_stock || "").trim()
      const simpleSizesRaw = (req.body.sizes || "").trim()

      if ((has_sizes ? 1 : 0) === 1) {
        let toInsert = []

        if (sizesWithStockRaw.length > 0) {
          toInsert = sizesWithStockRaw
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
            .map(pair => {
              const [name, qtyRaw] = pair.split(":").map(x => (x || "").trim())
              const qty = Math.max(0, parseInt(qtyRaw || "0", 10) || 0)
              const val = name
              return [id, name, val, 0.00, qty, 1]
            })
        } else if (simpleSizesRaw.length > 0) {
          toInsert = simpleSizesRaw
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
            .map(v => [id, v, v, 0.00, 0, 1])
        }

        if (toInsert.length > 0) {
          await conn.query(
            "INSERT INTO product_sizes (product_id, size_name, size_value, additional_price, stock_quantity, is_available) VALUES ?",
            [toInsert]
          )
        }
      }

      await conn.commit()
      res.json({ message: "Product updated successfully!" })
    } catch (err) {
      if (conn) await conn.rollback()
      console.error("Update product error:", err)
      res.status(500).json({ error: "Failed to update product" })
    } finally {
      if (conn) conn.release()
    }
  }
)

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

// Get products by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params
    const con = getConnection()
    
    const [products] = await con.execute(`
      SELECT 
        p.*, 
        GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.id ASC) AS additional_image_urls,
        GROUP_CONCAT(DISTINCT pi.id ORDER BY pi.id ASC) AS additional_image_ids,
        GROUP_CONCAT(DISTINCT pr.id) AS review_ids,
        GROUP_CONCAT(DISTINCT pr.user_id) AS review_user_ids,
        GROUP_CONCAT(DISTINCT pr.star) AS review_stars, 
        GROUP_CONCAT(DISTINCT pr.comment) AS review_comments,
        GROUP_CONCAT(DISTINCT pr.created_at) AS review_dates
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN reviews pr ON p.id = pr.product_id
      WHERE p.category_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `, [categoryId])

    const processedProducts = products.map((product) => {
      const productData = { ...product }

      // Additional images
      if (product.additional_image_urls) {
        const imageUrls = product.additional_image_urls.split(",")
        const imageIds = product.additional_image_ids
          ? product.additional_image_ids.split(",").map((id) => parseInt(id))
          : []

        productData.additional_images = imageUrls.map((url, index) => ({
          id: imageIds[index] || null,
          image_url: url,
        }))
      } else {
        productData.additional_images = []
      }

      // Reviews
      if (product.review_ids) {
        const ids = product.review_ids ? product.review_ids.split(",") : []
        const userIds = product.review_user_ids
          ? product.review_user_ids.split(",")
          : []
        const stars = product.review_stars ? product.review_stars.split(",") : []
        const comments = product.review_comments
          ? product.review_comments.split(",")
          : []
        const dates = product.review_dates
          ? product.review_dates.split(",")
          : []

        productData.reviews = ids.map((id, index) => ({
          id: parseInt(id),
          user_id: parseInt(userIds[index]) || null,
          rating: parseInt(stars[index]) || 0,
          comment: comments[index] || "",
          created_at: dates[index] || null,
        }))

        // Add average rating & total reviews
        if (stars.length > 0) {
          const total = stars.reduce((sum, s) => sum + parseInt(s || 0), 0)
          productData.average_rating = total / stars.length
          productData.total_reviews = stars.length
        } else {
          productData.average_rating = 0
          productData.total_reviews = 0
        }
      } else {
        productData.reviews = []
        productData.average_rating = 0
        productData.total_reviews = 0
      }

      // Add default brand and sizes
      productData.brand = {
        name: 'Generic',
        image: null,
        is_active: 1
      }
      productData.sizes = []
      productData.has_sizes = false
      productData.size_category = 'none'

      // cleanup
      delete productData.additional_image_urls
      delete productData.additional_image_ids
      delete productData.review_ids
      delete productData.review_user_ids
      delete productData.review_stars
      delete productData.review_comments
      delete productData.review_dates

      return productData
    })

    res.json({ products: processedProducts })
  } catch (error) {
    console.error("Get products by category error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Search products endpoint
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ products: [] });
    }

    const con = getConnection();
    const searchTerm = `%${q.trim()}%`;
    
    const [products] = await con.execute(`
      SELECT 
        p.id,
        p.title,
        p.price,
        p.image,
        p.stocks,
        c.name as category_name,
        IFNULL(AVG(r.star), 0) AS average_rating,
        COUNT(r.id) AS reviews_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.title LIKE ? OR p.description LIKE ? OR c.name LIKE ?
      GROUP BY p.id, p.title, p.price, p.image, p.stocks, c.name
      ORDER BY 
        CASE 
          WHEN p.title LIKE ? THEN 1
          WHEN p.description LIKE ? THEN 2
          WHEN c.name LIKE ? THEN 3
          ELSE 4
        END,
        p.title ASC
      LIMIT 10
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);

    res.json({ products });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router