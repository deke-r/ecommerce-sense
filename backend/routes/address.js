const express = require("express")
const router = express.Router()
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")

// GET /api/addresses - Get all addresses for authenticated user
router.get("/", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const userId = req.user.id

    const [addresses] = await con.execute(
      `SELECT id, user_id, full_name, phone, street, landmark, city, state, pincode, is_default, created_at, updated_at 
       FROM addresses 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId],
    )

    res.json({ success: true, addresses })
  } catch (error) {
    console.error("Get addresses error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// POST /api/addresses - Add new address
router.post("/", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const user_id = req.user.id
    const { full_name, phone, street, landmark, city, state, pincode, is_default } = req.body

    // If this is set as default, remove default from other addresses
    if (is_default) {
      await con.execute("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [user_id])
    }

    const [result] = await con.execute(
      `INSERT INTO addresses (user_id, full_name, phone, street, landmark, city, state, pincode, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, full_name, phone, street, landmark || null, city, state, pincode, is_default || false],
    )

    res.json({ success: true, message: "Address added successfully", addressId: result.insertId })
  } catch (error) {
    console.error("Add address error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// PUT /api/addresses/:id - Update address
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const addressId = req.params.id
    const user_id = req.user.id
    const { full_name, phone, street, landmark, city, state, pincode, is_default } = req.body

    const [existingAddress] = await con.execute("SELECT user_id FROM addresses WHERE id = ?", [addressId])
    if (existingAddress.length === 0 || existingAddress[0].user_id !== user_id) {
      return res.status(403).json({ success: false, message: "Access denied. Address not found or not owned by user." })
    }

    // If this is set as default, remove default from other addresses
    if (is_default) {
      await con.execute("UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?", [user_id, addressId])
    }

    await con.execute(
      `UPDATE addresses 
       SET full_name = ?, phone = ?, street = ?, landmark = ?, city = ?, state = ?, pincode = ?, is_default = ?
       WHERE id = ?`,
      [full_name, phone, street, landmark || null, city, state, pincode, is_default || false, addressId],
    )

    res.json({ success: true, message: "Address updated successfully" })
  } catch (error) {
    console.error("Update address error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// DELETE /api/addresses/:id - Delete address
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const addressId = req.params.id
    const user_id = req.user.id

    const [existingAddress] = await con.execute("SELECT user_id FROM addresses WHERE id = ?", [addressId])
    if (existingAddress.length === 0 || existingAddress[0].user_id !== user_id) {
      return res.status(403).json({ success: false, message: "Access denied. Address not found or not owned by user." })
    }

    await con.execute("DELETE FROM addresses WHERE id = ?", [addressId])

    res.json({ success: true, message: "Address deleted successfully" })
  } catch (error) {
    console.error("Delete address error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// PATCH /api/address/:id/default - Set address as default
router.patch("/:id/default", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const addressId = req.params.id
    const user_id = req.user.id

    const [existingAddress] = await con.execute("SELECT user_id FROM addresses WHERE id = ?", [addressId])
    if (existingAddress.length === 0 || existingAddress[0].user_id !== user_id) {
      return res.status(403).json({ success: false, message: "Access denied. Address not found or not owned by user." })
    }

    // Remove default from all user's addresses
    await con.execute("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [user_id])

    // Set this one as default
    await con.execute("UPDATE addresses SET is_default = TRUE WHERE id = ?", [addressId])

    res.json({ success: true, message: "Default address updated successfully" })
  } catch (error) {
    console.error("Set default address error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})


module.exports = router
