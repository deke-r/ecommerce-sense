const express = require("express")
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

// Add new address
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, phone, street, city, pincode, state } = req.body

    if (!name || !phone || !street || !city || !pincode || !state) {
      return res.status(400).json({ message: "All address fields are required" })
    }

    const con = getConnection()
    const [result] = await con.execute(
      "INSERT INTO addresses (user_id, name, phone, street, city, pincode, state) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, name, phone, street, city, pincode, state],
    )

    res.status(201).json({
      message: "Address added successfully",
      address: {
        id: result.insertId,
        name,
        phone,
        street,
        city,
        pincode,
        state,
      },
    })
  } catch (error) {
    console.error("Add address error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user addresses
router.get("/", verifyToken, async (req, res) => {
  try {
    const con = getConnection()
    const [addresses] = await con.execute("SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC", [
      req.user.id,
    ])

    res.json({ addresses })
  } catch (error) {
    console.error("Get addresses error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update address
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, street, city, pincode, state } = req.body

    const con = getConnection()

    // Check if address belongs to user
    const [existingAddresses] = await con.execute("SELECT id FROM addresses WHERE id = ? AND user_id = ?", [
      id,
      req.user.id,
    ])

    if (existingAddresses.length === 0) {
      return res.status(404).json({ message: "Address not found" })
    }

    await con.execute(
      "UPDATE addresses SET name = ?, phone = ?, street = ?, city = ?, pincode = ?, state = ? WHERE id = ?",
      [name, phone, street, city, pincode, state, id],
    )

    res.json({ message: "Address updated successfully" })
  } catch (error) {
    console.error("Update address error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete address
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const con = getConnection()

    // Check if address belongs to user
    const [existingAddresses] = await con.execute("SELECT id FROM addresses WHERE id = ? AND user_id = ?", [
      id,
      req.user.id,
    ])

    if (existingAddresses.length === 0) {
      return res.status(404).json({ message: "Address not found" })
    }

    await con.execute("DELETE FROM addresses WHERE id = ?", [id])

    res.json({ message: "Address deleted successfully" })
  } catch (error) {
    console.error("Delete address error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
