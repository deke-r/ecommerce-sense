const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Add these route imports to your existing server.js file

const wishlistRoutes = require('./routes/wishlist')
const recentlyViewedRoutes = require('./routes/recentlyViewed')
const newsletterRoutes = require('./routes/newsletter')
const contactRoutes = require('./routes/contact')
const faqRoutes = require('./routes/faq')
const analyticsRoutes = require('./routes/analytics')

// Add these route uses
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/recently-viewed', recentlyViewedRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/faq', faqRoutes)
app.use('/api/analytics', analyticsRoutes)

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/products", require("./routes/products"))
app.use("/api/cart", require("./routes/cart"))
app.use("/api/orders", require("./routes/orders"))
app.use("/api/address", require("./routes/address"))
app.use("/api/user", require("./routes/user"))
app.use("/api/admin", require("./routes/admin"))

// Health check
app.get("/", (req, res) => {
  res.json({ message: "E-commerce API is running!" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
