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
      SELECT c.id, c.quantity, c.selected_size, c.selected_color, p.id as product_id, p.title, p.price, p.image, p.stocks
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
    const { product_id, quantity = 1, selected_size = null, selected_color = null } = req.body

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" })
    }

    const con = getConnection()

    // Check if product exists and get stock information
    const [products] = await con.execute("SELECT id, stocks, has_sizes FROM products WHERE id = ?", [product_id])

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    const product = products[0]

    // Check if size is required but not provided
    if (product.has_sizes && !selected_size) {
      return res.status(400).json({ message: "Size selection is required for this product" })
    }

    // If size is selected, check if it's available
    if (selected_size) {
      const [sizes] = await con.execute(
        "SELECT stock_quantity FROM product_sizes WHERE product_id = ? AND size_value = ? AND is_available = 1",
        [product_id, selected_size]
      )
      
      if (sizes.length === 0) {
        return res.status(400).json({ message: "Selected size is not available" })
      }
      
      if (sizes[0].stock_quantity < quantity) {
        return res.status(400).json({ message: `Only ${sizes[0].stock_quantity} items available in size ${selected_size}` })
      }
    } else {
      // Check general stock
      if (product.stocks < quantity) {
        return res.status(400).json({ message: `Only ${product.stocks} items available` })
      }
    }

    // Check if item already exists in cart with same size and color (NULL-safe)
    const [existingItems] = await con.execute(
      "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND (selected_size <=> ?) AND (selected_color <=> ?)",
      [req.user.id, product_id, selected_size, selected_color]
    )

    if (existingItems.length > 0) {
      // Update existing item
      const newQuantity = existingItems[0].quantity + quantity

      // Recheck stock again for updated quantity
      if (selected_size) {
        const [sizes] = await con.execute(
          "SELECT stock_quantity FROM product_sizes WHERE product_id = ? AND size_value = ? AND is_available = 1",
          [product_id, selected_size]
        )
        if (sizes[0].stock_quantity < newQuantity) {
          return res.status(400).json({ message: `Only ${sizes[0].stock_quantity} items available in size ${selected_size}` })
        }
      } else {
        if (product.stocks < newQuantity) {
          return res.status(400).json({ message: `Only ${product.stocks} items available` })
        }
      }

      await con.execute(
        "UPDATE cart SET quantity = ? WHERE id = ?",
        [newQuantity, existingItems[0].id]
      )
    } else {
      // Add new item
      await con.execute(
        "INSERT INTO cart (user_id, product_id, quantity, selected_size, selected_color) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, product_id, quantity, selected_size, selected_color]
      )
    }

    res.json({ message: "Item added to cart successfully" })
  } catch (error) {
    console.error("Add to cart error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add to cart by product ID (for direct product page calls)
router.post("/add/:productId", verifyToken, async (req, res) => {
  try {
    const { productId } = req.params
    const { quantity = 1, selected_size = null, selected_color = null } = req.body

    const con = getConnection()

    // Check if product exists and get stock information
    const [products] = await con.execute("SELECT id, stocks, has_sizes FROM products WHERE id = ?", [productId])

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    const product = products[0]

    // Check if size is required but not provided
    if (product.has_sizes && !selected_size) {
      return res.status(400).json({ message: "Size selection is required for this product" })
    }

    // If size is selected, check if it's available
    if (selected_size) {
      const [sizes] = await con.execute(
        "SELECT stock_quantity FROM product_sizes WHERE product_id = ? AND size_value = ? AND is_available = 1",
        [productId, selected_size]
      )
      
      if (sizes.length === 0) {
        return res.status(400).json({ message: "Selected size is not available" })
      }
      
      if (sizes[0].stock_quantity < quantity) {
        return res.status(400).json({ message: `Only ${sizes[0].stock_quantity} items available in size ${selected_size}` })
      }
    } else {
      // Check general stock
      if (product.stocks < quantity) {
        return res.status(400).json({ message: `Only ${product.stocks} items available` })
      }
    }

    // Check if item already exists in cart with same size and color (NULL-safe)
    const [existingItems] = await con.execute(
      "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND (selected_size <=> ?) AND (selected_color <=> ?)",
      [req.user.id, productId, selected_size, selected_color]
    )

    if (existingItems.length > 0) {
      // Update existing item
      const newQuantity = existingItems[0].quantity + quantity

      if (selected_size) {
        const [sizes] = await con.execute(
          "SELECT stock_quantity FROM product_sizes WHERE product_id = ? AND size_value = ? AND is_available = 1",
          [productId, selected_size]
        )
        if (sizes[0].stock_quantity < newQuantity) {
          return res.status(400).json({ message: `Only ${sizes[0].stock_quantity} items available in size ${selected_size}` })
        }
      } else if (product.stocks < newQuantity) {
        return res.status(400).json({ message: `Only ${product.stocks} items available` })
      }

      await con.execute(
        "UPDATE cart SET quantity = ? WHERE id = ?",
        [newQuantity, existingItems[0].id]
      )
    } else {
      // Add new item
      await con.execute(
        "INSERT INTO cart (user_id, product_id, quantity, selected_size, selected_color) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, productId, quantity, selected_size, selected_color]
      )
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
      return res.status(400).json({ message: "Quantity must be at least 1" })
    }

    const con = getConnection()

    // Get cart item with product info
    const [cartItems] = await con.execute(
      `
      SELECT c.*, p.stocks, p.has_sizes
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.id = ? AND c.user_id = ?
    `,
      [id, req.user.id],
    )

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "Cart item not found" })
    }

    const cartItem = cartItems[0]

    // Check stock availability
    if (cartItem.selected_size) {
      const [sizes] = await con.execute(
        "SELECT stock_quantity FROM product_sizes WHERE product_id = ? AND size_value = ? AND is_available = 1",
        [cartItem.product_id, cartItem.selected_size]
      )
      
      if (sizes.length === 0) {
        return res.status(400).json({ message: "Selected size is no longer available" })
      }
      
      if (sizes[0].stock_quantity < quantity) {
        return res.status(400).json({ message: `Only ${sizes[0].stock_quantity} items available in size ${cartItem.selected_size}` })
      }
    } else {
      if (cartItem.stocks < quantity) {
        return res.status(400).json({ message: `Only ${cartItem.stocks} items available` })
      }
    }

    await con.execute("UPDATE cart SET quantity = ? WHERE id = ?", [quantity, id])

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

    const [result] = await con.execute(
      "DELETE FROM cart WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" })
    }

    res.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Remove from cart error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Clear cart
router.delete("/", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    await con.execute("DELETE FROM cart WHERE user_id = ?", [req.user.id])

    res.json({ message: "Cart cleared successfully" })
  } catch (error) {
    console.error("Clear cart error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router