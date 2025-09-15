const express = require("express")
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")
const cartAbandonmentService = require("../services/cartAbandonmentService")

const router = express.Router()

// Get cart items
router.get("/", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const [cartItems] = await con.execute(
      `
      SELECT c.id, c.quantity, p.id as product_id, p.title, p.price, p.image, p.stocks
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `,
      [req.user.id],
    )

    // Track cart abandonment for non-empty carts
    if (cartItems.length > 0) {
      await cartAbandonmentService.trackCartUpdate(req.user.id, cartItems)
    }

    res.json({ cartItems })
  } catch (error) {
    console.error("Get cart error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add to cart
router.post("/", verifyToken, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" })
    }

    const con = getConnection()

    // Check if product exists and get stock information
    const [products] = await con.execute("SELECT id, stocks FROM products WHERE id = ?", [product_id])

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    const product = products[0]
    
    // Check if product is out of stock
    if (product.stocks <= 0) {
      return res.status(400).json({ message: "Product is out of stock" })
    }

    // Check if item already in cart
    const [existingItems] = await con.execute("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?", [
      req.user.id,
      product_id,
    ])

    if (existingItems.length > 0) {
      // Check if adding this quantity would exceed stock
      const newQuantity = existingItems[0].quantity + quantity
      if (newQuantity > product.stocks) {
        return res.status(400).json({ 
          message: `Only ${product.stocks} items available in stock. You already have ${existingItems[0].quantity} in your cart.` 
        })
      }
      // Update quantity
      await con.execute("UPDATE cart SET quantity = ? WHERE id = ?", [newQuantity, existingItems[0].id])
    } else {
      // Check if requested quantity exceeds stock
      if (quantity > product.stocks) {
        return res.status(400).json({ 
          message: `Only ${product.stocks} items available in stock` 
        })
      }
      // Add new item
      await con.execute("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", [
        req.user.id,
        product_id,
        quantity,
      ])
    }

    // Get updated cart items for tracking
    const [updatedCartItems] = await con.execute(
      `
      SELECT c.id, c.quantity, p.id as product_id, p.title, p.price, p.image, p.stocks
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `,
      [req.user.id],
    )

    // Track cart abandonment
    if (updatedCartItems.length > 0) {
      await cartAbandonmentService.trackCartUpdate(req.user.id, updatedCartItems)
    }

    res.json({ message: "Item added to cart successfully" })
  } catch (error) {
    console.error("Add to cart error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update cart item quantity
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Valid quantity is required" })
    }

    const con = getConnection()

    // Check if cart item belongs to user and get product stock
    const [cartItems] = await con.execute(
      `SELECT c.id, c.product_id, p.stocks 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.id = ? AND c.user_id = ?`, 
      [id, req.user.id]
    )

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "Cart item not found" })
    }

    const cartItem = cartItems[0]
    
    // Check if requested quantity exceeds stock
    if (quantity > cartItem.stocks) {
      return res.status(400).json({ 
        message: `Only ${cartItem.stocks} items available in stock` 
      })
    }

    await con.execute("UPDATE cart SET quantity = ? WHERE id = ?", [quantity, id])

    // Get updated cart items for tracking
    const [updatedCartItems] = await con.execute(
      `
      SELECT c.id, c.quantity, p.id as product_id, p.title, p.price, p.image, p.stocks
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `,
      [req.user.id],
    )

    // Track cart abandonment
    if (updatedCartItems.length > 0) {
      await cartAbandonmentService.trackCartUpdate(req.user.id, updatedCartItems)
    }

    res.json({ message: "Cart updated successfully" })
  } catch (error) {
    console.error("Update cart error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Remove from cart
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    // Check if cart item belongs to user
    const [cartItems] = await con.execute("SELECT id FROM cart WHERE id = ? AND user_id = ?", [id, req.user.id])

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "Cart item not found" })
    }

    await con.execute("DELETE FROM cart WHERE id = ?", [id])

    // Get updated cart items for tracking
    const [updatedCartItems] = await con.execute(
      `
      SELECT c.id, c.quantity, p.id as product_id, p.title, p.price, p.image, p.stocks
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `,
      [req.user.id],
    )

    // Track cart abandonment (even if empty, to reset tracking)
    await cartAbandonmentService.trackCartUpdate(req.user.id, updatedCartItems)

    res.json({ message: "Item removed from cart successfully" })
  } catch (error) {
    console.error("Remove from cart error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
