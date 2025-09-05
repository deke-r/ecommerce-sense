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
    const con = getConnection();
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

    const product = products[0]
    product.additional_images = additionalImages

    res.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add product with main image and additional images
// router.post("/", verifyToken, verifyAdmin, upload.fields([
//   { name: 'main_image', maxCount: 1 },
//   { name: 'additional_images', maxCount: 10 }
// ]), async (req, res) => {
//   try {
//     const { title, description, price, category_id } = req.body
//     const mainImage = req.files?.main_image?.[0]
//     const additionalImages = req.files?.additional_images || []

//     if (!title || !price) {
//       return res.status(400).json({ message: "Title and price are required" })
//     }

//     const mainImageUrl = mainImage ? `/uploads/${mainImage.filename}` : null

//     const con = getConnection()

//     // Insert product
//     const [result] = await con.execute(
//       "INSERT INTO products (title, description, price, category_id, image) VALUES (?, ?, ?, ?, ?)",
//       [title, description, price, category_id || null, mainImageUrl]
//     )

//     const productId = result.insertId

//     // Insert additional images if provided
//     if (additionalImages.length > 0) {
//       const imageValues = additionalImages.map(file => [productId, `/uploads/${file.filename}`])
//       await con.execute(
//         "INSERT INTO product_images (product_id, image_url) VALUES ?",
//         [imageValues]
//       )
//     }

//     // Get the created product with images
//     const [products] = await con.execute("SELECT * FROM products WHERE id = ?", [productId])
//     const [additionalImagesResult] = await con.execute(
//       "SELECT * FROM product_images WHERE product_id = ? ORDER BY id ASC",
//       [productId]
//     )

//     const product = products[0]
//     product.additional_images = additionalImagesResult

//     res.status(201).json({
//       message: "Product added successfully",
//       product
//     })
//   } catch (error) {
//     console.error("Add product error:", error)
//     res.status(500).json({ message: "Server error" })
//   }
// })

// Update product with main image and additional images
// router.put("/:id", verifyToken, verifyAdmin, upload.fields([
//   { name: 'main_image', maxCount: 1 },
//   { name: 'additional_images', maxCount: 10 }
// ]), async (req, res) => {
//   try {
//     const { id } = req.params
//     const { title, description, price, category_id } = req.body
//     const mainImage = req.files?.main_image?.[0]
//     const additionalImages = req.files?.additional_images || []

//     const con = getConnection()

//     // Check if product exists
//     const [existingProducts] = await con.execute("SELECT * FROM products WHERE id = ?", [id])
//     if (existingProducts.length === 0) {
//       return res.status(404).json({ message: "Product not found" })
//     }

//     const mainImageUrl = mainImage ? `/uploads/${mainImage.filename}` : existingProducts[0].image

//     // Update product
//     await con.execute(
//       "UPDATE products SET title = ?, description = ?, price = ?, category_id = ?, image = ? WHERE id = ?",
//       [title, description, price, category_id || null, mainImageUrl, id]
//     )

//     // Handle additional images
//     if (additionalImages.length > 0) {
//       // Delete existing additional images
//       await con.execute("DELETE FROM product_images WHERE product_id = ?", [id])
      
//       // Insert new additional images
//       const imageValues = additionalImages.map(file => [id, `/uploads/${file.filename}`])
//       await con.execute(
//         "INSERT INTO product_images (product_id, image_url) VALUES ?",
//         [imageValues]
//       )
//     }

//     res.json({ message: "Product updated successfully" })
//   } catch (error) {
//     console.error("Update product error:", error)
//     res.status(500).json({ message: "Server error" })
//   }
// })

router.post(
  "/",
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "additional_images", maxCount: 10 },
  ]),
  async (req, res) => {
    const { title, description, category_id, price, stocks } = req.body
    const mainImage = req.files["main_image"] ? req.files["main_image"][0] : null
    const additional_images = req.files["additional_images"] || []
    const con = getConnection()

    try {
      // ✅ Insert product details with correct column names
      const [result] = await con.execute(
        "INSERT INTO products (title, description, category_id, price, stocks, image) VALUES (?, ?, ?, ?, ?, ?)",
        [
          title || null,
          description || null,
          category_id || null,
          price || null,
          stocks || 0,
          mainImage ? `${mainImage.filename}` : null,
        ]
      )

      const productId = result.insertId

      // ✅ Insert additional images if provided
      if (additional_images.length > 0) {
        const imageValues = additional_images.map((file) => [
          productId,
          `${file.filename}`,
        ])

        await con.query(
          "INSERT INTO product_images (product_id, image_url) VALUES ?",
          [imageValues]
        )
      }

      res.status(201).json({ message: "Product added successfully!" })
    } catch (err) {
      console.error("Add product error:", err)
      res.status(500).json({ error: "Failed to add product" })
    }
  }
)



// -------------------- UPDATE PRODUCT --------------------
router.put(
  "/:id",
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "additional_images", maxCount: 10 }, // ✅ match exactly
  ]),
  async (req, res) => {
    const { id } = req.params
    const { title, description, category_id, price } = req.body
    const mainImage = req.files["main_image"] ? req.files["main_image"][0] : null
    const additional_images = req.files["additional_images"] || []

    try {
      const con = getConnection()

      // Check product exists
      const [existing] = await con.execute(
        "SELECT image FROM products WHERE id = ?",
        [id]
      )

      if (existing.length === 0) {
        return res.status(404).json({ error: "Product not found" })
      }

      // Update product (if no new image, keep old one)
      await con.execute(
        "UPDATE products SET title=?, description=?, category_id=?, price=?, image=? WHERE id=?",
        [
          title,
          description,
          category_id || null,
          price,
          mainImage ? `${mainImage.filename}` : existing[0].image,
          id,
        ]
      )

      // Handle additional images
      if (additional_images.length > 0) {
        // Delete old additional images
        await con.execute("DELETE FROM product_images WHERE product_id = ?", [
          id,
        ])

        // Insert new ones
        const imageValues = additional_images.map((file) => [
          id,
          `${file.filename}`,
        ])

        await con.query(
          "INSERT INTO product_images (product_id, image_url) VALUES ?",
          [imageValues]
        )
      }

      res.json({ message: "Product updated successfully!" })
    } catch (err) {
      console.error("Update product error:", err)
      res.status(500).json({ error: "Failed to update product" })
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

module.exports = router


    