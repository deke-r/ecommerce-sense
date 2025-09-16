const express = require("express")
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

// Get all active coupons (public)
router.get("/", async (req, res) => {
  try {
    const con = getConnection()
    const [coupons] = await con.execute(`
      SELECT id, code, description, discount_type, discount_value, 
             min_order_amount, max_discount_amount, valid_until
      FROM coupons 
      WHERE is_active = 1 
        AND (valid_until IS NULL OR valid_until > NOW())
        AND (usage_limit IS NULL OR used_count < usage_limit)
      ORDER BY created_at DESC
    `)

    res.json({ coupons })
  } catch (error) {
    console.error("Get coupons error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Validate coupon code
router.post("/validate", verifyToken, async (req, res) => {
  try {
    const { code, orderAmount } = req.body

    if (!code || !orderAmount) {
      return res.status(400).json({ message: "Coupon code and order amount are required" })
    }

    const con = getConnection()

    // Get coupon details
    const [coupons] = await con.execute(`
      SELECT id, code, description, discount_type, discount_value, 
             min_order_amount, max_discount_amount, usage_limit, used_count
      FROM coupons 
      WHERE code = ? AND is_active = 1
        AND (valid_until IS NULL OR valid_until > NOW())
    `, [code])

    if (coupons.length === 0) {
      return res.status(404).json({ message: "Invalid or expired coupon code" })
    }

    const coupon = coupons[0]

    // Check if coupon has usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: "Coupon usage limit exceeded" })
    }

    // Check minimum order amount
    if (orderAmount < coupon.min_order_amount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon` 
      })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderAmount * coupon.discount_value) / 100
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount
      }
    } else {
      discountAmount = coupon.discount_value
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount)

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount
      }
    })
  } catch (error) {
    console.error("Validate coupon error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Apply coupon to order
router.post("/apply", verifyToken, async (req, res) => {
  try {
    const { couponId, orderId } = req.body

    if (!couponId || !orderId) {
      return res.status(400).json({ message: "Coupon ID and Order ID are required" })
    }

    const con = getConnection()

    // Check if coupon is already used by this user for this order
    const [existingUsage] = await con.execute(`
      SELECT id FROM coupon_usage 
      WHERE user_id = ? AND coupon_id = ? AND order_id = ?
    `, [req.user.id, couponId, orderId])

    if (existingUsage.length > 0) {
      return res.status(400).json({ message: "Coupon already applied to this order" })
    }

    // Record coupon usage
    await con.execute(`
      INSERT INTO coupon_usage (coupon_id, user_id, order_id) 
      VALUES (?, ?, ?)
    `, [couponId, req.user.id, orderId])

    // Update coupon usage count
    await con.execute(`
      UPDATE coupons 
      SET used_count = used_count + 1 
      WHERE id = ?
    `, [couponId])

    res.json({ message: "Coupon applied successfully" })
  } catch (error) {
    console.error("Apply coupon error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Admin routes for coupon management
router.post("/admin", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" })
    }

    const { 
      code, 
      description, 
      discount_type, 
      discount_value, 
      min_order_amount = 0, 
      max_discount_amount = null, 
      usage_limit = null, 
      valid_until = null 
    } = req.body

    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ message: "Code, discount type, and discount value are required" })
    }

    const con = getConnection()

    const [result] = await con.execute(`
      INSERT INTO coupons (code, description, discount_type, discount_value, 
                          min_order_amount, max_discount_amount, usage_limit, valid_until)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until])

    res.status(201).json({
      message: "Coupon created successfully",
      coupon: {
        id: result.insertId,
        code,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_discount_amount,
        usage_limit,
        valid_until
      }
    })
  } catch (error) {
    console.error("Create coupon error:", error)
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: "Coupon code already exists" })
    } else {
      res.status(500).json({ message: "Server error" })
    }
  }
})

// Get all coupons (admin)
router.get("/admin", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" })
    }

    const con = getConnection()
    const [coupons] = await con.execute(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM coupon_usage cu WHERE cu.coupon_id = c.id) as total_used
      FROM coupons c
      ORDER BY c.created_at DESC
    `)

    res.json({ coupons })
  } catch (error) {
    console.error("Get all coupons error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update coupon (admin)
router.put("/admin/:id", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params
    const { 
      code, 
      description, 
      discount_type, 
      discount_value, 
      min_order_amount, 
      max_discount_amount, 
      usage_limit, 
      valid_until,
      is_active 
    } = req.body

    const con = getConnection()

    const [result] = await con.execute(`
      UPDATE coupons 
      SET code = ?, description = ?, discount_type = ?, discount_value = ?,
          min_order_amount = ?, max_discount_amount = ?, usage_limit = ?,
          valid_until = ?, is_active = ?
      WHERE id = ?
    `, [code, description, discount_type, discount_value, min_order_amount, 
        max_discount_amount, usage_limit, valid_until, is_active, id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Coupon not found" })
    }

    res.json({ message: "Coupon updated successfully" })
  } catch (error) {
    console.error("Update coupon error:", error)
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: "Coupon code already exists" })
    } else {
      res.status(500).json({ message: "Server error" })
    }
  }
})

// Delete coupon (admin)
router.delete("/admin/:id", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params
    const con = getConnection()

    const [result] = await con.execute("DELETE FROM coupons WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Coupon not found" })
    }

    res.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Delete coupon error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
