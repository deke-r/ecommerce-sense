const express = require("express")
const bcrypt = require("bcryptjs")
const { getConnection } = require("../config/database")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

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

module.exports = router
