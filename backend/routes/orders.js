const express = require("express")
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

// Place order
router.post("/", verifyToken, async (req, res) => {
  try {
    const { address_id } = req.body

    if (!address_id) {
      return res.status(400).json({ message: "Address is required" })
    }

    const con = getConnection()

    // Get cart items
    const [cartItems] = await con.execute(
      `
      SELECT c.product_id, c.quantity, p.price
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `,
      [req.user.id],
    )

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" })
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Start transaction
    await con.execute("START TRANSACTION")

    try {
      // Create order
      const [orderResult] = await con.execute("INSERT INTO orders (user_id, total) VALUES (?, ?)", [req.user.id, total])

      const orderId = orderResult.insertId

      // Add order items
      for (const item of cartItems) {
        await con.execute("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
        ])
      }

      // Clear cart
      await con.execute("DELETE FROM cart WHERE user_id = ?", [req.user.id])

      // Commit transaction
      await con.execute("COMMIT")

      res.status(201).json({
        message: "Order placed successfully",
        order: {
          id: orderId,
          total,
          status: "pending",
        },
      })
    } catch (error) {
      // Rollback transaction
      await con.execute("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Place order error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user orders
router.get("/", verifyToken, async (req, res) => {
  try {
    const con = getConnection()

    const [orders] = await con.execute(
      `
      SELECT o.id, o.order_date, o.status, o.total,
             GROUP_CONCAT(CONCAT(p.title, ' (', oi.quantity, ')') SEPARATOR ', ') as products
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.order_date DESC
    `,
      [req.user.id],
    )

    res.json({ orders })
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get order details
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    // Get order
    const [orders] = await con.execute("SELECT * FROM orders WHERE id = ? AND user_id = ?", [id, req.user.id])

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Get order items
    const [orderItems] = await con.execute(
      `
      SELECT oi.quantity, oi.price, p.title, p.image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `,
      [id],
    )

    res.json({
      order: orders[0],
      items: orderItems,
    })
  } catch (error) {
    console.error("Get order details error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
