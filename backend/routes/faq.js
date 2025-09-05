const express = require("express")
const { getConnection } = require("../config/database")

const router = express.Router()

// Get all FAQs
router.get("/", async (req, res) => {
  try {
    const con = getConnection()
    const [faqs] = await con.execute(
      "SELECT * FROM faqs WHERE is_active = 1 ORDER BY display_order ASC"
    )

    res.json({ faqs })
  } catch (error) {
    console.error("Get FAQs error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
