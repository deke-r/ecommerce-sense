const express = require("express")
const { getConnection } = require("../config/database")

const router = express.Router()

// Submit contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    const con = getConnection()

    await con.execute(
      "INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())",
      [name, email, subject, message]
    )

    res.json({ message: "Message sent successfully" })
  } catch (error) {
    console.error("Contact form error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
