const express = require("express")
const bcrypt = require("bcryptjs")
const multer = require("multer")
const path = require("path")
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

// Configure multer for review image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

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
    const con = getConnection();
    const categoryId = req.params.categoryId;

    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.title,
        p.description,
        p.stocks,
        p.price,
        p.image,
        p.created_at,
        p.updated_at,
        GROUP_CONCAT(pi.image_url) AS extra_images,   -- ✅ collect all images
        IFNULL(AVG(r.star), 0) AS rating,
        COUNT(r.id) AS reviews
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.category_id = ?
      GROUP BY p.id, p.category_id, p.title, p.description, p.stocks, p.price, 
               p.image, p.created_at, p.updated_at
      ORDER BY p.created_at DESC
    `;

    let [products] = await con.execute(query, [categoryId]);
// console.log(products.title)
    // Convert extra_images string into an array
    products = products.map(p => ({
      ...p,
      extra_images: p.extra_images ? p.extra_images.split(",") : []
    }));

    res.json({ products });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    // ✅ Fetch product with category details (only one row because products.id is unique)
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

    // ✅ Fetch additional images in separate query (avoids duplicate products)
    const [additionalImages] = await con.execute(
      "SELECT id, product_id, image_url FROM product_images WHERE product_id = ? ORDER BY id ASC",
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




router.get("/products", async (req, res) => {
  try {
    console.log('hit')
    const con = getConnection();

    const query = `
      SELECT 
        p.id, 
        p.category_id, 
        p.title, 
        p.description, 
        p.stocks, 
        p.price, 
        p.image,
        p.created_at, 
        p.updated_at,
        c.name as category_name,
        pi.image_url AS extra_image,

        -- aggregate reviews
        IFNULL(AVG(r.star), 0) AS rating,
        COUNT(r.id) AS reviews

      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id

      GROUP BY p.id, p.category_id, p.title, p.description, p.stocks, p.price, 
               p.image, p.created_at, p.updated_at, c.name, pi.image_url

      ORDER BY p.created_at DESC
    `;

    const [products] = await con.execute(query);
console.log(products)
    console.log(`Fetched ${products.length} products`);

    res.json({
      products,
      totalProducts: products.length,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});







router.post("/reviews", verifyToken, upload.array('images', 5), async (req, res) => {
  const { product_id, star, comment } = req.body;
  const user_id = req.user.id;
  const con = getConnection()

  try {
    const [rows] = await con.execute(
      "SELECT id FROM reviews WHERE product_id = ? AND user_id = ?",
      [product_id, user_id]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: "Review already submitted" });
    }

    // insert new review
    const [result] = await con.execute(
      "INSERT INTO reviews (product_id, user_id, star, comment, created_at) VALUES (?, ?, ?, ?, NOW())",
      [product_id, user_id, star, comment]
    );

    const reviewId = result.insertId;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await con.execute(
          "INSERT INTO review_images (review_id, image_url, created_at) VALUES (?, ?, NOW())",
          [reviewId, file.filename]
        );
      }
    }

    return res.status(201).json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("❌ Error submitting review:", error);
    return res.status(500).json({ message: "Error submitting review" });
  }
});




router.get("/reviews/:productId", async (req, res) => {
  try {
    const con = getConnection()
    const { productId } = req.params
    const { page = 1, limit = 5 } = req.query
    const offset = (page - 1) * limit

    // Get reviews with pagination - Fixed: Use string concatenation for LIMIT and OFFSET
    const [reviews] = await con.execute(
      `SELECT r.id, r.product_id, r.user_id, r.star, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      [productId]
    )

    // Get images for each review
    for (let review of reviews) {
      const [images] = await con.execute(
        "SELECT id, image_url FROM review_images WHERE review_id = ? ORDER BY created_at ASC",
        [review.id]
      )
      review.images = images
    }

    // Get total count for pagination
    const [countResult] = await con.execute(
      "SELECT COUNT(*) as total FROM reviews WHERE product_id = ?",
      [productId]
    )
    const totalReviews = countResult[0].total

    // Get average rating
    const [ratingResult] = await con.execute(
      "SELECT AVG(star) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = ?",
      [productId]
    )

    res.json({ 
      success: true, 
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNextPage: page < Math.ceil(totalReviews / limit),
        hasPrevPage: page > 1
      },
      rating: {
        average: parseFloat(ratingResult[0].average_rating || 0).toFixed(1),
        total: ratingResult[0].total_reviews
      }
    })
  } catch (error) {
    console.error("❌ Get reviews error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Get all reviews for a product (for dedicated reviews page)
router.get("/reviews/:productId/all", async (req, res) => {
  try {
    const con = getConnection()
    const { productId } = req.params
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    // Get reviews with pagination - Fixed: Use string concatenation for LIMIT and OFFSET
    const [reviews] = await con.execute(
      `SELECT r.id, r.product_id, r.user_id, r.star, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      [productId]
    )


    // Get images for each review
    for (let review of reviews) {
      const [images] = await con.execute(
        "SELECT id, image_url FROM review_images WHERE review_id = ? ORDER BY created_at ASC",
        [review.id]
      )
      review.images = images
    }

    // Get total count for pagination
    const [countResult] = await con.execute(
      "SELECT COUNT(*) as total FROM reviews WHERE product_id = ?",
      [productId]
    )
    const totalReviews = countResult[0].total

    // Get average rating and rating distribution
    const [ratingResult] = await con.execute(
      `SELECT 
        AVG(star) as average_rating, 
        COUNT(*) as total_reviews,
        SUM(CASE WHEN star = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN star = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN star = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN star = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN star = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews WHERE product_id = ?`,
      [productId]
    )

    // Get product info
    const [productResult] = await con.execute(
      "SELECT id, title, image FROM products WHERE id = ?",
      [productId]
    )

    res.json({ 
      success: true, 
      reviews,
      product: productResult[0],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNextPage: page < Math.ceil(totalReviews / limit),
        hasPrevPage: page > 1
      },
      rating: {
        average: parseFloat(ratingResult[0].average_rating || 0).toFixed(1),
        total: ratingResult[0].total_reviews,
        distribution: {
          five: ratingResult[0].five_star,
          four: ratingResult[0].four_star,
          three: ratingResult[0].three_star,
          two: ratingResult[0].two_star,
          one: ratingResult[0].one_star
        }
      }
    })
  } catch (error) {
    console.error("❌ Get all reviews error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})



module.exports = router
