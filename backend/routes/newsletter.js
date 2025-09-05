const express = require("express")
const { getConnection } = require("../config/database")

const router = express.Router()

// Subscribe to newsletter
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body
    const con = getConnection()

    // Check if already subscribed
    const [existing] = await con.execute(
      "SELECT id FROM newsletter_subscribers WHERE email = ?",
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already subscribed" })
    }

    // Add to newsletter
    await con.execute(
      "INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, NOW())",
      [email]
    )

    res.json({ message: "Successfully subscribed to newsletter" })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Unsubscribe from newsletter
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body
    const con = getConnection()

    const [result] = await con.execute(
      "DELETE FROM newsletter_subscribers WHERE email = ?",
      [email]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Email not found" })
    }

    res.json({ message: "Successfully unsubscribed from newsletter" })
  } catch (error) {
    console.error("Newsletter unsubscription error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router